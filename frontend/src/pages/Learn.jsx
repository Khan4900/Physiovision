import React, { useState, useEffect, useMemo } from 'react';
import { motion as Motion } from 'framer-motion';
import theme from '../theme';
import { useNavigate } from 'react-router-dom';
import ExerciseCard from './Exercise Library/ExerciseCard';
import Pagination from '../components/Pagination';
import { LEARN_EXERCISES } from '../data/exercises';

// Dummy reference data
const DUMMY_MUSCLE_GROUPS = [
  { id: 0, name: 'All' },
  { id: 1, name: 'Chest' },
  { id: 2, name: 'Back' },
  { id: 3, name: 'Legs' },
  { id: 4, name: 'Shoulders' },
  { id: 5, name: 'Arms' },
];

const DUMMY_GOALS = [
  { id: 0, name: 'All' },
  { id: 1, name: 'Strength' },
  { id: 2, name: 'Endurance' },
  { id: 3, name: 'Flexibility' },
  { id: 4, name: 'Mobility' },
];

// Shared augmented dataset from centralized file
const DUMMY_EXERCISES = LEARN_EXERCISES;

const ITEMS_PER_PAGE = 9;

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${active ? 'shadow-md' : ''}`}
    style={{
      backgroundColor: active ? theme.colors.primary.blue : 'transparent',
      color: active ? theme.colors.text.light : theme.colors.text.secondary,
    }}
  >
    {children}
  </button>
);

const SelectBox = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-1 min-w-[160px]">
    <label className="text-xs font-medium" style={{ color: theme.colors.text.secondary }}>{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="px-3 py-2 rounded-lg text-sm outline-none"
      style={{
        backgroundColor: theme.colors.background.sidebar,
        color: theme.colors.text.primary,
        border: `1px solid ${theme.colors.border.light}`,
      }}
    >
      {options.map(opt => (
        <option key={opt.id} value={opt.id}>{opt.name}</option>
      ))}
    </select>
  </div>
);

const Learn = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0); // 0 by muscle, 1 by goal
  const [muscleGroups] = useState(DUMMY_MUSCLE_GROUPS);
  const [goals] = useState(DUMMY_GOALS);
  const [exercises] = useState(DUMMY_EXERCISES);
  const [filteredExercises, setFilteredExercises] = useState(DUMMY_EXERCISES);
  const [selectedMuscleGroupID, setSelectedMuscleGroupID] = useState(0);
  const [selectedGoalID, setSelectedGoalID] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Simulate async load
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  // Filtering logic
  useEffect(() => {
    let filtered = exercises;
    if (tab === 0) {
      filtered = selectedMuscleGroupID === 0 ? exercises : exercises.filter(ex => ex.hasMuscleGroup(selectedMuscleGroupID));
    } else {
      filtered = selectedGoalID === 0 ? exercises : exercises.filter(ex => ex.hasGoal(selectedGoalID));
    }
    setFilteredExercises(filtered);
    setPage(1);
  }, [tab, selectedMuscleGroupID, selectedGoalID, exercises]);

  const pagesCount = Math.ceil(filteredExercises.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const pageItems = filteredExercises.slice(startIndex, endIndex);

  const gridContent = useMemo(() => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border animate-pulse flex flex-col gap-3" style={{ borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.card }}>
              <div className="h-32 rounded-lg" style={{ backgroundColor: theme.colors.background.softBlue }} />
              <div className="h-4 w-3/4 rounded" style={{ backgroundColor: theme.colors.background.softPink }} />
              <div className="flex gap-2">
                <div className="h-3 w-10 rounded" style={{ backgroundColor: theme.colors.background.softGreen }} />
                <div className="h-3 w-10 rounded" style={{ backgroundColor: theme.colors.background.softGreen }} />
              </div>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {pageItems.map(ex => {
          const primaryMuscle = DUMMY_MUSCLE_GROUPS.find(m => m.id === ex.muscleGroupIds[0])?.name || 'General';
          return (
            <div key={ex.id}>
              <ExerciseCard
                title={ex.name}
                type={primaryMuscle}
                duration={ex.duration}
                difficulty={ex.difficulty}
                imageUrl={ex.thumbnail}
                onStart={() => navigate(`/learn/${ex.id}`)}
                buttonText="Learn Exercise"
              />
            </div>
          );
        })}
      </div>
    );
  }, [loading, pageItems, navigate]);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: theme.colors.text.primary }}>Learn Exercises</h1>
          <p style={{ color: theme.colors.text.secondary }}>Browse exercises by muscle group or fitness goal.</p>
        </div>
        <div className="flex gap-2 p-1 rounded-lg" style={{ backgroundColor: theme.colors.background.sidebar }}>
          <TabButton active={tab === 0} onClick={() => { setTab(0); setSelectedGoalID(0); }}>By Muscle</TabButton>
          <TabButton active={tab === 1} onClick={() => { setTab(1); setSelectedMuscleGroupID(0); }}>By Goal</TabButton>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        {tab === 0 && (
          <SelectBox
            label="Muscle Group"
            value={selectedMuscleGroupID}
            onChange={setSelectedMuscleGroupID}
            options={muscleGroups}
          />
        )}
        {tab === 1 && (
          <SelectBox
            label="Goal"
            value={selectedGoalID}
            onChange={setSelectedGoalID}
            options={goals}
          />
        )}
      </div>

      {/* Grid */}
      {gridContent}

      {/* Pagination */}
      <div className="mt-4 flex justify-center">
        <Pagination currentPage={page} totalPages={pagesCount} onPageChange={setPage} />
      </div>

      {/* Footer note */}
      <p className="text-center text-xs" style={{ color: theme.colors.text.secondary }}>Data is simulated. Connect to backend to load real exercises.</p>
    </div>
  );
};

export default Learn;
