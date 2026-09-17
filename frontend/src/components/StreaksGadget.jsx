import React from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { Calendar } from "lucide-react";
import CustomButton from "./CustomButton";
import theme from "../theme";
import flameSolid1 from "../assets/flame-solid_1.svg";
import flameSolid2 from "../assets/flame-solid_2.svg";

// Dummy workout history data
const DUMMY_HISTORY = [
  { date: "2024-11-01", minutes: 30, user_id: "1" },
  { date: "2024-11-03", minutes: 25, user_id: "1" },
  { date: "2024-11-05", minutes: 40, user_id: "1" },
  { date: "2024-11-08", minutes: 35, user_id: "1" },
  { date: "2024-11-10", minutes: 30, user_id: "1" },
  { date: "2024-11-12", minutes: 45, user_id: "1" },
  { date: "2024-11-15", minutes: 30, user_id: "1" },
];

// Helper function to get start of week (Monday)
const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

// Calculate streaks
const calculateStreaks = (history) => {
  if (!history || history.length === 0) {
    return { currentStreak: 0, maxStreak: 0 };
  }

  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const weekRecords = {};

  // Group records by week
  sortedHistory.forEach((entry) => {
    const date = new Date(entry.date);
    const weekStart = getStartOfWeek(date);
    const weekKey = weekStart.toISOString();

    if (!weekRecords[weekKey]) {
      weekRecords[weekKey] = new Set();
    }
    weekRecords[weekKey].add(date.getDay());
  });

  // Calculate streaks (3+ workouts per week)
  let currentStreak = 0;
  let maxStreak = 0;
  let ongoingStreak = 0;
  let currentStreakActive = true;

  const weeks = Object.keys(weekRecords).sort((a, b) => new Date(b) - new Date(a));

  weeks.forEach((week, i) => {
    if (weekRecords[week].size >= 3) {
      ongoingStreak += 1;
      if (currentStreakActive) {
        currentStreak = ongoingStreak;
      }
      maxStreak = Math.max(maxStreak, ongoingStreak);
    } else {
      if (i !== 0) {
        currentStreakActive = false;
      }
      ongoingStreak = 0;
    }
  });

  return { currentStreak, maxStreak };
};

// Week Picker Component
const WeekPicker = ({ scheduledDates = [] }) => {
  const today = new Date();
  const startOfWeek = getStartOfWeek(today);
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  const isScheduled = (date) => {
    return scheduledDates.some(
      (scheduled) =>
        new Date(scheduled).toDateString() === date.toDateString()
    );
  };

  const isToday = (date) => {
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="flex gap-2 justify-center">
      {weekDates.map((date, index) => {
        const scheduled = isScheduled(date);
        const todayDate = isToday(date);

        return (
          <Motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex flex-col items-center gap-1"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                scheduled
                  ? "scale-110"
                  : ""
              }`}
              style={{
                backgroundColor: scheduled
                  ? theme.colors.primary.blue
                  : theme.colors.background.sidebar,
                color: scheduled
                  ? theme.colors.text.light
                  : theme.colors.text.secondary,
                border: todayDate ? `2px solid ${theme.colors.primary.pink}` : "none",
              }}
            >
              {days[index]}
            </div>
            <span
              className="text-xs"
              style={{ color: theme.colors.text.secondary }}
            >
              {date.getDate()}
            </span>
          </Motion.div>
        );
      })}
    </div>
  );
};

const StreaksGadget = ({ userInfo = null, history = DUMMY_HISTORY }) => {
  const navigate = useNavigate();
  const streak = calculateStreaks(history);
  const scheduledDates = history.map((h) => new Date(h.date));

  return (
    <div
      className="flex flex-col items-center gap-6 p-6 rounded-2xl border"
      style={{ 
        backgroundColor: theme.colors.background.card,
        borderColor: theme.colors.border.light
      }}
    >
      {/* Streak Cards */}
      <div className="flex flex-row gap-8 w-full justify-center">
        {/* Current Streak */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-3"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
          >
            <img src={flameSolid1} alt="Week Streak" className="w-10 h-10" />
          </div>
          <div className="text-center">
            <p
              className="text-3xl font-bold"
              style={{ color: theme.colors.text.primary }}
            >
              {userInfo ? streak.currentStreak : 0}
            </p>
            <p
              className="text-sm font-medium"
              style={{ color: theme.colors.text.secondary }}
            >
              Week Streaks
            </p>
          </div>
        </Motion.div>

        {/* Best Streak */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col items-center gap-3"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
          >
            <img src={flameSolid2} alt="Best Streak" className="w-10 h-10" />
          </div>
          <div className="text-center">
            <p
              className="text-3xl font-bold"
              style={{ color: theme.colors.text.primary }}
            >
              {userInfo ? streak.maxStreak : 0}
            </p>
            <p
              className="text-sm font-medium"
              style={{ color: theme.colors.text.secondary }}
            >
              Best Streaks
            </p>
          </div>
        </Motion.div>
      </div>

      {/* Week Picker Section */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col items-center gap-4 w-full"
      >
        <div className="flex items-center gap-2">
          <Calendar size={20} style={{ color: theme.colors.primary.blue }} />
          <p
            className="text-base font-semibold"
            style={{ color: theme.colors.text.primary }}
          >
            This Week
          </p>
        </div>
        <WeekPicker scheduledDates={scheduledDates} />
      </Motion.div>

      {/* Description */}
      <p
        className="text-center"
        style={{ color: theme.colors.text.secondary }}
      >
        Exercise at least 3 times a week to keep your streak not reset
      </p>

      {/* Action Button */}
      <div className="w-full max-w-xs">
        <CustomButton
          text="Today's Routine"
          variant="primary"
          fullWidth={true}
          onClick={() => navigate("/home")}
        />
      </div>
    </div>
  );
};

export default StreaksGadget;
