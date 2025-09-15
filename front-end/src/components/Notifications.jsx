import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../css/Notifications.css';

const Notifications = ({ session, setUnreadCount }) => {
  const [notifications, setNotifications] = useState([]);
  const [myIssues, setMyIssues] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const formatTimeAgo = (date) => {
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

  // Fetch notifications from Supabase
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!session) return;
      setLoading(true);

      // Fetch likes/comments notifications from civic_issues table
      const { data: issuesData } = await supabase
        .from('civic_issues')
        .select('id')
        .eq('user_id', session.user.id);

      const issueIds = new Set(issuesData?.map(i => i.id));
      setMyIssues(issueIds);

      // Fetch issue status notifications
      const { data: statusData } = await supabase
        .from('notifications')
        .select('*, civic_issues(title, status)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      let formatted = [];
      if (statusData) {
        formatted = statusData.map(n => ({
          id: n.id,
          text: n.message,
          time: n.created_at,
          is_read: n.is_read,
          type: 'status', // status update
          issue_title: n.civic_issues?.title || ''
        }));
      }

      // Count unread notifications
      const unreadCount = formatted.filter(n => !n.is_read).length;
      setUnreadCount(unreadCount);

      setNotifications(formatted);
      setLoading(false);
    };

    fetchNotifications();
  }, [session, setUnreadCount]);

  // Real-time subscription for likes/comments + status updates
  useEffect(() => {
    if (!session) return;
    if (!myIssues.size) return;

    const channel = supabase
      .channel('public:notifications_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${session.user.id}` }, (payload) => {
        const newNotif = {
          id: payload.new.id,
          text: payload.new.message,
          time: payload.new.created_at,
          is_read: false,
          type: 'status',
          issue_title: payload.new.civic_issues?.title || ''
        };
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    // Likes/comments real-time
    const likesChannel = supabase
      .channel('public:likes_and_comments')
      .on('postgres_changes', { event: 'INSERT', schema: 'public' }, (payload) => {
        if (!myIssues.has(payload.new.issue_id)) return;

        let newNotification = null;
        if (payload.table === 'likes') {
          newNotification = {
            id: payload.new.id,
            text: `Your issue received a new like!`,
            time: payload.new.created_at,
            is_read: false,
            type: 'like'
          };
        }
        if (payload.table === 'comments') {
          newNotification = {
            id: payload.new.id,
            text: `New comment on your issue: "${payload.new.content}"`,
            time: payload.new.created_at,
            is_read: false,
            type: 'comment'
          };
        }
        if (newNotification) {
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(likesChannel);
    };
  }, [session, myIssues, setUnreadCount]);

  const markAsRead = async (notifId) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notifId);

    if (!error) {
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
      setUnreadCount(prev => prev - 1);
    }
  };

  if (loading) return <p style={{ textAlign: 'center', padding: '2rem' }}>Loading notifications...</p>;

  return (
    <div className="notifications-container">
      {notifications.length === 0 ? (
        <div className="empty-state">
          <span style={{ fontSize: '2rem' }}>📭</span>
          <h2>All Caught Up!</h2>
        </div>
      ) : (
        notifications.map(notif => (
          <div
            key={notif.id}
            className={`notification-card ${!notif.is_read ? 'unread' : ''}`}
            onClick={() => markAsRead(notif.id)}
          >
            <div className="notification-header">
              <h4>{notif.issue_title || (notif.type === 'like' ? 'Like' : notif.type === 'comment' ? 'Comment' : 'Notification')}</h4>
              <span className="status">{notif.text}</span>
            </div>
            <p className="notification-time">{new Date(notif.time).toLocaleString()}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Notifications;
