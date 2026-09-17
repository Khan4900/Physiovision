import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Dumbbell, Clock, Target, Zap, User } from "lucide-react";
import { motion as Motion } from "framer-motion";
import theme from "../theme";
import CustomButton from "../components/CustomButton";
import XrHitModelContainer from "../components/XRHitModelContainer/XRHitModelContainer";
import { EXERCISE_DETAILS } from "../data/exercises";

const LearnExercise = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [exercise, setExercise] = useState(null);
  const [selectedGender, setSelectedGender] = useState("male");

  useEffect(() => {
    // Simulate loading exercise data
    const loadExercise = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      const exerciseData = EXERCISE_DETAILS[id] || EXERCISE_DETAILS[1];
      setExercise(exerciseData);
      setLoading(false);
    };
    loadExercise();
  }, [id]);

  const MemoizedIframe = useMemo(() => {
    return exercise?.video_url ? (
      <iframe
        src={exercise.video_url}
        title={exercise.name}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        onLoad={() => setVideoLoading(false)}
        className="w-full h-full border-none"
        style={{ aspectRatio: "16 / 9" }}
      />
    ) : null;
  }, [exercise?.video_url, exercise?.name]);

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full max-w-4xl space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-48" />
          <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 lg:px-16">
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Back Button */}
        <Motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          onClick={() => navigate("/learn")}
          className="flex items-center text-lg font-medium transition-colors"
          style={{ color: theme.colors.text.primary }}
        >
          <ChevronLeft className="mr-1" size={24} />
          Back to Exercises
        </Motion.button>

        {/* Exercise Title */}
        <Motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1
            className="text-3xl font-bold"
            style={{ color: theme.colors.text.primary }}
          >
            {exercise?.name}
          </h1>
          <p style={{ color: theme.colors.text.secondary }}>
            {exercise?.description}
          </p>
        </Motion.div>

        {/* Exercise Stats Row */}
        <Motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-4"
        >
          <div
            className="flex flex-col items-center p-4 rounded-xl"
            style={{ background: theme.colors.background.softBlue }}
          >
            <Clock
              size={28}
              style={{ color: theme.colors.primary.blue }}
              className="mb-2"
            />
            <span
              className="text-sm font-medium"
              style={{ color: theme.colors.text.secondary }}
            >
              Duration
            </span>
            <span
              className="text-xl font-bold"
              style={{ color: theme.colors.text.primary }}
            >
              {exercise?.duration}
            </span>
          </div>
          <div
            className="flex flex-col items-center p-4 rounded-xl"
            style={{ background: theme.colors.background.softPink }}
          >
            <Zap
              size={28}
              style={{ color: theme.colors.primary.pink }}
              className="mb-2"
            />
            <span
              className="text-sm font-medium"
              style={{ color: theme.colors.text.secondary }}
            >
              Difficulty
            </span>
            <span
              className="text-xl font-bold"
              style={{ color: theme.colors.text.primary }}
            >
              {exercise?.difficulty}
            </span>
          </div>
          <div
            className="flex flex-col items-center p-4 rounded-xl"
            style={{ background: theme.colors.background.softGreen }}
          >
            <Target
              size={28}
              style={{ color: theme.colors.primary.green }}
              className="mb-2"
            />
            <span
              className="text-sm font-medium"
              style={{ color: theme.colors.text.secondary }}
            >
              Type
            </span>
            <span
              className="text-xl font-bold"
              style={{ color: theme.colors.text.primary }}
            >
              {exercise?.types[0]}
            </span>
          </div>
        </Motion.div>

        {/* 3D AR Model Viewer */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3
            className="text-2xl justify-center font-bold mb-4 text-center"
            style={{ color: theme.colors.text.primary }}
          >
            3D Model Viewer
          </h3>
          
          {/* Gender Selector */}
          <div className="flex justify-center items-center mb-4">
            <div
              className="inline-flex rounded-lg p-1"
              style={{ background: theme.colors.background.light }}
            >
              <button
                onClick={() => setSelectedGender("male")}
                className={`flex items-center gap-2 px-6 py-2 rounded-md font-medium transition-all ${
                  selectedGender === "male" ? "text-white" : ""
                }`}
                style={{
                  background:
                    selectedGender === "male"
                      ? theme.gradients.primary
                      : "transparent",
                  color:
                    selectedGender === "male"
                      ? "white"
                      : theme.colors.text.secondary,
                }}
              >
                <User size={18} />
                Male Model
              </button>
              <button
                onClick={() => setSelectedGender("female")}
                className={`flex items-center gap-2 px-6 py-2 rounded-md font-medium transition-all ${
                  selectedGender === "female" ? "text-white" : ""
                }`}
                style={{
                  background:
                    selectedGender === "female"
                      ? theme.gradients.primary
                      : "transparent",
                  color:
                    selectedGender === "female"
                      ? "white"
                      : theme.colors.text.secondary,
                }}
              >
                <User size={18} />
                Female Model
              </button>
            </div>
          </div>
          
          <div className="flex justify-center">
            <XrHitModelContainer
              modelName={exercise?.modelName}
              modelGender={selectedGender}
              zRotationMul={0.33}
              scaleMul={0.3}
            />
          </div>
        </Motion.div>

        {/* Exercise Details Section - Combined Card */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl flex items-center justify-center min-h-[500px]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
            {/* Left Column - Video Container */}
            <div className="flex flex-col justify-center">
              <h3
                className="text-xl font-bold mb-4"
                style={{ color: theme.colors.text.primary }}
              >
                Exercise Tutorial
              </h3>
              <div
                className="relative w-full bg-black rounded-xl overflow-hidden"
                style={{ aspectRatio: "16 / 9" }}
              >
                {videoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
                    <div
                      className="animate-spin rounded-full h-12 w-12 border-b-2"
                      style={{ borderColor: theme.colors.primary.blue }}
                    />
                  </div>
                )}
                {MemoizedIframe}
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-4 flex flex-col justify-center">
              {/* Muscle Groups */}
              <div>
                <h3
                  className="text-xl font-bold mb-4"
                  style={{ color: theme.colors.text.primary }}
                >
                  Muscle Groups
                </h3>
                <div className="flex flex-wrap gap-2">
                  {exercise?.muscleGroups.map((muscle, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-full text-sm font-medium"
                      style={{
                        background: theme.gradients.subtle,
                        color: theme.colors.text.primary,
                        border: `1px solid ${theme.colors.border.light}`,
                      }}
                    >
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>

              {/* Goals */}
              <div>
                <h3
                  className="text-xl font-bold mb-4"
                  style={{ color: theme.colors.text.primary }}
                >
                  Goals
                </h3>
                <div className="flex flex-wrap gap-2">
                  {exercise?.goals.map((goal, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-full text-sm font-medium text-white"
                      style={{
                        background: theme.gradients.primary,
                        boxShadow: theme.shadows.sm,
                      }}
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tips for Success */}
              <div>
                <h3
                  className="text-xl font-bold mb-4"
                  style={{ color: theme.colors.text.primary }}
                >
                  Tips for Success
                </h3>
                <ul className="space-y-2">
                  {exercise?.tips.map((tip, index) => (
                    <li key={index} className="flex items-start ">
                      <span
                        className="mr-2 mt-1 text-xl"
                        style={{ color: theme.colors.primary.blue }}
                      >
                        •
                      </span>
                      <span style={{ color: theme.colors.text.secondary }}>
                        {tip}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Motion.div>

        {/* Practice Button - Centered */}
        <Motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center pt-4"
        >
          <div className="w-full max-w-xs">
            <CustomButton
              text="Practice"
              variant="primary"
              fullWidth={true}
              onClick={() => {
                // Add practice navigation logic here
                console.log("Practice button clicked");
              }}
            />
          </div>
        </Motion.div>
      </div>
    </div>
  );
};

export default LearnExercise;
