// src/components/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../css/AdminPanel.css';

const AdminPanel = ({ session }) => {
  const [profile, setProfile] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAdminAndFetchIssues = async () => {
      setLoading(true);

      // ✅ Step 1: Profile fetch + role check
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profileData || profileData.role !== 'admin') {
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // ✅ Step 2: Issues fetch
      const { data: issuesData, error: issuesError } = await supabase
        .from('civic_issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (issuesError) {
        setError('Could not fetch issues.');
      } else if (issuesData) {
        setIssues(issuesData);
      }

      setLoading(false);
    };

    if (session) {
      checkAdminAndFetchIssues();
    }
  }, [session]);

  // ✅ Status change handler
  const handleStatusChange = async (issueId, newStatus) => {
    const { error } = await supabase
      .from('civic_issues')
      .update({ status: newStatus })
      .eq('id', issueId);

    if (error) {
      alert('Error updating status: ' + error.message);
    } else {
      // Local state update for instant UI feedback
      setIssues((prevIssues) =>
        prevIssues.map((issue) =>
          issue.id === issueId ? { ...issue, status: newStatus } : issue
        )
      );
    }
  };

  // ✅ Loading state
  if (loading) return <p>Loading Admin Panel...</p>;

  // ✅ Non-admin users
  if (!profile) {
    return (
      <div className="access-denied">
        <h2>🚫 Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  // ✅ Error state
  if (error) return <p className="error-message">{error}</p>;

  // ✅ Main Admin Panel
  return (
    <div className="admin-panel-container">
      <h2>All Reported Issues ({issues.length})</h2>
      <div className="issues-list">
        {issues.map((issue) => (
          <div key={issue.id} className="admin-issue-card">
            <h4>{issue.title}</h4>
            <p>
              <strong>Author:</strong> {issue.author_name}
            </p>
            <p>
              <strong>Category:</strong> {issue.category}
            </p>
            <p className="status-container">
              <strong>Status:</strong>{' '}
              <span
                className={`status-badge status-${issue.status?.toLowerCase()}`}
              >
                {issue.status}
              </span>
            </p>
            <small>
              Reported on: {new Date(issue.created_at).toLocaleDateString()}
            </small>

            {/* ✅ Status Dropdown */}
            <div className="status-changer">
              <label htmlFor={`status-select-${issue.id}`}>
                Change Status:
              </label>
              <select
                id={`status-select-${issue.id}`}
                value={issue.status || 'Pending'}
                onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                className="status-select"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
