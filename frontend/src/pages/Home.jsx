import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import WallOfFame from "../components/WallOfFame";
import StreaksGadget from "../components/StreaksGadget";
import HistoryGadget from "../components/HistoryGadget";
import TrainingProgram from "../components/TrainingProgram";
import LoadingBackdrop from "../components/LoadingBackdrop";
import LearnTheExercises from "../components/LearnTheExercises";
import { UseAuth } from "../context/AuthContext";
import {
  createUser,
  getUser,
  getUserAccumulatedStats,
} from "../controllers/UserController";
import { getExercisesThumbnails } from "../controllers/ExerciseController";
import { ensureInitialPersonalizedProgram } from "../utils/generatePersonalizedProgram";
import theme from "../theme";

const Home = () => {
  const { user } = UseAuth();
  const navigate = useNavigate();

  // Main data states
  const [userInfo, setUserInfo] = useState(null);
  const [userAccumulatedStats, setUserAccumulatedStats] = useState(null);
  const [exerciseInfo, setExerciseInfo] = useState([]);

  // Loading states for each data source
  const [userInfoLoaded, setUserInfoLoaded] = useState(false);
  const [userStatsLoaded, setUserStatsLoaded] = useState(false);
  const [exerciseInfoLoaded, setExerciseInfoLoaded] = useState(false);

  // Overall loading and generating states
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Refs to prevent duplicate processing
  const initializedForUserId = useRef(null);
  const programGenerationAttempted = useRef(false);

  // Remove hash from URL after Google OAuth redirect
  useEffect(() => {
    if (window.location.href.includes("#")) {
      navigate(window.location.pathname, { replace: true });
    }
  }, [navigate]);

  // Ensure minimal user profile exists for Google sign-in users
  useEffect(() => {
    const ensureUserProfile = async () => {
      if (!user) return;
      if (initializedForUserId.current === user.id) return;

      try {
        // For Google sign-in users (no registration data in DB yet), ensure minimal profile exists
        await createUser({
          id: user.id,
          name: user?.user_metadata?.full_name || user?.email || '',
        });
        initializedForUserId.current = user.id;
      } catch (error) {
        console.error('Error ensuring user profile:', error);
      }
    };

    ensureUserProfile();
  }, [user]);

  // Load user data, accumulated stats, and exercise thumbnails
  useEffect(() => {
    if (!user) return;

    const loadUserData = async () => {
      try {
        const fetchedUserInfo = await getUser(user);
        setUserInfo(fetchedUserInfo);
        setUserInfoLoaded(true);

        const stats = await getUserAccumulatedStats(user.id);
        setUserAccumulatedStats(stats);
        setUserStatsLoaded(true);
      } catch (error) {
        console.error("Error loading user data:", error);
        setUserInfoLoaded(true);
        setUserStatsLoaded(true);
      }
    };

    const loadExerciseData = async () => {
      try {
        const exercises = await getExercisesThumbnails();
        setExerciseInfo(exercises || []);
        setExerciseInfoLoaded(true);
      } catch (error) {
        console.error("Error loading exercises:", error);
        setExerciseInfoLoaded(true);
      }
    };

    loadUserData();
    loadExerciseData();
  }, [user]);

  // Switch loading backdrop off when all data is loaded
  useEffect(() => {
    if (userInfoLoaded && userStatsLoaded && exerciseInfoLoaded) {
      setLoading(false);
    }
  }, [userInfoLoaded, userStatsLoaded, exerciseInfoLoaded]);

  // Track if program was just created to trigger UI refresh
  const [programCreated, setProgramCreated] = useState(false);

  // Generate personalized program for new users (if they don't have one)
  useEffect(() => {
    // Only run if user is authenticated
    if (!user) return;
    if (programGenerationAttempted.current) return;

    const fetchAndGenerateProgram = async () => {
      try {
        programGenerationAttempted.current = true;
        setGenerating(true);

        // This function checks if user has programs, if not it generates one
        // It uses buildPromptFromUserProfile internally which handles null settings
        const program = await ensureInitialPersonalizedProgram(user);
        
        if (program) {
          console.log("Program ready:", program.name || program.id);
          // Signal that program was created to refresh TrainingProgram
          setProgramCreated(true);
        }
      } catch (error) {
        console.error("Error ensuring personalized program:", error);
      } finally {
        setGenerating(false);
      }
    };

    fetchAndGenerateProgram();
  }, [user]);

  // Prepare history data for gadgets
  const historyData = userAccumulatedStats?.data || userAccumulatedStats || []

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Welcome Header
      <Motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1
          className="text-3xl md:text-4xl font-bold mb-2"
          style={{ color: theme.colors.text.primary }}
        >
          Welcome Back! 👋
        </h1>
        <p
          className="text-base md:text-lg"
          style={{ color: theme.colors.text.secondary }}
        >
          Track your progress and stay motivated on your fitness journey
        </p>
      </Motion.div> */}

      {/* Loading/Generating Backdrop */}
      <LoadingBackdrop loading={loading} generating={generating} />

      {/* Training Program Section - Full Width */}
      <Motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
        variants={itemVariants}
      >
        <TrainingProgram refreshTrigger={programCreated} />
      </Motion.div>

      <Motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 lg:space-y-8"
      >
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column - Streaks and History */}
          <div className="space-y-6 lg:space-y-8">
            {/* Streaks Section */}
            <Motion.div variants={itemVariants}>
              {loading ? (
                <SkeletonCard height="200px" />
              ) : (
                <StreaksGadget
                  userInfo={userInfo}
                  history={Array.isArray(historyData) ? historyData : []}
                />
              )}
            </Motion.div>

            {/* History/Progress Section */}
            <Motion.div variants={itemVariants}>
              {loading ? (
                <SkeletonCard height="350px" />
              ) : (
                <HistoryGadget
                  history={Array.isArray(historyData) ? historyData : []}
                />
              )}
            </Motion.div>
          </div>

          {/* Right Column - Wall of Fame + LearnTheExercises */}
          <Motion.div className="space-y-6 lg:space-y-8">
            <Motion.div variants={itemVariants}>
              {loading ? (
                <SkeletonCard height="250px" />
              ) : (
                <WallOfFame userInfo={userInfo} />
              )}
            </Motion.div>
            <Motion.div variants={itemVariants}>
              {loading ? (
                <SkeletonCard height="200px" />
              ) : (
                <LearnTheExercises exerciseInfo={exerciseInfo} />
              )}
            </Motion.div>
          </Motion.div>
        </div>
      </Motion.div>
    </div>
  );
};

// Skeleton placeholder component for loading states
const SkeletonCard = ({ height = "200px" }) => (
  <div
    className="rounded-2xl animate-pulse"
    style={{
      backgroundColor: theme.colors.background.card,
      height,
    }}
  >
    <div className="p-6 space-y-4">
      <div
        className="h-6 rounded w-1/3"
        style={{ backgroundColor: theme.colors.border.light }}
      />
      <div
        className="h-4 rounded w-2/3"
        style={{ backgroundColor: theme.colors.border.light }}
      />
      <div
        className="h-4 rounded w-1/2"
        style={{ backgroundColor: theme.colors.border.light }}
      />
    </div>
  </div>
);

export default Home;
