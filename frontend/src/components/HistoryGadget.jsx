import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import CustomButton from "./CustomButton";
import theme from "../theme";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Dummy workout history data
const DUMMY_HISTORY = [
  { date: "2025-11-11", minutes: 30, calories: 150, user_id: "1" },
  { date: "2025-11-12", minutes: 25, calories: 125, user_id: "1" },
  { date: "2025-11-13", minutes: 40, calories: 200, user_id: "1" },
  { date: "2025-11-14", minutes: 35, calories: 175, user_id: "1" },
  { date: "2025-11-15", minutes: 30, calories: 150, user_id: "1" },
  { date: "2025-11-16", minutes: 45, calories: 225, user_id: "1" },
  { date: "2025-11-17", minutes: 30, calories: 150, user_id: "1" },
];

// Helper functions
const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

const isWithinInterval = (date, start, end) => {
  return date >= start && date <= end;
};

const HistoryGadget = ({ history = DUMMY_HISTORY }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [chartData, setChartData] = useState(null);
  const [totalDuration, setTotalDuration] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);

  useEffect(() => {
    updateChartData();
  }, [mode, currentDate, history]);

  const updateChartData = () => {
    let labels = [];
    let minutesData = [];
    let caloriesData = [];
    let start, end;

    if (mode === "week") {
      start = getStartOfWeek(currentDate);
      end = addDays(start, 6);
      labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      minutesData = Array(7).fill(0);
      caloriesData = Array(7).fill(0);

      history.forEach((entry) => {
        const entryDate = new Date(entry.date);
        if (isWithinInterval(entryDate, start, end)) {
          const day = entryDate.getDay();
          const dayIndex = day === 0 ? 6 : day - 1;
          minutesData[dayIndex] += entry.minutes;
          caloriesData[dayIndex] += entry.calories;
        }
      });
    } else if (mode === "month") {
      start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const daysInMonth = end.getDate();
      labels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
      minutesData = Array(daysInMonth).fill(0);
      caloriesData = Array(daysInMonth).fill(0);

      history.forEach((entry) => {
        const entryDate = new Date(entry.date);
        if (isWithinInterval(entryDate, start, end)) {
          const dayIndex = entryDate.getDate() - 1;
          minutesData[dayIndex] += entry.minutes;
          caloriesData[dayIndex] += entry.calories;
        }
      });
    } else if (mode === "year") {
      start = new Date(currentDate.getFullYear(), 0, 1);
      end = new Date(currentDate.getFullYear(), 11, 31);
      labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      minutesData = Array(12).fill(0);
      caloriesData = Array(12).fill(0);

      history.forEach((entry) => {
        const entryDate = new Date(entry.date);
        if (isWithinInterval(entryDate, start, end)) {
          const monthIndex = entryDate.getMonth();
          minutesData[monthIndex] += entry.minutes;
          caloriesData[monthIndex] += entry.calories;
        }
      });
    }

    setTotalDuration(minutesData.reduce((acc, curr) => acc + curr, 0));
    setTotalCalories(caloriesData.reduce((acc, curr) => acc + curr, 0));

    setChartData({
      labels,
      datasets: [
        {
          label: "Minutes",
          data: minutesData,
          backgroundColor: theme.colors.primary.green,
          borderRadius: 5,
          barPercentage: 0.8,
        },
      ],
    });
  };

  const handleNext = () => {
    if (mode === "week") {
      setCurrentDate(addDays(currentDate, 7));
    } else if (mode === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (mode === "year") {
      setCurrentDate(addMonths(currentDate, 12));
    }
  };

  const handlePrevious = () => {
    if (mode === "week") {
      setCurrentDate(addDays(currentDate, -7));
    } else if (mode === "month") {
      setCurrentDate(addMonths(currentDate, -1));
    } else if (mode === "year") {
      setCurrentDate(addMonths(currentDate, -12));
    }
  };

  const getDateRangeText = () => {
    if (mode === "week") {
      const start = getStartOfWeek(currentDate);
      const end = addDays(start, 6);
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    } else if (mode === "month") {
      return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } else if (mode === "year") {
      return currentDate.getFullYear().toString();
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: theme.colors.text.primary,
        bodyColor: theme.colors.text.primary,
        borderColor: theme.colors.border.light,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: theme.colors.text.secondary,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: theme.colors.border.light,
        },
        ticks: {
          color: theme.colors.text.secondary,
        },
      },
    },
  };

  return (
    <div
      className="flex flex-col items-center gap-6 p-6 rounded-2xl border"
      style={{ 
        backgroundColor: theme.colors.background.card,
        borderColor: theme.colors.border.light
      }}
    >
      {/* Mode Selector */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-2 p-1 rounded-lg"
        style={{ backgroundColor: theme.colors.background.sidebar }}
      >
        {["week", "month", "year"].map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setCurrentDate(new Date());
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === m ? "shadow-md" : ""
            }`}
            style={{
              backgroundColor: mode === m ? theme.colors.primary.green : "transparent",
              color: mode === m ? theme.colors.text.light : theme.colors.text.secondary,
            }}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </Motion.div>

      {/* Date Range Navigator */}
      <div className="flex items-center justify-between w-full max-w-md gap-4">
        <button
          onClick={handlePrevious}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          style={{ color: theme.colors.primary.blue }}
        >
          <ChevronLeft size={24} />
        </button>
        <p
          className="text-base font-semibold"
          style={{ color: theme.colors.text.primary }}
        >
          {getDateRangeText()}
        </p>
        <button
          onClick={handleNext}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          style={{ color: theme.colors.primary.blue }}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Total Stats */}
      <div className="flex gap-4 items-baseline">
        <p
          className="text-base font-medium"
          style={{ color: theme.colors.text.secondary }}
        >
          Total:
        </p>
        <p
          className="text-xl font-bold"
          style={{ color: theme.colors.text.primary }}
        >
          {totalDuration} min, {totalCalories} kcal
        </p>
      </div>

      {/* Chart */}
      <Motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full h-64 md:h-80"
      >
        {chartData ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: theme.colors.text.secondary }}>No data available</p>
          </div>
        )}
      </Motion.div>

      {/* Description */}
      <p
        className="text-center text-sm"
        style={{ color: theme.colors.text.secondary }}
      >
        We help you track your progress as data and video as you becoming a better version of yourself.
      </p>

      {/* Action Button */}
      <div className="w-full max-w-xs">
        <CustomButton
          text="My History"
          variant="primary"
          fullWidth={true}
          onClick={() => navigate("/profile")}
        />
      </div>
    </div>
  );
};

export default HistoryGadget;
