// src/components/IssueFeed.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../css/IssueFeed.css';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { Link } from 'react-router-dom';

// ✅ Time ago utility
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

const IssueFeed = () => {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const [likedIssues, setLikedIssues] = useState(new Set());

  // Sorting & Filters
  const [sortBy, setSortBy] = useState('created_at');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // ✅ Fetch Issues + Likes
  useEffect(() => {
    const setupFeed = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);

        const { data: issuesData, error: issuesError } = await supabase
          .from('civic_issues')
          .select('*')
          .order(sortBy, { ascending: false });

        if (issuesError) throw issuesError;
        setIssues(issuesData || []);

        if (currentSession) {
          const { data: likesData, error: likesError } = await supabase
            .from('likes')
            .select('issue_id')
            .eq('user_id', currentSession.user.id);
          if (likesError) throw likesError;
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

  // ✅ Filtering logic
  useEffect(() => {
    let result = issues;

    // Search
    if (searchQuery) {
      result = result.filter(issue =>
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (issue.author_name && issue.author_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (categoryFilter !== 'All') {
      result = result.filter(issue => issue.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter(issue => issue.status === statusFilter);
    }

    setFilteredIssues(result);
  }, [searchQuery, categoryFilter, statusFilter, issues]);

  // ✅ Like toggle
  const handleLike = async (issueId) => {
    if (!session) return;
    const { data, error } = await supabase.rpc('toggle_like', { issue_id_to_toggle: issueId });
    if (error) {
      console.error('Error toggling like:', error);
    } else {
      const { liked, new_like_count } = data;
      setIssues(prevIssues =>
        prevIssues.map(issue =>
          issue.id === issueId ? { ...issue, like_count: new_like_count } : issue
        )
      );
      setLikedIssues(prevLiked => {
        const newLiked = new Set(prevLiked);
        if (liked) newLiked.add(issueId);
        else newLiked.delete(issueId);
        return newLiked;
      });
    }
  };

  // ✅ Loading Skeleton
  if (loading) {
    return (
      <div className="issue-feed-container">
        <SkeletonTheme baseColor="var(--border-color)" highlightColor="var(--card-background)">
          {[1, 2, 3].map(n => (
            <div className="post-card" key={n}>
              <div className="post-header">
                <Skeleton circle width={32} height={32} />
                <Skeleton width={150} />
              </div>
              <Skeleton height={250} style={{ lineHeight: 2 }} />
              <div style={{ padding: '1rem' }}>
                <Skeleton count={2} />
              </div>
            </div>
          ))}
        </SkeletonTheme>
      </div>
    );
  }

  if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;

  // ✅ Main Render
  return (
    <div className="issue-feed-container">
      {/* Sorting */}
      <div className="sorter-container">
        <button onClick={() => setSortBy('created_at')} className={sortBy === 'created_at' ? 'active' : ''}>Latest</button>
        <button onClick={() => setSortBy('like_count')} className={sortBy === 'like_count' ? 'active' : ''}>Most Liked</button>
        <button onClick={() => setSortBy('view_count')} className={sortBy === 'view_count' ? 'active' : ''}>Most Viewed</button>
      </div>

      {/* Search */}
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search issues by title or author..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="filters-container">
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="filter-select">
          <option value="All">All Categories</option>
          <option value="Roads & Potholes">Roads & Potholes</option>
          <option value="Waste Management">Waste Management</option>
          <option value="Water & Sewage">Water & Sewage</option>
          <option value="Electricity & Lights">Electricity & Lights</option>
          <option value="Public Parks">Public Parks</option>
          <option value="Other">Other</option>
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
          <p style={{ color: '#64748B' }}>Try changing the search, filters or sort order.</p>
        </div>
      ) : (
        filteredIssues.map((issue) => (
          <div key={issue.id} className="post-card">
            <div className="post-header">
              <div className="header-avatar">{issue.author_name ? issue.author_name[0].toUpperCase() : 'A'}</div>
              <div className="header-name">{issue.author_name || 'Anonymous'}</div>
            </div>

            {issue.image_url && (
              <img src={issue.image_url} alt={issue.title} className="post-image" />
            )}

            <div className="post-actions">
              <button
                onClick={() => handleLike(issue.id)}
                className={`action-btn ${likedIssues.has(issue.id) ? 'liked' : ''}`}
                disabled={!session}
              >
                {likedIssues.has(issue.id) ? '❤️' : '♡'}
              </button>
              <Link to={`/issue/${issue.id}`} className="action-btn">💬</Link>
              <button className="action-btn">➢</button>
            </div>

            <div className="post-stats">
              <span>{issue.like_count || 0} likes</span>
              <span>{issue.view_count || 0} views</span>
            </div>

            <div className="post-description">
              <strong>{issue.author_name || 'Anonymous'}</strong> {issue.title}
            </div>

            <div className="post-timestamp">
              {timeAgo(issue.created_at)}
            </div>

            <Link to={`/issue/${issue.id}`} className="post-comments-link">
              View details and comments
            </Link>
          </div>
        ))
      )}
    </div>
  );
};

export default IssueFeed;
