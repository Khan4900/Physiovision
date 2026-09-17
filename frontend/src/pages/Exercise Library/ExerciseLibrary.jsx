import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../components/SearchBar";
import ExerciseFilters from "./ExerciseFilters";
import ExerciseCard from "./ExerciseCard";
import Pagination from "../../components/Pagination";
import { EXERCISES } from "../../data/exercises";

const ITEMS_PER_PAGE = 6;

const ExerciseLibrary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [exerciseType, setExerciseType] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("");
  const [duration, setDuration] = useState("");
  const [equipment, setEquipment] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const exercises = EXERCISES;

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !exerciseType || exercise.type.toLowerCase() === exerciseType.toLowerCase();
    const matchesDifficulty = !difficultyLevel || exercise.difficulty.toLowerCase() === difficultyLevel.toLowerCase();
    const matchesDuration = !duration || exercise.duration === parseInt(duration);
    
    return matchesSearch && matchesType && matchesDifficulty && matchesDuration;
  });

  const totalPages = Math.ceil(filteredExercises.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedExercises = filteredExercises.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const navigate = useNavigate();
  const handleStartExercise = (exerciseId) => {
    navigate("/session", { state: { id: String(exerciseId), idType: "exercise", reps: 10, record: false } });
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-[#030E16]">Exercise Library</h1>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search exercises..."
        />
      </div>

      <ExerciseFilters
        exerciseType={exerciseType}
        difficultyLevel={difficultyLevel}
        duration={duration}
        equipment={equipment}
        onExerciseTypeChange={setExerciseType}
        onDifficultyChange={setDifficultyLevel}
        onDurationChange={setDuration}
        onEquipmentChange={setEquipment}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedExercises.map(exercise => (
          <ExerciseCard
            key={exercise.id}
            {...exercise}
            onStart={() => handleStartExercise(exercise.id)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default ExerciseLibrary;
