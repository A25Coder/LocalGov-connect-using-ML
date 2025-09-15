import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Header.css';

const Header = ({ onMenuClick, title, unreadCount }) => {
  return (
    <header className="app-header">
      {/* Menu Button */}
      <button onClick={onMenuClick} className="header-btn menu-btn" title="Open Menu">
        ☰
      </button>

      {/* Page Title */}
      <h1 className="header-title" title={title}>{title}</h1>

      {/* Notifications Button with Badge */}
      <Link to="/notifications" className="header-btn notifications-btn" title="View Notifications">
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </Link>
    </header>
  );
};

export default Header;
