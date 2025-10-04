import React from 'react';

const SideMenu = ({ isOpen, onClose }) => {
  const menuItems = [
    { label: 'What is the NBL?', sectionId: 'nbl-intro-section' },
    { label: 'History', sectionId: 'nbl-history-section' },
    { label: 'Pool Details', sectionId: 'nbl-pool-details-section' },
    { label: 'Training', sectionId: 'nbl-training-section' },
  ];

  const handleScroll = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>

      {/* MODIFIED: Changed background, backdrop, and border colors */}
      <div 
        className={`relative z-50 h-full w-72 bg-cyan-900/80 backdrop-blur-lg border-r border-teal-400/30 shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-8">
          {/* MODIFIED: Brighter heading color */}
          <h2 className="text-2xl font-bold text-teal-300 mb-8 animate-subtleFloat">Navigation</h2>
          <nav>
            <ul className="space-y-4">
              {menuItems.map((item, index) => (
                <li key={item.sectionId}>
                  <button
                    onClick={() => handleScroll(item.sectionId)}
                    // MODIFIED: Brighter text and hover colors
                    className="w-full text-left text-lg text-cyan-200 hover:text-white transition-colors animate-subtleFloat"
                    style={{ animationDelay: `${150 * index}ms` }}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default SideMenu;