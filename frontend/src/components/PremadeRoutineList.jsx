import React from 'react';
import { motion as Motion } from 'framer-motion';
import { Clock, Flame, Play } from 'lucide-react';
import theme from '../theme';

const PremadeRoutineList = ({ presetRoutines = [] }) => {
  const formatDuration = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    return `${minutes} mins`;
  };

  const handleStartRoutine = (routine) => {
    console.log('Starting routine:', routine.name);
    // Implement start routine logic
  };

  if (!presetRoutines || presetRoutines.length === 0) {
    return (
      <div 
        className="rounded-xl p-6 shadow-md"
        style={{ backgroundColor: theme.colors.background.card }}
      >
        <p style={{ color: theme.colors.text.secondary }}>
          No available routines
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {presetRoutines.map((routine, index) => (
        <Motion.div
          key={routine.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group"
          style={{ backgroundColor: theme.colors.background.card }}
        >
          {/* Card Image/Gradient Header */}
          <div 
            className="h-48 flex items-center justify-center relative overflow-hidden"
            style={{ background: theme.gradients.primary }}
          >
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            <Play 
              size={48} 
              className="text-white opacity-90 group-hover:opacity-100 transition-opacity duration-300" 
            />
          </div>

          {/* Card Content */}
          <div className="p-4">
            <h3 
              className="text-lg font-bold mb-2"
              style={{ color: theme.colors.text.primary }}
            >
              {routine.name}
            </h3>
            
            {routine.description && (
              <p 
                className="text-sm mb-4 line-clamp-2"
                style={{ color: theme.colors.text.secondary }}
              >
                {routine.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex flex-wrap gap-2 mb-4">
              {routine.duration && (
                <div 
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border"
                  style={{ 
                    borderColor: theme.colors.border.light,
                    color: theme.colors.text.secondary 
                  }}
                >
                  <Clock size={12} />
                  <span>{formatDuration(routine.duration)}</span>
                </div>
              )}
              {routine.estimated_calories && (
                <div 
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border"
                  style={{ 
                    borderColor: theme.colors.border.light,
                    color: theme.colors.text.secondary 
                  }}
                >
                  <Flame size={12} />
                  <span>{routine.estimated_calories} Kcal</span>
                </div>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={() => handleStartRoutine(routine)}
              className="w-full py-2.5 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-md"
              style={{ background: theme.gradients.primary }}
            >
              Start Routine
            </button>
          </div>
        </Motion.div>
      ))}
    </div>
  );
};

export default PremadeRoutineList;
