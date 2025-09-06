// src/components/ActivityModal.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../css/ActivityModal.css';

const ActivityModal = ({ session, onClose }) => {
    const [myPosts, setMyPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyPosts = async () => {
            setLoading(true);

            const { data, error } = await supabase
                .from('civic_issues')
                .select('id, title, status, created_at')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching posts:', error.message);
                setMyPosts([]);
            } else {
                setMyPosts(data || []);
            }

            setLoading(false);
        };

        if (session?.user) {
            fetchMyPosts();
        }
    }, [session]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content activity-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3>Your Activity</h3>
                    <button onClick={onClose} className="close-btn">
                        &times;
                    </button>
                </div>

                <div className="modal-body">
                    <h4>My Posts</h4>
                    {loading ? (
                        <p>Loading your posts...</p>
                    ) : myPosts.length === 0 ? (
                        <p>You haven't posted any issues yet.</p>
                    ) : (
                        <div className="posts-list">
                            {myPosts.map((post) => (
                                <div key={post.id} className="activity-post-item">
                                    <span className="post-title">{post.title}</span>
                                    <span
                                        className={`status-badge status-${post.status?.toLowerCase()}`}
                                    >
                                        {post.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActivityModal;
