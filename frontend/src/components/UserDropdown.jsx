import React, { useState } from 'react';
import { User, Settings, HelpCircle, LogOut, Edit2, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import theme from '../theme';
import { UseAuth } from '../context/AuthContext';

const UserDropdown = ({ userName, userEmail }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = UseAuth();

  const menuItems = [
    {
      icon: Edit2,
      label: 'Edit Profile',
      onClick: () => {
        navigate('/profile');
        setIsOpen(false);
      },
    },
    {
      icon: Settings,
      label: 'Account Settings',
      onClick: () => {
        navigate('/settings');
        setIsOpen(false);
      },
    },
    {
      icon: HelpCircle,
      label: 'Support',
      onClick: () => {
        window.open('mailto:support@example.com');
        setIsOpen(false);
      },
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/landing');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
        aria-label="Show user menu"
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
          style={{ background: theme.gradients.primary }}
        >
          {userName.charAt(0).toUpperCase()}
        </div>
        {/* <span className="font-medium text-gray-700 hidden sm:block">{userName}</span> */}
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Motion.button>
      <AnimatePresence>
        {isOpen && (
          <Motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
          >
            {/* User Info Section */}
            <div className="p-4 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, rgba(254,218,117,0.1) 0%, rgba(250,126,30,0.1) 50%, rgba(214,41,118,0.1) 100%)' }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ background: theme.gradients.primary }}
                >
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">{userName}</h3>
                  <p className="text-xs text-gray-500">{userEmail}</p>
                </div>
              </div>
            </div>
            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Motion.button
                    key={index}
                    onClick={item.onClick}
                    whileHover={{ x: 5 }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  >
                    <Icon className="w-5 h-5" style={{ color: theme.colors.primary.darkGray }} />
                    <span>{item.label}</span>
                  </Motion.button>
                );
              })}
            </div>
            {/* Sign Out Button */}
            <div className="p-2 border-t border-gray-100">
              <Motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </Motion.button>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDropdown;
