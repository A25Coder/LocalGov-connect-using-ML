// src/components/Profile.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../css/Profile.css';
import ActivityModal from './ActivityModal';

const Profile = ({ session }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [isActivityModalOpen, setActivityModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [uploading, setUploading] = useState(false);

  // ✅ Fetch profile (upsert if missing)
  const fetchProfile = async () => {
    if (!session) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error.message);
      }

      // If no profile exists, create one using upsert
      if (!data) {
        const defaultProfile = {
          id: session.user.id,
          full_name: session.user.email, // default to email
          avatar_url: null,
          gov_category: null, // default for normal users
          created_at: new Date(),
          updated_at: new Date(),
        };

        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert(defaultProfile, { onConflict: ['id'] });

        if (upsertError) {
          console.error("Error creating profile:", upsertError.message);
        }
      }

      // Fetch again to ensure profile is loaded
      const { data: refreshedData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      setProfile(refreshedData);
    } catch (err) {
      console.error("Unexpected error:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [session]);

  // ✅ Update profile name
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const newName = e.target.fullName.value;

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: session.user.id,
        full_name: newName,
        updated_at: new Date(),
      }, { onConflict: ['id'] });

    if (error) {
      alert("Error updating profile: " + error.message);
    } else {
      await fetchProfile();
      setEditModalOpen(false);
    }
  };

  // ✅ Upload avatar
  const uploadAvatar = async (event) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    const filePath = `${session.user.id}/${Date.now()}-${file.name}`;

    setUploading(true);

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    await supabase
      .from('profiles')
      .update({ avatar_url: urlData.publicUrl, updated_at: new Date() })
      .eq('id', session.user.id);

    setProfile((prev) => ({ ...prev, avatar_url: urlData.publicUrl }));
    setUploading(false);
  };

  // ✅ Update password
  const handlePasswordUpdate = async () => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) alert('Error: ' + error.message);
    else alert('Password updated successfully!');
    setNewPassword('');
    setPasswordModalOpen(false);
  };

  // ✅ Logout
  const handleLogout = async () => await supabase.auth.signOut();

  if (loading) return <p>Loading profile...</p>;
  if (!session) return <p>Please log in to see your profile.</p>;

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <label htmlFor="avatar-upload" className="avatar-wrapper">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="avatar-img" />
          ) : (
            <div className="avatar-placeholder">
              {session.user.email[0].toUpperCase()}
            </div>
          )}
          <div className="edit-avatar-icon">✏️</div>
        </label>
        <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          style={{ display: 'none' }}
        />
        <h2 className="profile-name">{profile?.full_name || 'Set Your Name'}</h2>
        <p className="profile-email">{session.user.email}</p>
        {profile?.gov_category && (
          <p className="profile-gov-category">
            Role: {profile.gov_category.toUpperCase()} Official
          </p>
        )}
      </div>

      {/* Account Settings */}
      <div className="profile-card">
        <h3>Account</h3>
        <button onClick={() => setEditModalOpen(true)} className="profile-menu-item">Edit Profile</button>
        <button onClick={() => setPasswordModalOpen(true)} className="profile-menu-item">Change Password</button>
      </div>

      {/* General Settings */}
      <div className="profile-card">
        <h3>General</h3>
        <button onClick={() => setActivityModalOpen(true)} className="profile-menu-item">Your Activity</button>
        <button className="profile-menu-item">Help & Support</button>
        <button onClick={handleLogout} className="profile-menu-item logout-btn">Log Out</button>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Your Name</h3>
            <form onSubmit={handleUpdateProfile}>
              <input
                type="text"
                name="fullName"
                defaultValue={profile?.full_name}
                className="modal-input"
                placeholder="Enter your full name"
                required
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setEditModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Change Password</h3>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="modal-input"
              required
            />
            <div className="modal-actions">
              <button type="button" onClick={() => setPasswordModalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="button" onClick={handlePasswordUpdate} className="btn btn-primary">Update</button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {isActivityModalOpen && (
        <ActivityModal session={session} onClose={() => setActivityModalOpen(false)} />
      )}
    </div>
  );
};

export default Profile;
