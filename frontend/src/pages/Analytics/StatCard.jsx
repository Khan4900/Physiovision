import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { theme } from '../../theme';

const StatCard = ({ icon: Icon, title, value, unit, progress, color }) => {
  return (
    <div
      className="p-6 rounded-xl flex items-center gap-6"
      style={{
        backgroundColor: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.light}`,
      }}
    >
      <div className="w-20 h-20 flex-shrink-0">
        <CircularProgressbar
          value={progress}
          text={`${progress}%`}
          styles={buildStyles({
            pathColor: color,
            textColor: theme.colors.text.primary,
            trailColor: theme.colors.border.light,
            textSize: '24px',
          })}
        />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1" style={{ color: theme.colors.text.secondary }}>
          <Icon className="w-5 h-5" />
          <h3 className="font-medium">{title}</h3>
        </div>
        <p className="text-3xl font-bold" style={{ color: theme.colors.text.primary }}>
          {value} <span className="text-xl font-medium" style={{ color: theme.colors.text.secondary }}>{unit}</span>
        </p>
      </div>
    </div>
  );
};

export default StatCard;
