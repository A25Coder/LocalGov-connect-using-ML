// src/components/EditProfile.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
// Iske liye ek alag CSS file banayenge
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
                // Profile table se user ka data fetch karna
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single();

                if (error) {
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
            .update({ full_name: fullName })
            .eq('id', user.id);

        if (error) {
            setMessage('Error updating profile: ' + error.message);
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