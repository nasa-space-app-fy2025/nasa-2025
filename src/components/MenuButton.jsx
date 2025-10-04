import React from 'react';

const MenuButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      aria-label="Open menu"
      // Removed h-12 and w-12 to eliminate the container
      className="fixed top-4 left-4 z-50 p-2 text-cyan-200 transition-transform hover:scale-110"
    >
      {/* Increased icon size from h-8 w-8 to h-9 w-9 */}
      <svg xmlns="http://www.w.org/2000/svg" className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
};

export default MenuButton;