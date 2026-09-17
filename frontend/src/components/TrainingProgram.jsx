import React, { useState, useEffect, useCallback } from 'react';
import { motion as Motion } from 'framer-motion';
import theme from '../theme';
import TodaysRoutine from './TodaysRoutine';
import ProgramWeeklySchedule from './ProgramWeeklySchedule';
import PremadeRoutineList from './PremadeRoutineList';
import RegenerateProgram from './RegenerateProgram';
import { UseAuth } from '../context/AuthContext';
import { getAllUserPrograms } from '../controllers/ProgramController';
import { getAllPresetRoutines } from '../controllers/RoutineController';

const TrainingProgram = ({ refreshTrigger = false }) => {
  const { user } = UseAuth();
  const [activeTab, setActiveTab] = useState('program');
  const [loading, setLoading] = useState(true);
  const [activeProgram, setActiveProgram] = useState(null);
  const [programRoutines, setProgramRoutines] = useState([]);
  const [presetRoutines, setPresetRoutines] = useState([]);

  // Fetch user's program and routines from database
  const fetchProgramData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch user's programs (with routines and exercises)
      const programs = await getAllUserPrograms(user.id, true, true);
      
      if (programs && programs.length > 0) {
        // Get the most recent active program (not completed)
        const active = programs.find(p => !p.completed_at) || programs[0];
        setActiveProgram(active);
        
        // Extract routines from the program
        // The routines are attached via program.addRoutine() in the controller
        const routines = active.routines || [];
        
        // Map routines to the format expected by child components
        const mappedRoutines = routines.map(routine => ({
          id: routine.id,
          name: routine.name,
          description: routine.description,
          scheduled_date: routine.scheduled_date,
          duration: routine.duration || 30,
          estimated_calories: routine.estimated_calories || 0,
          completed: routine.completed || false,
          exercises: (routine.exercises || []).map(ex => ({
            id: ex.id,
            name: ex.name,
            sets: ex.sets || 3,
            reps: ex.reps || 10,
            order: ex.order || 0,
            rest_time: ex.rest_time || 30,
            muscleGroups: ex.muscleGroups || []
          }))
        }));
        
        setProgramRoutines(mappedRoutines);
      } else {
        setActiveProgram(null);
        setProgramRoutines([]);
      }

      // Fetch preset/premade routines
      try {
        const presets = await getAllPresetRoutines();
        setPresetRoutines(presets || []);
      } catch (err) {
        console.error('Error fetching preset routines:', err);
        setPresetRoutines([]);
      }

    } catch (error) {
      console.error('Error loading program data:', error);
      setActiveProgram(null);
      setProgramRoutines([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Initial load and refresh when trigger changes
  useEffect(() => {
    fetchProgramData();
  }, [fetchProgramData, refreshTrigger]);

  const handleGenerateProgram = useCallback(() => {
    // This will trigger the parent to regenerate
    // For now just refetch to check if a program was created
    fetchProgramData();
  }, [fetchProgramData]);

  return (
    <div>
      {/* Header */}
      <Motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <h1 
          className="text-3xl md:text-4xl font-bold mb-2"
          style={{ color: theme.colors.text.primary }}
        >
          Training Program
        </h1>
        <p 
          className="text-base md:text-lg"
          style={{ color: theme.colors.text.secondary }}
        >
          Your personalized workout plan
        </p>
      </Motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b" style={{ borderColor: theme.colors.border.light }}>
        <button
          onClick={() => setActiveTab('program')}
          className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 ${
            activeTab === 'program' 
              ? 'border-b-2' 
              : 'border-transparent opacity-60 hover:opacity-100'
          }`}
          style={{
            color: activeTab === 'program' ? theme.colors.primary.blue : theme.colors.text.secondary,
            borderBottomColor: activeTab === 'program' ? theme.colors.primary.blue : 'transparent'
          }}
        >
          My Program
        </button>
        <button
          onClick={() => setActiveTab('premade')}
          className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 ${
            activeTab === 'premade' 
              ? 'border-b-2' 
              : 'border-transparent opacity-60 hover:opacity-100'
          }`}
          style={{
            color: activeTab === 'premade' ? theme.colors.primary.blue : theme.colors.text.secondary,
            borderBottomColor: activeTab === 'premade' ? theme.colors.primary.blue : 'transparent'
          }}
        >
          Premade Routines
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" 
               style={{ borderColor: theme.colors.primary.blue }} />
        </div>
      )}

      {/* Tab Content */}
      {!loading && (
        <>
          {activeTab === 'program' && (
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left Column - Today's Routine or Regenerate */}
              <div className="lg:col-span-2">
                {activeProgram && !activeProgram.completed_at ? (
                  <TodaysRoutine programRoutines={programRoutines} />
                ) : (
                  <RegenerateProgram handleGenerateProgram={handleGenerateProgram} />
                )}
              </div>

              {/* Right Column - Weekly Schedule */}
              <div className="lg:col-span-1">
                <ProgramWeeklySchedule programRoutines={programRoutines} />
              </div>
            </Motion.div>
          )}

          {activeTab === 'premade' && (
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <PremadeRoutineList presetRoutines={presetRoutines} />
            </Motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default TrainingProgram;