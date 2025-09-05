// src/components/CommentSection.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import "../css/CommentSection.css"; // Is file ko agle step mein banayenge

const CommentSection = ({ issueId, session }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('issue_id', issueId) // Sirf is issue ke comments laao
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
      } else {
        setComments(data);
      }
      setLoading(false);
    };

    fetchComments();
  }, [issueId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const { data, error } = await supabase
      .from('comments')
      .insert({
        content: newComment,
        issue_id: issueId,
        user_email: session.user.email,
      })
      .select();

    if (error) {
      console.error('Error posting comment:', error);
    } else {
      setComments([...comments, data[0]]);
      setNewComment('');
    }
  };

  if (loading) return <p>Loading comments...</p>;

  return (
    <div className="comment-section">
      <h4>Comments</h4>
      <div className="comments-list">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="comment">
              <p className="comment-author">{comment.user_email}</p>
              <p>{comment.content}</p>
            </div>
          ))
        ) : (
          <p>No comments yet. Be the first to comment!</p>
        )}
      </div>
      <form onSubmit={handleCommentSubmit} className="comment-form">
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          required
        />
        <button type="submit">Post</button>
      </form>
    </div>
  );
};

export default CommentSection;