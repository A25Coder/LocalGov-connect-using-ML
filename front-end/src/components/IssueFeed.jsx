// src/components/IssueFeed.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../css/IssueFeed.css';
import { Link } from 'react-router-dom';

// Time ago utility
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
};

// Severity helper
const getSeverityInfo = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'high':
      return { label: 'Critical', className: 'severity-high' };
    case 'medium':
      return { label: 'Needs Attention', className: 'severity-medium' };
    default:
      return { label: 'Minor', className: 'severity-low' };
  }
};

// Categories for filtering
const categories = [
  { id: "road", name: "Roads & Potholes" },
  { id: "water", name: "Water" },
  { id: "electricity", name: "Electricity" },
  { id: "sanitation", name: "Sanitation" },
  { id: "nature", name: "Nature" },
  { id: "other", name: "Other" },
];

const IssueFeed = () => {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const [likedIssues, setLikedIssues] = useState(new Set());
  const [profiles, setProfiles] = useState({}); // user_id -> { name, avatar }

  // Sorting & Filters
  const [sortBy, setSortBy] = useState('created_at');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Fetch issues and likes
  useEffect(() => {
    const setupFeed = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);

        // Fetch issues
        const { data: issuesData, error: issuesError } = await supabase
          .from('civic_issues')
          .select('*')
          .order(sortBy, { ascending: false });
        if (issuesError) throw issuesError;
        setIssues(issuesData || []);

        // Fetch profiles
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url');
        if (profilesData) {
          const profileMap = {};
          profilesData.forEach(p => {
            profileMap[p.id] = { name: p.full_name, avatar: p.avatar_url };
          });
          setProfiles(profileMap);
        }

        // Fetch likes for current user
        if (currentSession) {
          const { data: likesData } = await supabase
            .from('likes')
            .select('issue_id')
            .eq('user_id', currentSession.user.id);

          setLikedIssues(new Set(likesData.map(like => like.issue_id)));
        }
      } catch (err) {
        console.error("Error loading feed:", err);
        setError("Failed to load issues. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    setupFeed();
  }, [sortBy]);

  // Filtering logic
  useEffect(() => {
    let result = issues;

    // Category filter
    if (categoryFilter !== 'All') {
      result = result.filter(issue => issue.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter(issue => issue.status === statusFilter);
    }

    setFilteredIssues(result);
  }, [categoryFilter, statusFilter, issues]);

  // Like toggle
  const handleLike = async (issueId) => {
    if (!session) return;
    const { data, error } = await supabase.rpc('toggle_like', { issue_id_to_toggle: issueId });
    if (error) console.error('Error toggling like:', error);
    else {
      const { liked, new_like_count } = data;
      setIssues(prev =>
        prev.map(issue => issue.id === issueId ? { ...issue, like_count: new_like_count } : issue)
      );
      setLikedIssues(prev => {
        const newSet = new Set(prev);
        liked ? newSet.add(issueId) : newSet.delete(issueId);
        return newSet;
      });
    }
  };

  if (loading) return <p style={{ textAlign: 'center', padding: '2rem' }}>Loading issues...</p>;
  if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;

  return (
    <div className="issue-feed-container">
      {/* Sorting */}
      <div className="sorter-container">
        <button onClick={() => setSortBy('created_at')} className={sortBy === 'created_at' ? 'active' : ''}>Latest</button>
        <button onClick={() => setSortBy('like_count')} className={sortBy === 'like_count' ? 'active' : ''}>Most Liked</button>
        <button onClick={() => setSortBy('view_count')} className={sortBy === 'view_count' ? 'active' : ''}>Most Viewed</button>
      </div>

      {/* Filters */}
      <div className="filters-container">
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="filter-select">
          <option value="All">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {/* Feed */}
      {filteredIssues.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <h2>No issues found.</h2>
          <p style={{ color: '#64748B' }}>Try changing the filters or sort order.</p>
        </div>
      ) : (
        filteredIssues.map(issue => {
          const severityInfo = getSeverityInfo(issue.severity);
          const profile = profiles[issue.user_id] || {};
          return (
            <div key={issue.id} className="post-card">
              {/* Severity badge */}
              {issue.severity && (
                <span className={`severity-badge-top ${severityInfo.className}`}>
                  {severityInfo.label}
                </span>
              )}

              {/* Header with avatar and name */}
              <div className="post-header">
                <div className="header-avatar">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} className="avatar-img" />
                  ) : (
                    <div className="avatar-placeholder">{profile.name ? profile.name[0] : 'A'}</div>
                  )}
                </div>
                <div className="header-name">{profile.name || 'Anonymous'}</div>
              </div>

              {/* Issue image */}
              {issue.image_url && (
                <img src={issue.image_url} alt={issue.title} className="post-image" />
              )}

              {/* Title & description */}
              <div className="post-content">
                <h4 className="post-title">{issue.title}</h4>
                <p className="post-description">{issue.description}</p>
              </div>

              {/* Actions */}
              <div className="post-actions">
                <button
                  onClick={() => handleLike(issue.id)}
                  className={`action-btn ${likedIssues.has(issue.id) ? 'liked' : ''}`}
                  disabled={!session}
                >
                  {likedIssues.has(issue.id) ? '❤️' : '♡'}
                </button>
                <Link to={`/issue/${issue.id}`} className="action-btn">💬</Link>
              </div>

              {/* Stats & timestamp */}
              <div className="post-stats">
                <span>{issue.like_count || 0} likes</span>
                <span>{issue.view_count || 0} views</span>
                <span className="post-timestamp">{timeAgo(issue.created_at)}</span>
              </div>

              <Link to={`/issue/${issue.id}`} className="post-comments-link">
                View details and comments
              </Link>
            </div>
          );
        })
      )}
    </div>
  );
};

export default IssueFeed;
