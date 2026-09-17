import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import GadgetBase from './GadgetBase';
import { theme } from '../theme';
import { 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  format, 
  isWithinInterval,
  parseISO,
  isSameDay 
} from 'date-fns';

const WeeklySchedule = ({ programRoutines = [] }) => {
  const today = new Date();
  const [selectedWeek, setSelectedWeek] = useState({
    start: startOfWeek(today, { weekStartsOn: 1 }),
    end: endOfWeek(today, { weekStartsOn: 1 }),
  });
  const [filteredRoutines, setFilteredRoutines] = useState([]);
  const [weeklyGoal, setWeeklyGoal] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter routines by selected week
  useEffect(() => {
    if (programRoutines.length === 0) return;
    setLoading(true);
    
    const filtered = programRoutines.filter((routine) => {
      const routineDate = parseISO(routine.scheduled_date);
      return isWithinInterval(routineDate, {
        start: selectedWeek.start,
        end: selectedWeek.end,
      });
    });
    
    setFilteredRoutines(filtered);
    
    // Generate weekly goal summary
    if (filtered.length > 0) {
      generateWeeklyGoal(filtered);
    } else {
      setWeeklyGoal('');
    }
    
    setLoading(false);
  }, [selectedWeek, programRoutines]);

  const generateWeeklyGoal = (routines) => {
    // Simple goal generation based on routine types
    const types = routines.map(r => r.type || 'workout');
    const uniqueTypes = [...new Set(types)];
    
    if (uniqueTypes.length === 1) {
      setWeeklyGoal(`Focus on ${uniqueTypes[0].toLowerCase()} training this week.`);
    } else {
      setWeeklyGoal(`Balanced training week with ${uniqueTypes.join(', ').toLowerCase()} workouts.`);
    }
  };

  const handleNextWeek = () => {
    const newStartDate = addDays(selectedWeek.start, 7);
    const newEndDate = addDays(newStartDate, 6);
    setSelectedWeek({ start: newStartDate, end: newEndDate });
    setWeeklyGoal('');
  };

  const handlePreviousWeek = () => {
    const newStartDate = addDays(selectedWeek.start, -7);
    const newEndDate = addDays(newStartDate, 6);
    setSelectedWeek({ start: newStartDate, end: newEndDate });
    setWeeklyGoal('');
  };

  const isToday = (date) => {
    return isSameDay(parseISO(date), today);
  };

  return (
    <GadgetBase>
      {/* Week Picker */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          onClick={handlePreviousWeek}
          className="p-2 rounded-lg hover:bg-opacity-80 transition-colors"
          style={{ backgroundColor: theme.colors.background.main }}
        >
          <ChevronLeft className="w-5 h-5" style={{ color: theme.colors.text.primary }} />
        </button>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" style={{ color: theme.colors.primary.blue }} />
          <span className="font-semibold" style={{ color: theme.colors.text.primary }}>
            {format(selectedWeek.start, 'MMM dd')} - {format(selectedWeek.end, 'MMM dd, yyyy')}
          </span>
        </div>
        
        <button
          onClick={handleNextWeek}
          className="p-2 rounded-lg hover:bg-opacity-80 transition-colors"
          style={{ backgroundColor: theme.colors.background.main }}
        >
          <ChevronRight className="w-5 h-5" style={{ color: theme.colors.text.primary }} />
        </button>
      </div>

      {loading ? (
        <div className="w-full flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2"
            style={{ borderColor: theme.colors.primary.blue }}
          />
          <p className="mt-4" style={{ color: theme.colors.text.secondary }}>
            Loading schedule...
          </p>
        </div>
      ) : (
        <div className="w-full space-y-4">
          {/* Weekly Goal */}
          {weeklyGoal && (
            <div className="text-left">
              <h4 className="font-bold mb-2" style={{ color: theme.colors.text.primary }}>
                This Week's Goal
              </h4>
              <p style={{ color: theme.colors.text.secondary }}>
                {weeklyGoal}
              </p>
            </div>
          )}

          {/* Routines List */}
          <div className="space-y-3">
            {filteredRoutines.length > 0 ? (
              filteredRoutines.map((routine, idx) => (
                <Motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: isToday(routine.scheduled_date) 
                      ? theme.colors.background.softBlue 
                      : theme.colors.background.main,
                    border: `1px solid ${
                      isToday(routine.scheduled_date) 
                        ? theme.colors.primary.blue 
                        : theme.colors.border.light
                    }`,
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-semibold" style={{ color: theme.colors.text.primary }}>
                        {routine.name}
                      </h5>
                      <p className="text-sm mt-1" style={{ color: theme.colors.text.secondary }}>
                        {format(parseISO(routine.scheduled_date), 'EEEE, MMM dd')}
                      </p>
                    </div>
                    {isToday(routine.scheduled_date) && (
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: theme.colors.primary.blue,
                          color: 'white',
                        }}
                      >
                        Today
                      </span>
                    )}
                  </div>
                  
                  {routine.exercises && routine.exercises.length > 0 && (
                    <div className="mt-2 text-sm" style={{ color: theme.colors.text.secondary }}>
                      {routine.exercises.length} exercises
                    </div>
                  )}
                </Motion.div>
              ))
            ) : (
              <p className="text-center py-4" style={{ color: theme.colors.text.secondary }}>
                No routines scheduled for this week
              </p>
            )}
          </div>
        </div>
      )}
    </GadgetBase>
  );
};

export default WeeklySchedule;
