import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { Clock, Flame, Dumbbell, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import theme from '../theme';
import CustomButton from './CustomButton';

const toDateKey = (value) => {
  if (!value) return '';
  if (typeof value === 'string') {
    // Handles 'YYYY-MM-DD' and ISO strings.
    return value.slice(0, 10);
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const TodaysRoutine = ({ programRoutines = [] }) => {
  const navigate = useNavigate();
  const [todayRoutine, setTodayRoutine] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const todayKey = toDateKey(new Date());
    const routine = programRoutines.find((r) => toDateKey(r.scheduled_date) === todayKey);
    setTodayRoutine(routine || null);
  }, [programRoutines]);

  const formatDuration = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return seconds > 0 ? `${minutes} mins ${seconds} secs` : `${minutes} mins`;
  };

  const getMuscleGroups = (exercises) => {
    if (!exercises || exercises.length === 0) return [];
    const groups = new Set();
    exercises.forEach(exercise => {
      exercise.muscleGroups?.forEach(mg => groups.add(mg.name));
    });
    return Array.from(groups);
  };

  if (!todayRoutine) {
    return (
      <div 
        className="rounded-xl p-6 shadow-md"
        style={{ backgroundColor: theme.colors.background.card }}
      >
        <p style={{ color: theme.colors.text.secondary }}>
          No routine scheduled for today.
        </p>
      </div>
    );
  }

  return (
    <>
      <Motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="rounded-xl p-6 shadow-md"
        style={{ backgroundColor: theme.colors.background.card }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <h3 
              className="text-sm font-semibold mb-1"
              style={{ color: theme.colors.text.secondary }}
            >
              Today's Routine
            </h3>
            <h2 
              className="text-2xl font-bold"
              style={{ color: theme.colors.text.primary }}
            >
              {todayRoutine.name}
            </h2>
          </div>

          {/* Stats Chips */}
          <div className="flex flex-wrap gap-2">
            {todayRoutine.completed && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
                style={{
                  borderColor: theme.colors.primary.green,
                  color: theme.colors.primary.green,
                  backgroundColor: theme.colors.background.sidebar,
                }}
              >
                <CheckCircle size={14} />
                <span className="text-sm font-semibold">Completed</span>
              </div>
            )}
            {todayRoutine.duration > 0 && (
              <div 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
                style={{ 
                  borderColor: theme.colors.border.light,
                  color: theme.colors.text.secondary 
                }}
              >
                <Clock size={14} />
                <span className="text-sm">{formatDuration(todayRoutine.duration)}</span>
              </div>
            )}
            {todayRoutine.estimated_calories && (
              <div 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
                style={{ 
                  borderColor: theme.colors.border.light,
                  color: theme.colors.text.secondary 
                }}
              >
                <Flame size={14} />
                <span className="text-sm">{todayRoutine.estimated_calories} Kcal</span>
              </div>
            )}
            {getMuscleGroups(todayRoutine.exercises).map((group, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
                style={{ 
                  borderColor: theme.colors.border.light,
                  color: theme.colors.text.secondary 
                }}
              >
                <Dumbbell size={14} />
                <span className="text-sm">{group}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Exercises List */}
        {todayRoutine.exercises && todayRoutine.exercises.length > 0 && (
          <div className="mb-6 space-y-3">
            {todayRoutine.exercises.map((exercise, idx) => (
              <div 
                key={exercise.id}
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ backgroundColor: theme.colors.background.softBlue }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                    style={{ 
                      background: theme.gradients.primary,
                      color: theme.colors.text.light 
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <p 
                      className="font-semibold"
                      style={{ color: theme.colors.text.primary }}
                    >
                      {exercise.name}
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      {exercise.sets} sets × {exercise.reps} reps
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Start Button */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-xs">
            <CustomButton
              text={todayRoutine.completed ? 'COMPLETED' : 'START'}
              onClick={() => {
                if (!todayRoutine.completed) setShowModal(true);
              }}
              variant="primary"
              fullWidth={true}
              disabled={Boolean(todayRoutine.completed)}
            />
          </div>
        </div>
      </Motion.div>

      {/* Modal Placeholder */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <Motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 
              className="text-xl font-bold mb-4"
              style={{ color: theme.colors.text.primary }}
            >
              Start Workout Session
            </h3>
            <p 
              className="mb-6"
              style={{ color: theme.colors.text.secondary }}
            >
              Ready to begin {todayRoutine.name}?
            </p>
            <div className="flex gap-3">
              <div className="flex-1">
                <CustomButton
                  text="Cancel"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg px-4 py-2"
                  style={{
                    borderColor: theme.colors.border.light,
                    color: theme.colors.text.secondary,
                  }}
                />
              </div>
              <div className="flex-1">
                <CustomButton
                  text="Let's Go!"
                  onClick={() => {
                    setShowModal(false);
                    navigate('/session', {
                      state: {
                        id: String(todayRoutine.id),
                        idType: 'routine',
                        scheduled_date: todayRoutine.scheduled_date,
                        program_id: todayRoutine.program_id,
                      },
                    });
                  }}
                  className="rounded-lg px-4 py-2"
                />
              </div>
            </div>
          </Motion.div>
        </div>
      )}
    </>
  );
};

export default TodaysRoutine;
