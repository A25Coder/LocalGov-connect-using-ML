// src/hooks/useDarkMode.js
import { useEffect, useState } from 'react';

export const useDarkMode = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return [theme, toggleTheme];
};