import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const theme = 'dark';
  const setTheme = () => {};

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', 'dark');
    root.classList.add('dark');
    localStorage.setItem('mchub-theme', 'dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
