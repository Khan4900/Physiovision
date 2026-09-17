import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Play, Pause, SkipForward, ChevronUp, ChevronDown } from "lucide-react";
import { UseAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
// MediaPipe
// @ts-ignore - type definitions may be missing in this project
import { PoseLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";
// Tailwind Session Components
import {
  Counter,
  RestTime,
  MetricCard,
  DemoExercise,
  Logo,
  ExitRoutineSessionModal,
  CompleteRoutineSessionModal,
  useLandscapeMode,
} from "./index.js";
// Motion logic
// @ts-ignore - JS file without types
import { exerciseCounterLoader } from "../utils/motionDetectLogic/exerciseCounterLoader.js";
// Exercise data
import { EXERCISES } from "../data/exercises.js";
// Local utils (keep title helper only if present)
// import { setPageTitle } from "../../utils/utils";

// Controllers (JS)
// @ts-ignore - JS file without types
import { getExercisesFromRoutine, getRoutine } from "../controllers/RoutineController";
// @ts-ignore - JS file without types
import { getExercise } from "../controllers/ExerciseController";

// Types
type Exercise = {
  exercise_id: string;
  name: string;
  goal: string;
  sets: number;
  reps: number;
  duration: number;
  rest_time: number;
  image: string;
};

// Inline styles for video/canvas layers
const videoStyles: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  backgroundColor: "rgba(0, 0, 0, 0.1)",
  filter: "brightness(1.0) contrast(1.2)",
};
const canvasStyles: React.CSSProperties = {
  position: "absolute",
  width: "100%",
  height: "100%",
  objectFit: "cover",
  top: 0,
  left: 0,
};
const gradientStyles: React.CSSProperties = {
  position: "absolute",
  width: "100%",
  height: "100%",
  objectFit: "cover",
  top: 0,
  left: 0,
  pointerEvents: "none",
  backgroundImage:
    "linear-gradient(to bottom, rgba(0, 0, 0, 0.9), transparent 15%, transparent 85%, rgba(0, 0, 0, 0.9))",
  zIndex: 1,
};

const isUuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

// Map Supabase Exercise UUIDs (seeded IDs) to local numeric IDs used by motion counters + EXERCISES.
// Keep this aligned with the IDs in generatePersonalizedProgram prompt.
const DB_EXERCISE_ID_TO_LOCAL_ID: Record<string, number> = {
  "013d2168-a5bb-448d-8a03-7456055a3e68": 1, // Push Ups
  "fb7180ab-f3e2-4a5d-b731-a2c0fc5de9fa": 2, // Squats
  "0cc22f75-7d4d-4d50-9cdd-4ae3c731c517": 3, // Jumping Jacks
  "7c12ed44-7dac-4b42-90c3-aa9a02dd251d": 4, // Plank
  "739c22c6-4dc7-434f-8434-7b851e6a37e6": 5, // Lunges
  "d2f2a53c-d882-4068-ad47-984e7742584e": 6, // Pull Ups
  "5adc2648-8c70-413b-ab66-fbb2f250104f": 7, // Bicep Curls
  "dacd227d-ccca-4cf4-a1d4-d7ec84259ce7": 8, // Bicycle Crunches
  "25e807c9-1a7b-440b-ab02-17b1b99d1430": 9, // Sit Ups
  "63eb2273-c7bd-4477-bf92-43a8836eb05e": 10, // Pike Walk

  // Yoga poses (IDs 11-22 in local EXERCISES)
  "1f102694-0d1d-417f-b987-7b0901791df1": 11, // Mountain Pose
  "adfe4fb5-ff55-4264-9fc5-11ec2a029f45": 12, // Warrior I
  "098bc494-cb6b-48f2-898a-63fa2ad6c1fb": 13, // Warrior II
  "2cce3fbd-e7ac-429a-8b76-3c8c2fa097cc": 14, // Tree Pose
  "9b31ece0-e0ac-4c62-af23-65eca4b1bf4e": 15, // Chair Pose
  "add14005-3df6-4676-beac-37c85043c13e": 16, // Eagle Pose
  "264138a6-48a7-4a87-a786-34323274a5d2": 17, // Garland Pose
  "1d525b26-817e-458e-ab00-9009deaa3fc5": 18, // Half Moon Pose
  "831dba61-737d-4193-8c80-536c52d57156": 19, // Big Toe Pose
  "29a009f5-5b0f-40a4-847d-7fc11f3cbaa0": 20, // Gate Pose
  "ed20ba04-27bd-4c72-bc0d-074c17a01c70": 21, // Revolved Triangle Pose
  "2c1ea41f-d45d-4dda-aeec-5c9921048e62": 22, // Dancer Pose
};

const normalizeToSeconds = (value: unknown): number => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num) || num <= 0) return 0;
  // Heuristic: if it's very large, it's probably milliseconds.
  return num > 1000 ? Math.round(num / 1000) : Math.round(num);
};

type NormalizedLandmarkLike = {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
  presence?: number;
};

const FULL_BODY_REQUIRED_LANDMARKS: Array<{ idx: number; label: string }> = [
  { idx: 11, label: "left shoulder" },
  { idx: 12, label: "right shoulder" },
  { idx: 23, label: "left hip" },
  { idx: 24, label: "right hip" },
  { idx: 25, label: "left knee" },
  { idx: 26, label: "right knee" },
  { idx: 27, label: "left ankle" },
  { idx: 28, label: "right ankle" },
];

const getLandmarkConfidence = (lm: NormalizedLandmarkLike | undefined): number => {
  if (!lm) return 0;
  const visibility = typeof lm.visibility === "number" ? lm.visibility : undefined;
  const presence = typeof lm.presence === "number" ? lm.presence : undefined;
  if (typeof visibility === "number") return visibility;
  if (typeof presence === "number") return presence;
  // Some builds don't expose visibility/presence; treat it as confident if it exists.
  return 1;
};

const isLandmarkInFrame = (lm: NormalizedLandmarkLike | undefined, padding = 0.02): boolean => {
  if (!lm) return false;
  const xOk = lm.x >= -padding && lm.x <= 1 + padding;
  const yOk = lm.y >= -padding && lm.y <= 1 + padding;
  return xOk && yOk;
};

const getFullBodyTrackingStatus = (
  landmarks: NormalizedLandmarkLike[] | undefined
): { isReady: boolean; message: string | null } => {
  if (!landmarks || landmarks.length === 0) {
    return { isReady: false, message: "Make sure your whole body is captured by the camera." };
  }

  const minConfidence = 0.6;
  const missing: string[] = [];

  for (const req of FULL_BODY_REQUIRED_LANDMARKS) {
    const lm = landmarks[req.idx];
    if (!lm) {
      missing.push(req.label);
      continue;
    }
    if (!isLandmarkInFrame(lm)) {
      missing.push(req.label);
      continue;
    }
    if (getLandmarkConfidence(lm) < minConfidence) {
      missing.push(req.label);
      continue;
    }
  }

  if (missing.length > 0) {
    return {
      isReady: false,
      message: "Show your full body (shoulders, hips, knees, ankles) to start tracking.",
    };
  }

  return { isReady: true, message: null };
};

export const ExerciseSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = UseAuth() as { user: { id: string } | null };
  const isLandscapeMode = useLandscapeMode();
  const {
    id = false,
    idType = null,
    reps = 0,
    scheduled_date = null,
    program_id = null,
  } = location.state || {}; // Receive from the StartRoutineModal as a prop

  // Note: Angle meters are temporarily removed as they are not an effective UI
  // const angleChangeThreshold = 3;
  // let previousAngle = null;
  // const [angle, setAngle] = useState(180);

  // --- State ---
  const [programId, setProgramId] = useState<string | null>(
    typeof program_id === "string" ? program_id : null
  );
  const [routineId, setRoutineId] = useState<string | null>(
    typeof id === "string" && idType === "routine" ? id : null
  );
  const [scheduledDate, setScheduledDate] = useState<string | null>(
    typeof scheduled_date === "string" ? scheduled_date : null
  );
  const [routine, setRoutine] = useState<Exercise[]>([]);
  const [exerciseCounter, setExerciseCounter] = useState<any>(null);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(0);
  const [successSetCount, setSuccessSetCount] = useState(0);
  const [successRepCount, setSuccessRepCount] = useState(0);
  const [calorie, setCalorie] = useState(0);
  const [score, setScore] = useState(0);
  const [postureAlert, setPostureAlert] = useState<string | null>(null);
  const [lastPostureAlertUpdate, setLastPostureAlertUpdate] = useState(0);
  const [webcamRunning, setWebcamRunning] = useState(false);
  // const [mediaRecorder, setMediaRecorder] = useState(null);
  // const [recordedChunks, setRecordedChunks] = useState([]);
  const [isExerciseMenuOpen, setIsExerciseMenuOpen] = useState(true);
  // const [isRecording, setIsRecording] = useState(false);
  const [isResting, setIsResting] = useState(true);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  // const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [restForSetIncrement, setRestForSetIncrement] = useState(false);
  const [restForNextExercise, setRestForNextExercise] = useState(true);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [poseSimilarity, setPoseSimilarity] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isYogaExercise, setIsYogaExercise] = useState(false);

  // --- Refs ---
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const poseLandmarkerRef = useRef<any>(null);
  const runningMode = useRef<"VIDEO" | "IMAGE">("VIDEO");
  const animationFrameIdRef = useRef<number | null>(null);
  const calorieUpdatedRef = useRef<boolean>(false);
  const startedAtRef = useRef<Date | null>(null);

  // ---------------------------------------------------------
  //                      useEffect Hooks
  // ---------------------------------------------------------

  // Initialization (MediaPipe PoseLandmarker, prepare routine info from navigation state)
  useEffect(() => {
    // setPageTitle(title);

    // Overwrite the style of #root
    const rootElement = document.getElementById("root");
    if (rootElement) {
      (rootElement as HTMLElement).style.margin = "0";
      (rootElement as HTMLElement).style.padding = "0";
      (rootElement as HTMLElement).style.width = "100%";
      (rootElement as HTMLElement).style.maxWidth = "100%";
    }

    // Get session start time
    if (!startedAtRef.current) {
      startedAtRef.current = new Date();
    }

    // Load voices for text-to-speech
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice =
        voices.find((v) => v.name.includes("Google US English")) || voices[0];
      setVoice(selectedVoice || null);
    };
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();

    // Setup MediaPipe PoseLandmarker when component mounts
    const createPoseLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm'
        );
        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task",
            delegate: "GPU",
          },
          runningMode: runningMode.current,
          numPoses: 1,
        });
        poseLandmarkerRef.current = poseLandmarker;
      } catch (error) {
        console.error("Error loading PoseLandmarker:", error);
      }
    };
    createPoseLandmarker();

    const bootstrapSessionFromBackend = async () => {
      try {
        // Routine session: load exercises from Supabase
        if (idType === "routine" && typeof id === "string") {
          setRoutineId(id);
          if (typeof scheduled_date === "string") setScheduledDate(scheduled_date);
          if (typeof program_id === "string") setProgramId(program_id);

          // Derive program_id / scheduled_date if not passed
          if (!programId || !scheduledDate) {
            let query = supabase
              .from("program_routine")
              .select("program_id, scheduled_date")
              .eq("routine_id", id);

            if (typeof scheduled_date === "string") {
              query = query.eq("scheduled_date", scheduled_date);
            }

            const { data: prRow, error: prErr } = await query
              .order("scheduled_date", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (prErr) {
              console.warn("Unable to load program_routine metadata", prErr);
            } else if (prRow) {
              setProgramId((prev) => prev ?? prRow.program_id ?? null);
              setScheduledDate((prev) => prev ?? prRow.scheduled_date ?? null);
            }
          }

          // Fetch routine + exercises from DB
          const routineInfo = await getRoutine(id);
          const dbExercises = await getExercisesFromRoutine(id);

          const sessionExercises: Exercise[] = (dbExercises ?? [])
            .slice()
            .sort((a: any, b: any) => Number(a.order ?? 0) - Number(b.order ?? 0))
            .map((ex: any) => {
              const dbExerciseId = String(ex.id);
              const localId = DB_EXERCISE_ID_TO_LOCAL_ID[dbExerciseId];
              const fallbackLocal = (EXERCISES as any[]).find(
                (e: any) =>
                  String(e.title || "").toLowerCase() ===
                  String(ex.name || "").toLowerCase()
              );
              const localExercise = (EXERCISES as any[]).find(
                (e: any) => String(e.id) === String(localId ?? fallbackLocal?.id)
              );

              const sets = Number(ex.sets ?? 1);
              const reps = Number(ex.reps ?? 0);
              const durationSeconds = normalizeToSeconds(ex.duration);
              const restSeconds = normalizeToSeconds(ex.rest_period ?? ex.rest_time ?? 0);

              const goal =
                reps > 0
                  ? `${sets} sets of ${reps} reps`
                  : durationSeconds > 0
                    ? `${sets} sets of ${durationSeconds} seconds`
                    : `${sets} sets`;

              return {
                // IMPORTANT: use local numeric IDs for motion counters when possible
                exercise_id: String(localExercise?.id ?? localId ?? dbExerciseId),
                name: String(ex.name ?? localExercise?.title ?? "Exercise"),
                goal,
                sets,
                reps,
                duration: durationSeconds,
                rest_time: restSeconds,
                image: String(localExercise?.imageUrl ?? ex.demo_url ?? ""),
              };
            });

          if (sessionExercises.length > 0) {
            setRoutine(sessionExercises);
          } else {
            // Fallback if DB routine has no exercises
            setRoutine([
              {
                exercise_id: "1",
                name: routineInfo?.name || "Routine",
                goal: "1 set",
                sets: 1,
                reps: Number(reps) || 10,
                duration: 0,
                rest_time: 0,
                image: "",
              },
            ]);
          }
          return;
        }

        // Single exercise session: try Supabase by UUID, else fallback to local EXERCISES
        if (idType === "exercise" && id) {
          const idStr = String(id);
          if (isUuid(idStr)) {
            const dbExercise = await getExercise(idStr, true);
            const localId = DB_EXERCISE_ID_TO_LOCAL_ID[idStr];
            const localExercise = (EXERCISES as any[]).find(
              (e: any) =>
                String(e.id) === String(localId) ||
                String(e.title || "").toLowerCase() === String(dbExercise?.name || "").toLowerCase()
            );
            setRoutine([
              {
                exercise_id: String(localExercise?.id ?? localId ?? idStr),
                name: String(dbExercise?.name ?? localExercise?.title ?? "Exercise"),
                goal: `1 set of ${Number(reps) || 10} reps`,
                sets: 1,
                reps: Number(reps) || 10,
                duration: 0,
                rest_time: 0,
                image: String(localExercise?.imageUrl ?? dbExercise?.demo_url ?? ""),
              },
            ]);
            return;
          }

          const localExercise = (EXERCISES as any[]).find((ex: any) => String(ex.id) === idStr);
          setRoutine([
            {
              exercise_id: idStr,
              name: String(localExercise?.title ?? "Exercise"),
              goal: `1 set of ${Number(reps) || 10} reps`,
              sets: 1,
              reps: Number(reps) || 10,
              duration: Number(localExercise?.duration ?? 0),
              rest_time: 0,
              image: String(localExercise?.imageUrl ?? ""),
            },
          ]);
          return;
        }

        // Fallback single exercise (pushups)
        setRoutine([
          {
            exercise_id: "1",
            name: "Push Ups",
            goal: `1 set of ${Number(reps) || 10} reps`,
            sets: 1,
            reps: Number(reps) || 10,
            duration: 0,
            rest_time: 0,
            image: "",
          },
        ]);
      } catch (e) {
        console.error("Failed to bootstrap session", e);
        // Fallback single exercise (pushups)
        setRoutine([
          {
            exercise_id: "1",
            name: "Push Ups",
            goal: `1 set of ${Number(reps) || 10} reps`,
            sets: 1,
            reps: Number(reps) || 10,
            duration: 0,
            rest_time: 0,
            image: "",
          },
        ]);
      }
    };

    void bootstrapSessionFromBackend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Enable webcam when videoRef is available
  //
  // Note: I can't detect the video element ready using useEffect.
  // So, I use MutationObserver to detect the video element ready.
  // Not sure, this is a right approach as a React
  // but use this for a workaround for the issue.
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (videoRef.current) {
        toggleWebCam();
        // Disconnect the observer after the video element is available
        observer.disconnect();
      }
    });

    // Check if the video element is available
    observer.observe(document, { childList: true, subtree: true });

    // Cleanup
    return () => {
      if (webcamRunning) toggleWebCam();
      observer.disconnect();
      // Cancel any queued speech on unmount
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recording disabled (per requirements)

  // Reset selected exercise index when routine changes
  useEffect(() => {
    if (routine && routine.length > 0) {
      setSelectedExerciseIndex(0);
    }
  }, [routine]);

  // Dynamically load exercise counter class based on selected exercise
  useEffect(() => {
    // Reset success count when exercise changes
    setSuccessRepCount(0);
    setSuccessSetCount(0);

    // Load exercise counter based on the selected exercise
    const selectedExercise = routine[selectedExerciseIndex];
    const CounterClass = loadExerciseCounter(selectedExercise);
    setExerciseCounter(CounterClass);
    
    // Check if this is a yoga exercise (IDs 4-15)
    const exerciseId = parseInt(selectedExercise?.exercise_id || '0');
    const isYoga = exerciseId >= 11 && exerciseId <= 22;
    setIsYogaExercise(isYoga);
  }, [selectedExerciseIndex, routine]);

  // Start prediction when webcam is running and not resting
  useEffect(() => {
    if (exerciseCounter && webcamRunning && !isResting) {
      predictPosture(); // Start prediction when webcam is running and not resting
    }

    // Cleanup
    return () => {
      clearCanvas();
      if (animationFrameIdRef.current) {
        window.cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseCounter, webcamRunning, isResting]);

  // Read out the rep count
  useEffect(() => {
    if (successRepCount !== 0) {
      readoutText(successRepCount);
    }
  }, [successRepCount]);

  // Read out the set count
  useEffect(() => {
    if (successSetCount !== 0) {
      readoutText("Great job!!");
    }
  }, [successSetCount]);

  // Read out the alert
  useEffect(() => {
    if (postureAlert) {
      readoutText(postureAlert);
    }
  }, [postureAlert]);

  const updateRoutineCompletionStatus = useCallback(async () => {
    if (!programId || !routineId || !scheduledDate) return;
    const { error } = await supabase
      .from("program_routine")
      .update({ completed: true })
      .eq("program_id", programId)
      .eq("routine_id", routineId)
      .eq("scheduled_date", scheduledDate);
    if (error) throw error;
  }, [programId, routineId, scheduledDate]);

  const insertRoutineHistory = useCallback(async () => {
    if (!user?.id || !routineId) return;
    const caloriesInt = Math.max(0, Math.round(Number(calorie) || 0));
    const scoreInt = Math.max(0, Math.round(Number(score) || 0));
    const { error } = await supabase.from("routine_history").insert({
      user_id: user.id,
      routine_id: routineId,
      calories: caloriesInt,
      score: scoreInt,
      completed_at: new Date().toISOString(),
    });
    if (error) throw error;
  }, [user?.id, routineId, calorie, score]);

  const updateUserAccumulatedStat = useCallback(async () => {
    if (!user?.id) return;
    const date = new Date().toISOString().slice(0, 10);
    const minutes = startedAtRef.current
      ? Math.max(
          0,
          Math.ceil((Date.now() - startedAtRef.current.getTime()) / (1000 * 60))
        )
      : 0;
    const caloriesInt = Math.max(0, Math.round(Number(calorie) || 0));

    const { data: existing, error: getErr } = await supabase
      .from("user_accumulated_stats")
      .select("minutes, calories")
      .eq("user_id", user.id)
      .eq("date", date)
      .maybeSingle();
    if (getErr) throw getErr;

    const nextMinutes = (existing?.minutes ?? 0) + minutes;
    const nextCalories = (existing?.calories ?? 0) + caloriesInt;

    const { error: upsertErr } = await supabase
      .from("user_accumulated_stats")
      .upsert(
        {
          user_id: user.id,
          date,
          minutes: nextMinutes,
          calories: nextCalories,
        },
        { onConflict: "user_id,date" }
      );
    if (upsertErr) throw upsertErr;
  }, [user?.id, calorie]);

  const updateUserProgressStats = useCallback(async () => {
    if (!user?.id) return;
    const caloriesInt = Math.max(0, Math.round(Number(calorie) || 0));
    const scoreInt = Math.max(0, Math.round(Number(score) || 0));

    const { data: progress, error: getErr } = await supabase
      .from("user_progress")
      .select("user_id, streak, highest_streak, highest_score, reached_goals")
      .eq("user_id", user.id)
      .maybeSingle();
    if (getErr) throw getErr;

    const nextStreak = Math.max(0, Number(progress?.streak ?? 0) + 1);
    const nextHighestStreak = Math.max(
      Number(progress?.highest_streak ?? 0),
      nextStreak
    );
    const nextHighestScore = Math.max(
      Number(progress?.highest_score ?? 0),
      scoreInt
    );

    // Simple heuristic: count completing a routine as reaching a goal when calories > 0
    const nextReachedGoals =
      Number(progress?.reached_goals ?? 0) + (caloriesInt > 0 ? 1 : 0);

    const { error: upsertErr } = await supabase
      .from("user_progress")
      .upsert(
        {
          user_id: user.id,
          streak: nextStreak,
          highest_streak: nextHighestStreak,
          highest_score: nextHighestScore,
          reached_goals: nextReachedGoals,
        },
        { onConflict: "user_id" }
      );
    if (upsertErr) throw upsertErr;
  }, [user?.id, calorie, score]);

  // Note: This is a workaround to prevent multiple calorie updates
  useEffect(() => {
    calorieUpdatedRef.current = false;
  }, [successRepCount]);

  // ---------------------------------------------------------
  //                      Event Handlers
  // ---------------------------------------------------------

  // Recording/upload disabled

  // Handle quitting the routine
  const handleQuitRoutine = () => {
      if (webcamRunning) toggleWebCam();
    setIsConfirmDialogOpen(true);
  };

  // Handle quitting the routine (Confirm)
  const handleConfirmQuit = () => {
    setIsConfirmDialogOpen(false);
    // Cancel any queued speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    // Disable Webcam
    if (webcamRunning) toggleWebCam();
    handleMoveToTrainingPage();
  };

  // Handle quitting the routine (Cancel)
  const handleCancelQuit = () => {
    setIsConfirmDialogOpen(false);
    if (!webcamRunning) toggleWebCam();
  };

  // Handle finishing the routine (Insert log info to the database)
  const handleFinishRoutine = async () => {
    // Cancel any queued speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    // Disable Webcam
    if (webcamRunning) toggleWebCam();

    // Persist results (best-effort; doesn't block showing completion modal)
    try {
      if (idType === "routine") {
        await updateRoutineCompletionStatus();
      }
      await insertRoutineHistory();
      await updateUserAccumulatedStat();
      await updateUserProgressStats();
    } catch (e) {
      console.error("Failed to persist session results", e);
    }

    // Show completion modal
    setIsFinished(true);
  };

  // Handle moving to the training ExitRoutineSessionModal
  const handleMoveToTrainingPage = () => {
    // Cancel any queued speech before navigating
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    navigate("/exerciselibrary");
  };

  // const handleMoveToLearningPage = () => { navigate("/learning"); };

  // Handle toggling the exercise menu
  const handleToggleExerciseMenu = () => {
    setIsExerciseMenuOpen((prev) => !prev);
  };

  // Handle incrementing Calorie and Score
  // const handleIncrementCalorieAndScore = () => {};

  // ---------------------------------------------------------
  //                      Helper Functions
  // ---------------------------------------------------------

  // Create routine time schedule
  const createRoutineTimeSchedule = (routineData: any[]): Exercise[] => {
    const transformedRoutine: Exercise[] = [];

    routineData.forEach((item: any) => {
      let goalString;
      if (item.reps > 0) {
        goalString = `${item.sets} sets of ${item.reps} reps`;
      } else if (item.duration) {
        if (item.sets === 0) item.sets = 1;
        goalString = `${item.sets} sets of ${item.duration / 1000} seconds`;
      } else {
        goalString = `${item.sets} sets`;
      }

      // If reps is available, set duration to 0
      if (item.reps !== 0 && item.duration !== 0) {
        item.duration = 0;
      }

      // Add current exercise to the transformed array
      transformedRoutine.push({
        exercise_id: item.id,
        name: item.name,
        goal: goalString,
        sets: item.sets ? item.sets : 0,
        reps: item.reps ? item.reps : 0,
        duration: item.duration ? item.duration / 1000 : 0,
        rest_time: item.rest_time / 1000 ? item.rest_time / 1000 : 0,
        image: item.demo_url,
      });
    });

    return transformedRoutine;
  };

  // Switch Webcam On/Off
  const toggleWebCam = async () => {
    if (webcamRunning) {
      // If recording, stop it (disabled)
      stopWebCam();
    } else {
      await startWebCam();
    }
  };

  // Enable WebCam
  const startWebCam = async () => {
    const videoElement = videoRef.current;
    const constraints = { video: true };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (!videoElement) return;
      (videoElement as any).srcObject = stream;
      videoElement.addEventListener("loadeddata", () => {
        setWebcamRunning(true); // Update state
      });
    } catch (error) {
      console.error("Error accessing the webcam: ", error);
    }
  };

  // Disable WebCam
  const stopWebCam = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    const stream: any = (videoElement as any).srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track: MediaStreamTrack) => {
        track.stop();
        stream.removeTrack(track); // This might be not needed, but just in case.
      });

      (videoElement as any).srcObject = null;
      setWebcamRunning(false);
      clearCanvas();
    }
  };

  // Recording removed for local-only mode

  // Load exercise counter based on the selected exercise
  const loadExerciseCounter = (selectedExercise: Exercise | undefined) => {
    if (selectedExercise) {
      const CounterClassOrFactory = (exerciseCounterLoader as Record<string, any>)[
        selectedExercise.exercise_id
      ];
      if (CounterClassOrFactory) {
        // Handle both class constructors and factory functions (for yoga poses)
        if (typeof CounterClassOrFactory === 'function') {
          if (CounterClassOrFactory.prototype && CounterClassOrFactory.prototype.constructor) {
            // It's a class constructor
            return new CounterClassOrFactory();
          } else {
            // It's a factory function (for yoga poses)
            return CounterClassOrFactory();
          }
        }
        return new CounterClassOrFactory();
      } else {
        console.error(
          "Exercise counter is not implemented for:",
          selectedExercise.name
        );
        return null;
      }
    } else {
      return null;
    }
  };

  // Perform posture detection on webcam feed and count reps
  const predictPosture = async () => {
    // Skip posture detection during rest time
    if (isResting) {
      return;
    }

    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    if (!videoElement || !canvasElement) return;
    const canvasCtx = canvasElement.getContext("2d");
    if (!canvasCtx) return;
    const drawingUtils = new DrawingUtils(canvasCtx);

    // Check if video element is available
    if (!poseLandmarkerRef.current || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      return;
    }

    // Adjust canvas size to match video
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    try {
      // Detect posture landmarks from a video element (Execute Mediapipe posture detection model.)
      const results = await poseLandmarkerRef.current.detectForVideo(
        videoElement,
        performance.now()
      );

      // Reset canvas before drawing with the latest landmarks data
      clearCanvas();

      // Process detected landmarks data
      if (results && results.landmarks && results.landmarks.length > 0) {
        // Count exercise using exerciseCounter
        const { count = 0, alert = "", calorie = 0, score = 0 } =
          (exerciseCounter && exerciseCounter.processPose
            ? exerciseCounter.processPose(results.landmarks[0])
            : { count: 0, alert: "", calorie: 0, score: 0 });

        // Update yoga-specific metrics
        if (isYogaExercise && exerciseCounter) {
          const similarity = exerciseCounter.getCurrentSimilarity ? exerciseCounter.getCurrentSimilarity() : 0;
          const progress = exerciseCounter.getHoldProgress ? exerciseCounter.getHoldProgress() : 0;
          setPoseSimilarity(Math.round(similarity * 100));
          setHoldProgress(Math.round(progress));
        }

        // Update success count
        if (count !== undefined) {
          setSuccessRepCount((prevSuccessRepCount) => {
            if (count !== prevSuccessRepCount) {
              // Update calorie
              if (!calorieUpdatedRef.current) {
                setCalorie((prevCalorie) => {
                  const weight = 60;
                  return Math.round((prevCalorie + calorie * weight) * 10) / 10;
                });
                setScore((prevScore) => prevScore + score);
                calorieUpdatedRef.current = true;
              }

              // When the rep count reaches the target, increment the set count
              if (
                count >= routine[selectedExerciseIndex].reps &&
                routine[selectedExerciseIndex].reps !== 0
              ) {
                // Count up the set count
                incrementSetsCount();

                // Reset count for next set
                exerciseCounter.resetCount();

                // Rest time after each set (except for the final set)
                // if (successSetCount + 1 < routine[selectedExerciseIndex].sets) {
                //   startRestCountdown("set");
                // }

                // Reset rep count
                return 0;
              }
              // Count up the rep count
              return count;
            }
            return prevSuccessRepCount;
          });

          // Update angle for the meter when the angle diff over the "threshold"
          // const angle = exerciseCounter?.getAngle(results.landmarks[0]);
          // if (
          //   angle !== undefined &&
          //   Math.abs(angle - previousAngle) > angleChangeThreshold
          // ) {
          //   setAngle(Math.round(angle));
          //   previousAngle = angle;
          // }
        }

        // Update alert if any posture issue
        if (alert) {
          updatePostureAlert(alert);
        }

        // Draw pose connections (line between landmarks)
        drawingUtils.drawConnectors(
          results.landmarks[0],
          PoseLandmarker.POSE_CONNECTIONS,
          { color: `#eff542`, lineWidth: 2 }
        );
        // Draw pose landmarks
        drawingUtils.drawLandmarks(results.landmarks[0], {
          radius: 1,
          color: () => `#eff542`,
        });
      }
    } catch (error) {
      console.error("Error during pose detection:", error);
    }

    // Continue predictions as long as webcam is running
    if (webcamRunning) {
      // Note:
      // The specified callback function is executed when the next frame is ready to be rendered.
      // It is typically executed 60 times per second.
      animationFrameIdRef.current =
        window.requestAnimationFrame(predictPosture);
    }
  };

  // Increment the success set count by reps or duration
  const incrementSetsCount = useCallback(() => {
    setSuccessSetCount((prevSuccessSetCount) => prevSuccessSetCount + 1);
    if (successSetCount + 1 < routine[selectedExerciseIndex].sets) {
      startRestCountdown("set");
    }
  }, [routine, selectedExerciseIndex, successSetCount]);

  // All backend-related helpers removed for this phase

  // Start Rest Time Countdown
  const startRestCountdown = (breakType: "exercise" | "set") => {
    setIsResting(true);
    if (breakType === "exercise") {
      setRestForNextExercise(true);
    } else if (breakType === "set") {
      setRestForSetIncrement(true);
    }
  };

  // End and hide Rest Time Countdown
  const endRestCountdown = (breakType: "exercise" | "set") => {
    setIsResting(false);
    if (breakType === "exercise") {
      setRestForNextExercise(false);
    } else if (breakType === "set") {
      setRestForSetIncrement(false);
    }
  };

  // Move to the next exercise in the routine
  const moveToNextExercise = () => {
    if (selectedExerciseIndex + 1 < routine.length) {
      setSelectedExerciseIndex((prevIndex) => prevIndex + 1);

      // Start rest time after each exercise
      startRestCountdown("exercise");
    } else {
      // Automatically finish when the last exercise is completed
      handleFinishRoutine();
    }
  };

  // Clear posture detection landmarks and lines
  const clearCanvas = () => {
    const canvasElement = canvasRef.current;
    if (canvasElement) {
      const canvasCtx = canvasElement.getContext("2d");
      if (canvasCtx) canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    }
  };

  const toggleIsResting = () => {
    setIsResting((prevIsResting) => !prevIsResting);
  };

  // Text to Speech
  const readoutText = (text: string | number) => {
    const utterance = new SpeechSynthesisUtterance(String(text));
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  };

  // Display posture alert (Cue)
  let timeoutId: number | undefined;
  const updatePostureAlert = (alert: string) => {
    const now = Date.now();
    if (now - lastPostureAlertUpdate < 20000) {
      return;
    }

    if (timeoutId) clearTimeout(timeoutId);

    setPostureAlert(alert);
    setLastPostureAlertUpdate(now);

    timeoutId = window.setTimeout(() => {
      setPostureAlert("");
      setLastPostureAlertUpdate(Date.now());
    }, 3000);
  };

  // ---------------------------------------------------------
  //                      JSX Return
  // ---------------------------------------------------------

  return (
    <>
      {routine.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-screen b text-white">
          <div className="text-lg">Loading...</div>
        </div>
      ) : (
        <div className="relative h-screen overflow-hidden bg-white">
          <DemoExercise
            trigger={restForNextExercise}
            duration={5}
            currentExerciseInfo={routine[selectedExerciseIndex]}
            nextExerciseInfo={routine[selectedExerciseIndex + 1]}
            onComplete={() => endRestCountdown("exercise")}
            skipExercise={moveToNextExercise}
            idType={idType}
          />

          <RestTime
            title="Time for resting"
            trigger={restForSetIncrement}
            duration={15}
            onComplete={() => endRestCountdown("set")}
          />

          <video ref={videoRef} style={videoStyles} autoPlay playsInline></video>
          <div style={gradientStyles}></div>
          <canvas ref={canvasRef} style={canvasStyles}></canvas>

          <Logo />

          <button
            aria-label="close"
            onClick={handleQuitRoutine}
            className={`absolute top-[10px] right-[10px] z-[9000] p-2 ${
              restForNextExercise ? "text-black hover:bg-white/20" : "text-white hover:bg-[#4F4F4F]"
            } rounded`}
          >
            <X className="w-8 h-8" />
          </button>

          <ExitRoutineSessionModal
            open={isConfirmDialogOpen}
            onClose={handleCancelQuit}
            onComplete={handleConfirmQuit}
          />

          <div
            className="absolute z-[1000]"
            style={{
              top: isLandscapeMode ? 60 : 100,
              left: "50%",
              transform: "translateX(-50%)",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              color: "white",
              fontSize: isLandscapeMode ? "1.5rem" : "2rem",
            }}
          >
            {postureAlert}
          </div>

          {(idType === "routine" || idType === "exercise") && !restForNextExercise && !isFinished && (
            <div
              className="absolute z-[1000]"
              style={{
                top: 10,
                left: 100,
                right: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "2rem",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              {isYogaExercise ? (
                <>
                  <Counter
                    title="Poses"
                    count={successRepCount}
                    target={routine[selectedExerciseIndex]?.sets || 0}
                    onComplete={moveToNextExercise}
                  />
                  <div className="flex flex-col items-center text-white">
                    <div className="text-lg font-bold">Similarity</div>
                    <div className="text-2xl font-bold" style={{ color: poseSimilarity >= 80 ? '#4ade80' : poseSimilarity >= 60 ? '#fbbf24' : '#ef4444' }}>
                      {poseSimilarity}%
                    </div>
                  </div>
                  <div className="flex flex-col items-center text-white">
                    <div className="text-lg font-bold">Hold Progress</div>
                    <div className="text-2xl font-bold">{holdProgress}%</div>
                    <div className="w-20 h-2 bg-gray-600 rounded-full mt-1">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all duration-300"
                        style={{ width: `${holdProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Counter
                    title="Sets"
                      count={successSetCount}
                      target={routine[selectedExerciseIndex]?.sets || 0}
                      onComplete={moveToNextExercise}
                    />
                  <Counter
                    title="Reps"
                      count={successRepCount}
                      target={routine[selectedExerciseIndex]?.reps || 0}
                    />
                </>
              )}
            </div>
          )}

          <div
            className="absolute bottom-[10px] w-full flex items-center justify-between px-5 z-[1000]"
            style={{ height: isLandscapeMode ? 80 : 120, textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
          >
            {/* <img
              src={routine[selectedExerciseIndex].image}
              alt="exercise"
              className="w-[20%] object-contain bg-white rounded-[15px]"
              style={{ height: isLandscapeMode ? 80 : 120 }}
            /> */}

            {(idType === "routine" || idType === "exercise") && !restForNextExercise && !isFinished && (
              <>
                <div className="min-w-[85px]">
                  <MetricCard title="Kcal" value={calorie} />
                </div>

                <div className="flex flex-row items-center gap-4 text-white">
                  <button
                    className="p-2 hover:opacity-70 transition-opacity"
                    onClick={toggleIsResting}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {isResting ? (
                      <Play style={{ width: isLandscapeMode ? 40 : 50, height: isLandscapeMode ? 40 : 50 }} />
                    ) : (
                      <Pause style={{ width: isLandscapeMode ? 40 : 50, height: isLandscapeMode ? 40 : 50 }} />
                    )}
                  </button>
                  <div className="relative flex items-center justify-center" style={{ width: isLandscapeMode ? 80 : 110, height: isLandscapeMode ? 80 : 110 }}>
                    <div className="absolute inset-0 flex items-center justify-center font-bold" style={{ fontSize: isLandscapeMode ? "3rem" : "4rem" }}>
                      {/* A very light-weight timer display ties to duration-only exercises */}
                      {Math.max(0, routine[selectedExerciseIndex]?.duration || 0)}
                    </div>
                  </div>
                  <button
                    className="p-2 hover:opacity-70 transition-opacity"
                    onClick={moveToNextExercise}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <SkipForward style={{ width: isLandscapeMode ? 40 : 50, height: isLandscapeMode ? 40 : 50 }} />
                  </button>
                </div>

                <div className="min-w-[85px]">
                  <MetricCard title="Score" value={score} />
                </div>

                {idType === "routine" && (
                  <div className="relative flex flex-col justify-end w-[20%] h-full">
                    <div className={`${isExerciseMenuOpen ? "absolute" : "static"} w-full`}>
                      <div
                        className="flex items-center justify-end gap-2 font-bold text-white cursor-pointer"
                        style={{ fontSize: isLandscapeMode ? "1rem" : "1.2rem" }}
                        onClick={handleToggleExerciseMenu}
                      >
                        Next
                        {isExerciseMenuOpen ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronUp className="w-5 h-5" />
                        )}
                      </div>
                      <div
                        className="custom-scrollbar dark"
                        style={{
                          maxHeight: isExerciseMenuOpen ? "50vh" : "100px",
                          overflowY: "scroll",
                          transition: "max-Height 0.5s ease",
                          paddingRight: "0.5rem",
                        }}
                      >
                        <ul className="m-0 p-0">
                          {routine.slice(selectedExerciseIndex).map((exercise, index) => (
                            <li
                                key={index + selectedExerciseIndex}
                              className="cursor-default py-4 px-6 mb-2 bg-white/60 rounded-[5px]"
                            >
                              <div className="font-bold text-black" style={{ fontSize: isLandscapeMode ? "0.8rem" : "1rem", textShadow: "none" }}>{exercise.name}</div>
                              <div className="text-black" style={{ fontSize: isLandscapeMode ? "0.8rem" : "1rem", textShadow: "none" }}>{exercise.goal}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <CompleteRoutineSessionModal
        open={isFinished}
        onComplete={handleMoveToTrainingPage}
        mins={startedAtRef.current ? Math.ceil((Date.now() - startedAtRef.current.getTime()) / (1000 * 60)) : 0}
        calorie={calorie}
        score={score}
        videoURL={""}
        sessionType={idType}
      />
    </>
  );
};

export default ExerciseSession;

// No propTypes (TypeScript)
