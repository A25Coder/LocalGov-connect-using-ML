// src/components/ThemeToggle.jsx
import React from 'react';
import { useDarkMode } from '../hooks/useDarkMode';
import '../css/ThemeToggle.css';

const ThemeToggle = () => {
    const [theme, toggleTheme] = useDarkMode();

    return (
        <div className="theme-toggle-container">
            <span>Dark Mode</span>
            <button onClick={toggleTheme} className="theme-toggle-btn">
                <div className={`toggle-dot ${theme === 'dark' ? 'active' : ''}`}></div>
            </button>
        </div>
    );
};
export default ThemeToggle;