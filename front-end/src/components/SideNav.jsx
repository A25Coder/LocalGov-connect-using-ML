// src/components/SideNav.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../css/SideNav.css';

const SideNav = ({ isOpen, onClose }) => {
    return (
        <>
            {/* Overlay */}
            <div
                className={`sidenav-overlay ${isOpen ? 'show' : ''}`}
                onClick={onClose}
            ></div>

            {/* Side Navigation */}
            <nav className={`sidenav ${isOpen ? 'open' : ''}`}>
                <h2>Menu</h2>
                <ul>
                    <li>
                        <Link to="/map" onClick={onClose}>🗺️ Map</Link>
                    </li>
                    {/* Notifications link yahan se hata diya gaya hai */}
                    <li>
                        <Link to="/about" onClick={onClose}>❓ About</Link>
                    </li>
                </ul>
            </nav>
        </>
    );
};

export default SideNav;