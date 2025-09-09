// src/components/EditProfile.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../css/EditProfile.css'; 

const EditProfile = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUser(user);

        // Fetch profile row
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (error && error.code !== "PGRST116") {  // PGRST116 = no rows found
          console.error('Error fetching profile:', error);
        }

        if (profile) {
          setFullName(profile.full_name || '');
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id,                 // ✅ always include id
        full_name: fullName, 
        updated_at: new Date()       // optional if you have updated_at column
      });

    if (error) {
      setMessage('❌ Error updating profile: ' + error.message);
    } else {
      setMessage('✅ Profile updated successfully!');
    }
    setLoading(false);
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="edit-profile-container">
      <h2>Edit Your Profile</h2>
      <form onSubmit={handleUpdateProfile}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="text" value={user?.email || ''} disabled />
        </div>
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            required
          />
        </div>
        <button type="submit" className="save-btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default EditProfile;
