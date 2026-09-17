import React, { useState, useEffect, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import CustomButton from "./CustomButton";
import theme from "../theme";

// Dummy badge data
const DUMMY_BADGES = [
  {
    id: 1,
    name: "First Workout",
    description: "Complete your first workout session",
    badge_url: "/src/assets/badge_placeholder.png",
  },
  {
    id: 2,
    name: "Week Warrior",
    description: "Complete 7 consecutive days of workouts",
    badge_url: "/src/assets/badge_placeholder.png",
  },
  {
    id: 3,
    name: "Posture Master",
    description: "Maintain perfect posture for 10 sessions",
    badge_url: "/src/assets/badge_placeholder.png",
  },
  {
    id: 4,
    name: "100 Reps",
    description: "Complete 100 total repetitions",
    badge_url: "/src/assets/badge_placeholder.png",
  },
  {
    id: 5,
    name: "Early Bird",
    description: "Complete 5 morning workouts",
    badge_url: "/src/assets/badge_placeholder.png",
  },
  {
    id: 6,
    name: "Consistency King",
    description: "Workout 20 days in a month",
    badge_url: "/src/assets/badge_placeholder.png",
  },
  {
    id: 7,
    name: "Endurance Pro",
    description: "Complete 50 total workout sessions",
    badge_url: "/src/assets/badge_placeholder.png",
  },
  {
    id: 8,
    name: "Speed Demon",
    description: "Complete a workout in under 15 minutes",
    badge_url: "/src/assets/badge_placeholder.png",
  },
];

// Dummy user achievements (some earned, some not)
const DUMMY_USER_ACHIEVEMENTS = [
  { achievement_id: 1, name: "First Workout", earned_at: "2024-01-15" },
  { achievement_id: 2, name: "Week Warrior", earned_at: "2024-02-20" },
  { achievement_id: 4, name: "100 Reps", earned_at: "2024-03-10" },
];

const WallOfFame = ({ userInfo = {} }) => {
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [badges, setBadges] = useState([]);
  const [itemsToShow, setItemsToShow] = useState(5);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredBadge, setHoveredBadge] = useState(null);
  const boxRef = useRef(null);

  useEffect(() => {
    // Simulate earned badges
    const achievements = userInfo?.achievements || DUMMY_USER_ACHIEVEMENTS;
    const earnedBadgesMap = new Map(
      achievements.map((achievement) => [achievement.achievement_id, achievement])
    );

    // Create badges array
    const earnedBadges = DUMMY_BADGES.map((badge) => {
      const achievement = earnedBadgesMap.get(badge.id);
      return {
        ...badge,
        earned_at: achievement?.earned_at || null,
      };
    });

    // Sort: earned badges first
    earnedBadges.sort((a, b) => {
      if (!a.earned_at) return 1;
      if (!b.earned_at) return -1;
      return new Date(a.earned_at) - new Date(b.earned_at);
    });

    setBadges(earnedBadges);

    // Resize observer
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      const newItemsToShow = width < 500 ? 3 : 5;
      setItemsToShow(newItemsToShow);
    });

    if (boxRef.current) {
      observer.observe(boxRef.current);
    }

    return () => {
      if (boxRef.current) {
        observer.unobserve(boxRef.current);
      }
    };
  }, [userInfo]);

  const canNavigate = badges.length > itemsToShow;
  const canGoNext = canNavigate && currentIndex + itemsToShow < badges.length;
  const canGoPrev = canNavigate && currentIndex > 0;

  const handleNext = () => {
    if (canGoNext) {
      setCurrentIndex((prev) => prev + itemsToShow);
    }
  };

  const handlePrevious = () => {
    if (canGoPrev) {
      setCurrentIndex((prev) => Math.max(0, prev - itemsToShow));
    }
  };

  const displayBadges = badges.slice(currentIndex, currentIndex + itemsToShow);
  const earnedCount = badges.filter((b) => b.earned_at).length;

  return (
    <>
      <div
        ref={boxRef}
        className="flex flex-col items-center w-full gap-6 p-6 rounded-2xl border"
        style={{ 
          backgroundColor: theme.colors.background.card,
          borderColor: theme.colors.border.light
        }}
      >
        {/* Title */}
        <h2
          className="text-2xl font-bold"
          style={{ color: theme.colors.text.primary }}
        >
          Wall of Fame
        </h2>

        {/* Badge Carousel */}
        <div className="flex items-center justify-between w-full gap-2">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={!canGoPrev}
            className="p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
            style={{ color: theme.colors.primary.blue }}
          >
            <ChevronLeft size={24} />
          </button>

          {/* Badges Display */}
          <div className="flex-1 flex justify-center items-center gap-2 md:gap-4">
            {displayBadges.map((badge, index) => (
              <Motion.div
                key={badge.id || index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="relative flex-1 max-w-[70px]"
                onMouseEnter={() => badge.earned_at && setHoveredBadge(badge)}
                onMouseLeave={() => setHoveredBadge(null)}
              >
                <img
                  src={badge.badge_url}
                  alt={badge.name}
                  className={`w-full h-auto object-contain transition-transform duration-200 hover:scale-110 cursor-pointer ${
                    !badge.earned_at ? "opacity-30 grayscale" : ""
                  }`}
                />
                
                {/* Tooltip on hover */}
                {hoveredBadge?.id === badge.id && (
                  <Motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-10"
                    style={{ backgroundColor: theme.colors.primary.blue }}
                  >
                    <p className="text-xs font-semibold text-white">
                      {badge.name}
                    </p>
                    <div
                      className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
                      style={{ borderTopColor: theme.colors.primary.blue }}
                    />
                  </Motion.div>
                )}
              </Motion.div>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className="p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
            style={{ color: theme.colors.primary.blue }}
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Description */}
        <p
          className="text-center text-sm md:text-base"
          style={{ color: theme.colors.text.secondary }}
        >
          Keep up with your exercise plan to earn new surprises
        </p>

        {/* View All Button */}
        <div className="w-full max-w-xs">
          <CustomButton
            text="View All"
            variant="primary"
            fullWidth={true}
            onClick={() => setShowAllBadges(true)}
          />
        </div>
      </div>

      {/* Modal - All Badges */}
      <AnimatePresence>
        {showAllBadges && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
            onClick={() => setShowAllBadges(false)}
          >
            <Motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl p-6 overflow-y-auto"
              style={{ backgroundColor: theme.colors.background.card }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowAllBadges(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ color: theme.colors.text.secondary }}
              >
                <X size={24} />
              </button>

              {/* Modal Header */}
              <div className="text-center mb-6">
                <h2
                  className="text-2xl md:text-3xl font-bold mb-2"
                  style={{ color: theme.colors.text.primary }}
                >
                  Wall of Fame
                </h2>
                <p
                  className="text-lg"
                  style={{ color: theme.colors.text.secondary }}
                >
                  Achieved: {earnedCount} / {badges.length}
                </p>
              </div>

              {/* All Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {badges.map((badge, index) => (
                  <Motion.div
                    key={badge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl hover:shadow-lg transition-all cursor-pointer"
                    style={{
                      backgroundColor: badge.earned_at
                        ? theme.colors.background.softBlue
                        : theme.colors.background.sidebar,
                    }}
                  >
                    <img
                      src={badge.badge_url}
                      alt={badge.name}
                      className={`w-20 h-20 object-contain transition-transform duration-200 hover:scale-110 ${
                        !badge.earned_at ? "opacity-30 grayscale" : ""
                      }`}
                    />
                    <div className="text-center">
                      <p
                        className="font-semibold text-sm mb-1"
                        style={{ color: theme.colors.text.primary }}
                      >
                        {badge.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: theme.colors.text.secondary }}
                      >
                        {badge.description}
                      </p>
                      {badge.earned_at && (
                        <p
                          className="text-xs mt-2 font-medium"
                          style={{ color: theme.colors.primary.green }}
                        >
                          Unlocked: {new Date(badge.earned_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </Motion.div>
                ))}
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WallOfFame;
