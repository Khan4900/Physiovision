import React from 'react';
import { Camera } from 'lucide-react';
import { theme } from '../../theme';

const ProfileHeader = ({ user }) => {
  return (
    <div
      className="rounded-xl p-6 flex items-center gap-6"
      style={{
        backgroundColor: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.light}`,
      }}
    >
      <div className="relative">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-28 h-28 rounded-full object-cover"
          style={{ border: `2px solid ${theme.colors.primary.blue}` }}
        />
        <button
          className="absolute bottom-0 right-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          style={{ background: theme.gradients.primary }}
        >
          <Camera className="w-5 h-5" style={{ color: theme.colors.text.light }} />
        </button>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-2" style={{ color: theme.colors.text.primary }}>
          {user.name}
        </h2>
        <p style={{ color: theme.colors.text.secondary }}>{user.email}</p>
      </div>
    </div>
  );
};

export default ProfileHeader;
