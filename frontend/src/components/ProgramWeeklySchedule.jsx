import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import theme from '../theme';

const ProgramWeeklySchedule = ({ programRoutines = [] }) => {
  const [selectedWeek, setSelectedWeek] = useState({
    start: getStartOfWeek(new Date()),
    end: getEndOfWeek(new Date())
  });
  const [filteredRoutines, setFilteredRoutines] = useState([]);
  const [weeklyGoal, setWeeklyGoal] = useState('');

  function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  function getEndOfWeek(date) {
    const start = getStartOfWeek(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return end;
  }

  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  useEffect(() => {
    if (programRoutines.length === 0) return;

    const filtered = programRoutines.filter((routine) => {
      const routineDate = new Date(routine.scheduled_date);
      return routineDate >= selectedWeek.start && routineDate <= selectedWeek.end;
    });

    setFilteredRoutines(filtered);

    // Generate weekly goal summary
    if (filtered.length > 0) {
      const muscleGroups = new Set();
      filtered.forEach(routine => {
        routine.exercises?.forEach(exercise => {
          exercise.muscleGroups?.forEach(mg => muscleGroups.add(mg.name));
        });
      });
      
      const groups = Array.from(muscleGroups).join(', ');
      setWeeklyGoal(`Focus on ${groups} with ${filtered.length} workout${filtered.length > 1 ? 's' : ''} this week`);
    } else {
      setWeeklyGoal('No workouts scheduled for this week');
    }
  }, [selectedWeek, programRoutines]);

  const handleNextWeek = () => {
    const newStart = addDays(selectedWeek.start, 7);
    setSelectedWeek({
      start: newStart,
      end: getEndOfWeek(newStart)
    });
  };

  const handlePreviousWeek = () => {
    const newStart = addDays(selectedWeek.start, -7);
    setSelectedWeek({
      start: newStart,
      end: getEndOfWeek(newStart)
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const isToday = (date) => {
    const today = new Date();
    const routineDate = new Date(date);
    return routineDate.toDateString() === today.toDateString();
  };

  return (
    <Motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl p-6 shadow-md"
      style={{ backgroundColor: theme.colors.background.card }}
    >
      {/* Week Picker */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePreviousWeek}
            className="p-2 rounded-lg hover:bg-opacity-10 transition-all duration-200"
            style={{ 
              backgroundColor: 'transparent',
              color: theme.colors.primary.blue 
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.background.softBlue}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-2">
            <Calendar size={18} style={{ color: theme.colors.primary.blue }} />
            <span 
              className="text-sm font-semibold"
              style={{ color: theme.colors.text.primary }}
            >
              {formatDate(selectedWeek.start)} - {formatDate(selectedWeek.end)}
            </span>
          </div>

          <button
            onClick={handleNextWeek}
            className="p-2 rounded-lg hover:bg-opacity-10 transition-all duration-200"
            style={{ 
              backgroundColor: 'transparent',
              color: theme.colors.primary.blue 
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.background.softBlue}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Weekly Goal */}
        {weeklyGoal && (
          <div 
            className="p-3 rounded-lg mb-4"
            style={{ backgroundColor: theme.colors.background.softBlue }}
          >
            <p 
              className="text-xs font-semibold mb-1"
              style={{ color: theme.colors.text.secondary }}
            >
              This Week's Goal
            </p>
            <p 
              className="text-sm"
              style={{ color: theme.colors.text.primary }}
            >
              {weeklyGoal}
            </p>
          </div>
        )}
      </div>

      {/* Routines List */}
      <div className="space-y-3">
        {filteredRoutines.length > 0 ? (
          filteredRoutines.map((routine) => (
            <Motion.div
              key={routine.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                isToday(routine.scheduled_date) ? 'ring-2' : ''
              }`}
              style={{ 
                backgroundColor: isToday(routine.scheduled_date) 
                  ? theme.colors.background.softBlue 
                  : theme.colors.background.sidebar,
                ringColor: isToday(routine.scheduled_date) 
                  ? theme.colors.primary.blue 
                  : 'transparent'
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p 
                    className="text-xs font-medium mb-1"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    {formatDate(routine.scheduled_date)}
                    {isToday(routine.scheduled_date) && (
                      <span 
                        className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ 
                          background: theme.gradients.primary,
                          color: theme.colors.text.light 
                        }}
                      >
                        Today
                      </span>
                    )}
                  </p>
                  <p 
                    className="font-semibold text-sm"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {routine.name}
                  </p>
                </div>
              </div>

              {routine.exercises && routine.exercises.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {routine.exercises.slice(0, 3).map((exercise, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 rounded"
                      style={{ 
                        backgroundColor: theme.colors.background.card,
                        color: theme.colors.text.secondary 
                      }}
                    >
                      {exercise.name}
                    </span>
                  ))}
                  {routine.exercises.length > 3 && (
                    <span
                      className="text-xs px-2 py-1 rounded font-semibold"
                      style={{ 
                        backgroundColor: theme.colors.background.card,
                        color: theme.colors.primary.blue 
                      }}
                    >
                      +{routine.exercises.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </Motion.div>
          ))
        ) : (
          <p 
            className="text-center text-sm py-4"
            style={{ color: theme.colors.text.secondary }}
          >
            No routines scheduled for this week
          </p>
        )}
      </div>
    </Motion.div>
  );
};

export default ProgramWeeklySchedule;
