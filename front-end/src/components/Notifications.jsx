// src/components/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../css/Notifications.css'; // Nayi CSS file

// Helper function to calculate relative time
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

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [myIssues, setMyIssues] = useState(new Set());
  const [session, setSession] = useState(null);

  useEffect(() => {
    // 1. Current user aur uske post kiye gaye issues ko fetch karo
    const setupNotifications = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        const { data: issuesData } = await supabase.from('civic_issues').select('id').eq('user_id', session.user.id);
        const issueIds = new Set(issuesData.map(issue => issue.id));
        setMyIssues(issueIds);
      }
    };
    setupNotifications();
  }, []);

  useEffect(() => {
    if (!session) return;

    // 2. Real-time listener jo sirf zaroori notifications dega
    const channel = supabase
      .channel('public:likes:comments')
      .on('postgres_changes', { event: 'INSERT', schema: 'public' },
        (payload) => {
          let newNotification = null;

          // Jab koi like kare
          if (payload.table === 'likes' && myIssues.has(payload.new.issue_id)) {
            newNotification = {
              id: `like-${payload.new.id}`,
              text: `${payload.new.user_id.substring(0, 8)} liked your post.`,
              time: payload.commit_timestamp
            };
          }

          // Jab koi comment kare
          if (payload.table === 'comments' && myIssues.has(payload.new.issue_id)) {
            newNotification = {
              id: `comment-${payload.new.id}`,
              text: `${payload.new.user_email} commented: "${payload.new.content}"`,
              time: payload.commit_timestamp
            };
          }
          
          if (newNotification) {
            setNotifications(prev => [newNotification, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, myIssues]);

  return (
    <div>
      {notifications.length > 0 ? (
        notifications.map(notif => (
          <div key={notif.id} className="notification-item">
            <div className="notification-avatar"></div>
            <div className="notification-content">
              <p className="notification-text">{notif.text}</p>
              <p className="notification-time">{timeAgo(notif.time)}</p>
            </div>
          </div>
        ))
      ) : (
        <p style={{textAlign: 'center', padding: '2rem'}}>No new notifications.</p>
      )}
    </div>
  );
};

export default Notifications;