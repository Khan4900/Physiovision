import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import theme from '../theme';

const notifications = [
  {
    id: 1,
    userImage: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    status: 'success',
    message: 'John requested access to',
    projectName: 'Project Alpha',
    timestamp: '5 min ago',
  },
  {
    id: 2,
    userImage: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    status: 'error',
    message: 'Sarah declined changes to',
    projectName: 'Project Beta',
    timestamp: '10 min ago',
  },
  {
    id: 3,
    userImage: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    status: 'success',
    message: 'Mike approved changes to',
    projectName: 'Project Gamma',
    timestamp: '15 min ago',
  },
];

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Show notifications"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        <span
          className="absolute top-1 right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-semibold"
          style={{ background: theme.gradients.primary }}
        >
          {notifications.length}
        </span>
      </Motion.button>
      <AnimatePresence>
        {isOpen && (
          <Motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
          >
            <div className="p-4 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, rgba(254,218,117,0.1) 0%, rgba(250,126,30,0.1) 50%, rgba(214,41,118,0.1) 100%)' }}>
              <h3 className="text-lg font-bold text-gray-800">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <Motion.div
                  key={notification.id}
                  whileHover={{ backgroundColor: 'rgba(254,218,117,0.05)' }}
                  className="p-4 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <img
                        src={notification.userImage}
                        alt="User"
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200"
                      />
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          notification.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-gray-700">
                          {notification.message}{' '}
                          <span
                            className="font-bold"
                            style={{
                              background: theme.gradients.primary,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                            }}
                          >
                            {notification.projectName}
                          </span>
                        </p>
                        <span className="text-xs text-gray-400">{notification.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </Motion.div>
              ))}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
