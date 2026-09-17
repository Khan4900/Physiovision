import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CustomButton from "./CustomButton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import theme from "../theme";
import { EXERCISES } from '../data/exercises';

const MasterTheMoves = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(2);
  const containerRef = useRef(null);

  // Only show first 4 exercises
  const displayExercises = EXERCISES.slice(0, 12);

  useEffect(() => {
    const handleResize = () => {
      const width = containerRef.current?.offsetWidth || window.innerWidth;
      if (width < 480) setItemsPerPage(1);
      else if (width < 700) setItemsPerPage(2);
      else setItemsPerPage(3);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalPages = Math.ceil(displayExercises.length / itemsPerPage);
  const currentItems = displayExercises.slice(
    currentPage * itemsPerPage,
    currentPage * itemsPerPage + itemsPerPage
  );

  // Fill with dummy cards if needed
  const filledItems = [...currentItems];
  while (filledItems.length < itemsPerPage) {
    filledItems.push({ id: `dummy-${filledItems.length}`, title: "dummy" });
  }

  const handleNext = () => setCurrentPage((prev) => (prev + 1) % totalPages);
  const handlePrevious = () =>
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);

  return (
    <div
      className="rounded-xl p-4 flex flex-col items-center justify-center"
      style={{
        background: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.light}`,
        minHeight: '400px',
      }}
    >
      <h2
        className="text-xl font-bold mb-4 text-center"
        style={{ color: theme.colors.text.primary }}
      >
        Learn the Exercises with AR in 3d
      </h2>
      <div
        ref={containerRef}
        className="flex items-center justify-center w-full mb-4"
      >
        <button
          className="p-2 rounded-full hover:bg-transparent focus:outline-none"
          onClick={handlePrevious}
          aria-label="Previous"
        >
          <ChevronLeft size={24} style={{ color: theme.colors.primary.blue }} />
        </button>
        {filledItems.map((exercise) => (
          <div
            key={exercise.id}
            className="flex flex-col items-center cursor-pointer mx-2"
            style={{ width: 200 }}
            onClick={() => navigate(`/learn/${exercise.id}`)}
          >
            <div
              className="rounded-lg mb-2 transition-all duration-300 hover:scale-105"
              style={{
                width: 200,
                height: 200,
                background: theme.colors.background.card,
                border:
                  exercise.title === "dummy"
                    ? "none"
                    : `1px solid ${theme.colors.border.light}`,
                boxShadow: theme.shadows.sm,
              }}
            >
              {exercise.title !== "dummy" && (
                <img
                  src={exercise.imageUrl}
                  alt={exercise.title}
                  className="w-full h-full object-cover rounded-lg"
                  style={{ background: theme.colors.background.card }}
                />
              )}
            </div>
            <span
              className="font-semibold text-base"
              style={{ color: theme.colors.text.primary }}
            >
              {exercise.title === "dummy" ? "" : exercise.title}
            </span>
          </div>
        ))}
        <button
          className="p-2 rounded-full hover:bg-transparent focus:outline-none"
          onClick={handleNext}
          aria-label="Next"
        >
          <ChevronRight
            size={24}
            style={{ color: theme.colors.primary.blue }}
          />
        </button>
      </div>
      <p
        className="mb-4 text-center"
        style={{ color: theme.colors.text.secondary }}
      >
        Learning how to move correctly would significantly increase your
        efficiency. We have some good tips for you, check it out!
      </p>
      <div className="w-full max-w-xs">
        <CustomButton
          text="Start Learning"
          onClick={() => navigate("/learn")}
          variant="primary"
          fullWidth={true}
          type="button"
        />
      </div>
    </div>
  );
};

export default MasterTheMoves;
