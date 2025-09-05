// src/components/IssueFeed.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../css/IssueFeed.css';
import CommentSection from './CommentSection';

const IssueFeed = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [likedIssues, setLikedIssues] = useState(new Set());
  const [sortBy, setSortBy] = useState('created_at');
  const [viewedIssues, setViewedIssues] = useState(new Set()); // Track viewed issues in this session

  useEffect(() => {
    const setupFeed = async () => {
      setLoading(true);
      setError(null);
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
      } catch (error) {
        console.error("Error loading feed:", error);
        setError("Failed to load issues. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    setupFeed();
  }, [sortBy]);

  const handleLike = async (issueId) => {
    if (!session) return;

    const { data, error } = await supabase.rpc('toggle_like', {
      issue_id_to_toggle: issueId,
    });

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
        if (liked) {
          newLiked.add(issueId);
        } else {
          newLiked.delete(issueId);
        }
        return newLiked;
      });
    }
  };

  const toggleComments = async (issueId) => {
    const isOpening = selectedIssueId !== issueId;
    setSelectedIssueId(isOpening ? issueId : null);

    // Agar comment section is session mein pehli baar khul raha hai, to view count badhao
    if (isOpening && !viewedIssues.has(issueId)) {
      // UI mein turant update dikhao
      setIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, view_count: (issue.view_count || 0) + 1 } : issue
      ));
      
      // Is issue ko 'viewed' mark karo taaki dobara count na ho
      setViewedIssues(prev => new Set(prev).add(issueId));

      // Ab database mein update karo
      await supabase.rpc('increment_view_count', { issue_id_to_view: issueId });
    }
  };

  if (loading) return <p style={{textAlign: 'center', padding: '2rem'}}>Loading issues...</p>;
  if (error) return <p style={{color: 'red', textAlign: 'center'}}>{error}</p>;

  return (
    <div className="issue-feed-container">
      <div className="sorter-container">
        <button onClick={() => setSortBy('created_at')} className={sortBy === 'created_at' ? 'active' : ''}>Latest</button>
        <button onClick={() => setSortBy('like_count')} className={sortBy === 'like_count' ? 'active' : ''}>Most Liked</button>
        <button onClick={() => setSortBy('view_count')} className={sortBy === 'view_count' ? 'active' : ''}>Most Viewed</button>
      </div>

      {issues.length === 0 && !loading ? (
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <h2 style={{ marginTop: '1.5rem' }}>No issues found.</h2>
          <p style={{ color: '#64748B' }}>Try changing the sort order or be the first to post!</p>
        </div>
      ) : (
        issues.map((issue) => {
          let publicImageUrl = null;
          if (issue.image_url) {
            const { data } = supabase.storage.from('issue_images').getPublicUrl(issue.image_url);
            if (data) publicImageUrl = data.publicUrl;
          }
          return (
            <div key={issue.id} className="post-card">
              <div className="post-header">
                <div className="header-avatar">{issue.name ? issue.name[0].toUpperCase() : 'A'}</div>
                <div className="header-name">{issue.name || 'Anonymous'}</div>
              </div>

              {publicImageUrl && (
                <img src={publicImageUrl} alt={issue.title} className="post-image" />
              )}

              <div className="post-actions">
                <button
                  onClick={() => handleLike(issue.id)}
                  className={`action-btn ${likedIssues.has(issue.id) ? 'liked' : ''}`}
                  disabled={!session}
                >
                  {likedIssues.has(issue.id) ? '❤️' : '♡'}
                </button>
                <button onClick={() => toggleComments(issue.id)} className="action-btn">💬</button>
                <button className="action-btn">➢</button>
              </div>

              <div className="post-stats">
                <span>{issue.like_count || 0} likes</span>
                <span>{issue.view_count || 0} views</span>
              </div>

              <div className="post-description">
                <strong>{issue.name || 'Anonymous'}</strong> {issue.title}
              </div>

              <div onClick={() => toggleComments(issue.id)} className="post-comments-link">
                {selectedIssueId === issue.id ? 'Hide comments' : 'View comments'}
              </div>

              {selectedIssueId === issue.id && session && (
                <div style={{ padding: '0 1rem 1rem 1rem' }}>
                  <CommentSection issueId={issue.id} session={session} />
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default IssueFeed;

