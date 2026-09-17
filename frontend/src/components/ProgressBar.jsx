import React from 'react';
import { theme } from '../theme';

// Simple progress bar using Tailwind utilities and theme tokens.
// Expects progress 0-100.
const ProgressBar = ({ progress = 0 }) => {
  const pct = Math.min(100, Math.max(0, progress));
  return (
    <div className="w-full flex items-center gap-3">
      <div
        className="h-3 w-full rounded-full overflow-hidden bg-gradient-to-r"
        style={{
          backgroundColor: theme.colors.background.softBlue,
          boxShadow: theme.shadows.sm,
        }}
      >
        <div
          className="h-full transition-all duration-300 ease-out"
          style={{
            width: pct + '%',
            backgroundImage: theme.gradients.primary,
          }}
        />
      </div>
      <span className="text-sm font-medium" style={{ color: theme.colors.text.primary }}>
        {pct.toFixed(0)}%
      </span>
    </div>
  );
};

export default ProgressBar;