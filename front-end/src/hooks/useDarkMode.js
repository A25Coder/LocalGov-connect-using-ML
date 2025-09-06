// src/hooks/useDarkMode.js
import { useEffect, useState } from 'react';

export const useDarkMode = () => {
  const [theme, setTheme] = useState('light');

  // mode set karne ka helper
  const setMode = (mode) => {
    window.localStorage.setItem('theme', mode);
    setTheme(mode);
    document.documentElement.setAttribute('data-theme', mode);
  };

  // toggle function
  const toggleTheme = () => {
    theme === 'light' ? setMode('dark') : setMode('light');
  };

  // mount hone par check karo localStorage mein theme hai ya nahi
  useEffect(() => {
    const localTheme = window.localStorage.getItem('theme');
    localTheme ? setMode(localTheme) : setMode('light');
  }, []);

  return [theme, toggleTheme];
};
