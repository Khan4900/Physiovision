import React from 'react';
import { motion as Motion } from 'framer-motion';
import NotificationDropdown from './NotificationDropdown';
import UserDropdown from './UserDropdown';
import theme from '../theme';

function Topbar({ onSidebarToggle, sidebarOpen }) {
  const currentTime = new Date().getHours();
  let greeting = 'Good morning';
  if (currentTime >= 12 && currentTime < 17) {
    greeting = 'Good afternoon';
  } else if (currentTime >= 17 || currentTime < 5) {
    greeting = 'Good evening';
  }

  return (
    <Motion.div
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-white flex items-center justify-between px-4 sm:px-6 md:px-8 z-50 shadow-md border-b border-gray-100"
    >
      <div className="flex items-center gap-2">
        {/* Hamburger icon for mobile */}
        <button
          className="md:hidden p-2 rounded-full hover:bg-gray-100 mr-2"
          onClick={onSidebarToggle}
          aria-label="Toggle sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <Motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col"
        >
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
            {greeting}, <span
              className="bg-clip-text text-transparent"
              style={{
                background: theme.gradients.primary,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Mukaram
            </span>
          </h2>
          <p className="text-xs md:text-sm text-gray-400">Welcome back!</p>
        </Motion.div>
      </div>
      <Motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex items-center gap-4 md:gap-6"
      >
        <NotificationDropdown />
        <UserDropdown
          userName="Mukaram"
          userEmail="mukaram@example.com"
        />
      </Motion.div>
    </Motion.div>
  );
}

export default Topbar;
