// src/App.jsx
import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './App.css';

// Components
import Header from './components/Header';
import SideNav from './components/SideNav';
import IssueFeed from './components/IssueFeed';
import MapView from './components/MapView';
import Post from './components/Post';
import Notifications from './components/Notifications';
import Profile from './components/Profile';
import Auth from './components/Auth';
import IssueDetailPage from './components/IssueDetailPage'; // Naya page

function App() {
  const [session, setSession] = useState(null);
  const [isNavOpen, setNavOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const setupUser = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      if (currentSession) {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', currentSession.user.id)
          .eq('is_read', false);

        if (!error) setUnreadCount(count);
      }
    };

    setupUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    return () => subscription.unsubscribe();
  }, []);

  // Page Title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Home';
    if (path.startsWith('/issue/')) return 'Issue Details';
    return path.charAt(1).toUpperCase() + path.slice(2);
  };

  // Protected Routes
  const ProtectedRoute = ({ children }) => {
    if (!session) return <Auth />;
    return children;
  };

  return (
    <div className="app-container">
      <Header
        title={getPageTitle()}
        onMenuClick={() => setNavOpen(true)}
        unreadCount={unreadCount}
      />

      {/* ✅ setActiveTab prop hata diya */}
      <SideNav
        isOpen={isNavOpen}
        onClose={() => setNavOpen(false)}
      />

      <main className="main-content-wrapper">
        <div className="screen-content">
          <Routes>
            <Route path="/" element={<IssueFeed />} />
            <Route path="/map" element={<MapView />} />
            <Route
              path="/post"
              element={<ProtectedRoute><Post session={session} /></ProtectedRoute>}
            />
            <Route
              path="/notifications"
              element={<ProtectedRoute><Notifications session={session} setUnreadCount={setUnreadCount} /></ProtectedRoute>}
            />
            <Route
              path="/profile"
              element={<ProtectedRoute><Profile session={session} /></ProtectedRoute>}
            />
            <Route path="/issue/:issueId" element={<IssueDetailPage session={session} />} />
          </Routes>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <NavLink to="/" className="nav-button">
          <span className="icon">🏠</span>
          <span className="label">Home</span>
        </NavLink>
        <NavLink to="/post" className="nav-button">
          <span className="icon">➕</span>
          <span className="label">Post</span>
        </NavLink>
        <NavLink to="/profile" className="nav-button">
          <span className="icon">👤</span>
          <span className="label">Profile</span>
        </NavLink>
      </nav>
    </div>
  );
}

export default App;
