// src/App.jsx
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Path theek kar diya gaya hai
import './App.css';
import Post from './components/Post';
import Profile from './components/Profile';
import IssueFeed from './components/IssueFeed';
import Auth from './components/Auth';
import Notifications from './components/Notifications';
import MapView from './components/MapView';

function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const tabs = [
    { name: 'Home', icon: '🏠' },
    { name: 'Map', icon: '🗺️' },
    { name: 'Post', icon: '➕' },
    { name: 'Notifications', icon: '🔔' },
    { name: 'Profile', icon: '👤' },
  ];

  const renderTabContent = () => {
    if (!session && (activeTab === 'Post' || activeTab === 'Profile' || activeTab === 'Map')) {
      return <Auth />;
    }

    switch (activeTab) {
      case 'Home':
        return <IssueFeed />;
      case 'Map':
        return <MapView />;
      case 'Post':
        return <Post />;
      case 'Notifications':
        return <Notifications />;
      case 'Profile':
        return <Profile session={session} />;
      default:
        return <p>Unknown tab.</p>;
    }
  };

  return (
    <div className="app-container">
      <main className="main-content-wrapper">
        <div className="screen-content">
          <h1>{activeTab}</h1>
          {renderTabContent()}
        </div>
      </main>

      <nav className="bottom-nav">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            className={`nav-button ${activeTab === tab.name ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.name)}
          >
            <span className="icon">{tab.icon}</span>
            <span className="label">{tab.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
