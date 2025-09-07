// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // ✅ Link import
import '../css/Header.css';

const Header = ({ onMenuClick, title, unreadCount }) => {
  return (
    <header className="app-header">
      {/* Menu Button */}
      <button onClick={onMenuClick} className="header-btn menu-btn">
        ☰
      </button>

      {/* Page Title */}
      <h1 className="header-title">{title}</h1>

      {/* Notifications Button with Badge */}
      <Link to="/notifications" className="header-btn notifications-btn">
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </Link>
    </header>
  );
};

export default Header;
