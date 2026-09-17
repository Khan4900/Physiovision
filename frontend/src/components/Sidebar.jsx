import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, User, BarChart3, Dumbbell, LogOut, Activity } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import theme from '../theme';
import { UseAuth } from '../context/AuthContext';

const Sidebar = ({ open, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = UseAuth();
  const [activeLink, setActiveLink] = useState(location.pathname);

  // Update activeLink when location changes
  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location.pathname]);

  const navLinks = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/exerciselibrary', icon: Dumbbell, label: 'Exercise Library' },
    { path: '/learn', icon: Dumbbell, label: 'Learn' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/livestream', icon: Activity, label: 'AI Live Stream' },
  ];

  const isActive = (path) => activeLink === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  // Responsive sidebar classes
  const sidebarClasses = `fixed left-0 top-0 h-screen w-64 bg-white shadow-xl z-50 flex flex-col transition-transform duration-300
    ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`;

  return (
    <Motion.div
      initial={false}
      animate={{ x: open ? 0 : -250 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={sidebarClasses}
    >
      {/* Logo Section */}
      <div className="border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center md:justify-center justify-between p-2 rounded-xl">
          <img 
            src="/src/assets/logo.png" 
            alt="Physiovision Logo" 
            className="h-12 w-auto object-contain mx-auto md:mx-0" 
          />
          {/* Hamburger close icon for mobile */}
          <button
            className="md:hidden ml-auto p-2 rounded-full hover:bg-gray-100"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {/* Navigation Links - flex-1 to grow and push logout to bottom */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => {
                setActiveLink(link.path);
                if (window.innerWidth < 768) onClose();
              }}
              className="block"
            >
              <Motion.div
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${
                  active
                    ? 'text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                style={
                  active
                    ? { background: theme.gradients.primary }
                    : {}
                }
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{link.label}</span>
              </Motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button - pinned to bottom */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <Motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-300"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Logout</span>
        </Motion.button>
      </div>
    </Motion.div>
  );
};

export default Sidebar;
