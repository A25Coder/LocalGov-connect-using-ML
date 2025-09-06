import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../css/Notifications.css';

// === Helper Function: Time Ago ===
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

const Notifications = ({ session, setUnreadCount }) => {
    const [notifications, setNotifications] = useState([]);
    const [myIssues, setMyIssues] = useState(new Set());
    const [loading, setLoading] = useState(true);

    // === Fetch Notifications & Mark as Read ===
    useEffect(() => {
        const fetchAndMarkNotifications = async () => {
            if (!session) {
                setLoading(false);
                return;
            }

            setLoading(true);

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching notifications:', error);
                setLoading(false);
                return;
            }

            if (data) {
                const formatted = data.map(n => ({
                    id: `db-${n.id}`,
                    text: n.message,
                    time: n.created_at,
                    is_read: n.is_read
                }));

                setNotifications(formatted);

                // Mark unread notifications as read
                const unreadIds = data.filter(n => !n.is_read).map(n => n.id);
                if (unreadIds.length > 0) {
                    await supabase
                        .from('notifications')
                        .update({ is_read: true })
                        .in('id', unreadIds);

                    setUnreadCount(0);
                }
            }

            setLoading(false);
        };

        fetchAndMarkNotifications();
    }, [session, setUnreadCount]);

    // === Real-time Likes/Comments ===
    useEffect(() => {
        if (!session) return;

        // Get IDs of user's issues
        supabase
            .from('civic_issues')
            .select('id')
            .eq('user_id', session.user.id)
            .then(({ data }) => {
                if (data) setMyIssues(new Set(data.map(issue => issue.id)));
            });

        const channel = supabase
            .channel('public:likes_and_comments')
            .on('postgres_changes', { event: 'INSERT', schema: 'public' }, (payload) => {
                if (!myIssues.size) return;

                let newNotification = null;

                if (payload.table === 'likes' && myIssues.has(payload.new.issue_id)) {
                    newNotification = {
                        id: `like-${payload.new.id}`,
                        text: `Your issue received a new like!`,
                        time: payload.new.created_at,
                        is_read: false
                    };
                }

                if (payload.table === 'comments' && myIssues.has(payload.new.issue_id)) {
                    newNotification = {
                        id: `comment-${payload.new.id}`,
                        text: `New comment on your issue: "${payload.new.content}"`,
                        time: payload.new.created_at,
                        is_read: false
                    };
                }

                if (newNotification) {
                    setNotifications(prev => [newNotification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                }
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [session, myIssues, setUnreadCount]);

    if (loading) return <p style={{ textAlign: 'center', padding: '2rem' }}>Loading notifications...</p>;

    return (
        <div className="notifications-container">
            {notifications.length > 0 ? (
                notifications.map(notif => (
                    <div key={notif.id} className={`notification-item ${!notif.is_read ? 'unread' : ''}`}>
                        <div className="notification-avatar">
                            {notif.id.startsWith('like') ? '❤️' : notif.id.startsWith('comment') ? '💬' : '🔔'}
                        </div>
                        <div className="notification-content">
                            <p className="notification-text">{notif.text}</p>
                            <p className="notification-time">{timeAgo(notif.time)}</p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="empty-state" style={{ textAlign: 'center', padding: '2rem' }}>
                    <span className="empty-icon" style={{ fontSize: '2rem' }}>📭</span>
                    <h2>All Caught Up!</h2>
                    <p>You'll see new notifications for likes, comments, and status updates here.</p>
                </div>
            )}
        </div>
    );
};

export default Notifications;
