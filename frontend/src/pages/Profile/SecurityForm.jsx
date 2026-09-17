import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { theme } from '../../theme';

const SecurityForm = ({ onUpdate }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const inputStyle = {
    backgroundColor: theme.colors.background.main,
    border: `1px solid ${theme.colors.border.light}`,
    color: theme.colors.text.primary,
  };

  const focusStyle = {
    borderColor: theme.colors.border.focus,
  };

  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.light}`,
      }}
    >
      <h3 className="text-lg font-semibold mb-6" style={{ color: theme.colors.text.primary }}>
        Change Password
      </h3>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm mb-2 block" style={{ color: theme.colors.text.primary }}>
            Current Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: theme.colors.text.secondary }}
            />
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              placeholder="Enter current password"
              className="w-full rounded-lg py-2 pl-10 pr-12"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = focusStyle.borderColor)}
              onBlur={(e) => (e.target.style.borderColor = theme.colors.border.light)}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: theme.colors.text.secondary }}
            >
              {showCurrentPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm mb-2 block" style={{ color: theme.colors.text.primary }}>
            New Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: theme.colors.text.secondary }}
            />
            <input
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              className="w-full rounded-lg py-2 pl-10 pr-12"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = focusStyle.borderColor)}
              onBlur={(e) => (e.target.style.borderColor = theme.colors.border.light)}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: theme.colors.text.secondary }}
            >
              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm mb-2 block" style={{ color: theme.colors.text.primary }}>
            Confirm New Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: theme.colors.text.secondary }}
            />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              className="w-full rounded-lg py-2 pl-10 pr-12"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = focusStyle.borderColor)}
              onBlur={(e) => (e.target.style.borderColor = theme.colors.border.light)}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: theme.colors.text.secondary }}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SecurityForm;
