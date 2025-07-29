import React from 'react';

// PUBLIC_INTERFACE
/**
 * Header component for the flow chart builder application.
 * Displays the application title and provides theme toggle functionality.
 */
const Header = ({ title, theme, onToggleTheme }) => {
  return (
    <header className="header">
      <h1 className="header-title">{title}</h1>
      <button 
        className="theme-toggle" 
        onClick={onToggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
    </header>
  );
};

export default Header;
