// src/components/ActivityModal.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../css/ActivityModal.css'; // Is file ko agle step mein banayenge

const ActivityModal = ({ session, onClose }) => {
  const [activeTab, setActiveTab] = useState('Posts');
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState({ posts: [], comments: [], likes: [] });

  useEffect(() => {
    const fetchActivities = async () => {
      if (!session) return;
      setLoading(true);

      // 1. User ke post kiye gaye issues fetch karo
      const { data: posts } = await supabase.from('civic_issues').select('id, title, created_at').eq('user_id', session.user.id);

      // 2. User ke kiye gaye comments fetch karo
      const { data: comments } = await supabase.from('comments').select('id, content, created_at, issue_id').eq('user_email', session.user.email);
      
      // 3. User ke kiye gaye likes (aur jis post ko like kiya, uska title bhi) fetch karo
      const { data: likes } = await supabase.from('likes').select('id, created_at, civic_issues(title)').eq('user_id', session.user.id);

      setActivities({
        posts: posts || [],
        comments: comments || [],
        likes: likes || [],
      });
      setLoading(false);
    };

    fetchActivities();
  }, [session]);

  const renderContent = () => {
    if (loading) return <p>Loading activity...</p>;

    switch (activeTab) {
      case 'Posts':
        return activities.posts.length > 0 ? (
          activities.posts.map(post => <div key={`post-${post.id}`} className="activity-item">{post.title}</div>)
        ) : <p>You haven't posted anything yet.</p>;
      case 'Likes':
        return activities.likes.length > 0 ? (
          activities.likes.map(like => <div key={`like-${like.id}`} className="activity-item">You liked: <strong>{like.civic_issues.title}</strong></div>)
        ) : <p>You haven't liked anything yet.</p>;
      case 'Comments':
        return activities.comments.length > 0 ? (
          activities.comments.map(comment => <div key={`comment-${comment.id}`} className="activity-item">You commented: "{comment.content}"</div>)
        ) : <p>You haven't commented on anything yet.</p>;
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content activity-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Your Activity</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <div className="activity-tabs">
          <button onClick={() => setActiveTab('Posts')} className={activeTab === 'Posts' ? 'active' : ''}>Posts</button>
          <button onClick={() => setActiveTab('Likes')} className={activeTab === 'Likes' ? 'active' : ''}>Likes</button>
          <button onClick={() => setActiveTab('Comments')} className={activeTab === 'Comments' ? 'active' : ''}>Comments</button>
        </div>
        <div className="activity-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ActivityModal;

