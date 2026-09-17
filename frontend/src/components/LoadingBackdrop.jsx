import React from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import theme from "../theme";

/**
 * LoadingBackdrop - Full screen overlay for loading and generating states
 * @param {boolean} loading - Show loading spinner
 * @param {boolean} generating - Show generating message with fitness emojis
 */
const LoadingBackdrop = ({ loading = false, generating = false }) => {
  const isVisible = loading || generating;

  // Fitness-themed emojis for generating state
  const fitnessEmojis = ["💪", "🏋️", "🏃", "🧘", "🎯", "🔥"];
  const [emojiIndex, setEmojiIndex] = React.useState(0);

  React.useEffect(() => {
    if (generating) {
      const interval = setInterval(() => {
        setEmojiIndex((prev) => (prev + 1) % fitnessEmojis.length);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [generating, fitnessEmojis.length]);

  return (
    <AnimatePresence>
      {isVisible && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
          }}
        >
          <Motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="flex flex-col items-center gap-6 p-8 rounded-2xl"
            style={{
              backgroundColor: theme.colors.background.card,
              boxShadow: theme.shadows.lg,
            }}
          >
            {/* Spinner */}
            <div className="relative">
              <Motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-16 h-16 rounded-full border-4 border-t-transparent"
                style={{
                  borderColor: theme.colors.border.light,
                  borderTopColor: theme.colors.primary.pink,
                }}
              />
              {generating && (
                <Motion.span
                  key={emojiIndex}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center text-2xl"
                >
                  {fitnessEmojis[emojiIndex]}
                </Motion.span>
              )}
            </div>

            {/* Text */}
            <div className="text-center">
              <p
                className="text-lg font-semibold mb-2"
                style={{ color: theme.colors.text.primary }}
              >
                {generating
                  ? "Generating your personalized program..."
                  : "Loading..."}
              </p>
              {generating && (
                <p
                  className="text-sm"
                  style={{ color: theme.colors.text.secondary }}
                >
                  This may take a moment
                </p>
              )}
            </div>

            {/* Progress dots */}
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <Motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: theme.colors.primary.pink }}
                />
              ))}
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingBackdrop;
