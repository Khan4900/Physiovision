import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Webcam from "react-webcam";
import { FilesetResolver, PoseLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";
import {
  Camera,
  Play,
  Square,
  Wifi,
  AlertCircle,
  ArrowLeft,
  Brain,
  Cpu,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { theme } from "../theme";

const WS_URL = import.meta.env.VITE_HSA_WS_URL || "ws://localhost:8000/ws";
const WASM_ASSET_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm";
const POSE_TASK_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
const LANDMARK_PUSH_INTERVAL_MS = 500;
const statusMap = {
  idle: { label: "Idle — camera paused", color: theme.colors.primary.darkGray },
  loading: { label: "Loading pose model…", color: theme.colors.primary.blue },
  connecting: { label: "Connecting to AI…", color: theme.colors.primary.blue },
  connected: {
    label: "Live — streaming landmarks",
    color: theme.colors.primary.green,
  },
  error: { label: "Disconnected", color: theme.colors.primary.pink },
};

const feedbackFallback = "Waiting for new feedback…";

// Model selection options
const MODEL_OPTIONS = {
  ml: {
    id: 'ml',
    name: 'Machine Learning',
    description: 'Classification-based approach for Horizontal Shoulder Abduction',
    icon: Cpu,
    exercise: 'Horizontal Shoulder Abduction',
  },
  dl: {
    id: 'dl',
    name: 'Deep Learning',
    description: 'Autoencoder-based anomaly detection for Weighted Openings',
    icon: Brain,
    exercise: 'Horizontal Weighted Openings',
  },
};

const LiveStream2 = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const poseRef = useRef(null);
  const rafRef = useRef(0);
  const lastSentRef = useRef(0);

  const [connectionState, setConnectionState] = useState("idle");
  const [isStreaming, setIsStreaming] = useState(false);
  const [prediction, setPrediction] = useState("No prediction yet");
  const [feedback, setFeedback] = useState(feedbackFallback);
  const [confidence, setConfidence] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [landmarkerReady, setLandmarkerReady] = useState(false);
  const [landmarkerError, setLandmarkerError] = useState("");
  const [videoReady, setVideoReady] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [stage, setStage] = useState("neutral");
  const [exerciseType, setExerciseType] = useState("");
  const navigate = useNavigate();
  
  // Model selection state
  const [selectedModel, setSelectedModel] = useState(null); // null = show selection screen
  const [badJoints, setBadJoints] = useState([]); // For DL model
  const [loss, setLoss] = useState(null); // For DL model
  const [isCorrectForm, setIsCorrectForm] = useState(false);

  const handleBack = useCallback(() => {
    if (selectedModel === null) {
      // Go back to previous page
      if (window.history.length > 2) {
        navigate(-1);
      } else {
        navigate("/home");
      }
    } else {
      // Go back to model selection
      setSelectedModel(null);
      setPrediction("No prediction yet");
      setFeedback(feedbackFallback);
      setConfidence(null);
      setRepCount(0);
      setStage("neutral");
      setBadJoints([]);
      setLoss(null);
      setIsCorrectForm(false);
    }
  }, [navigate, selectedModel]);

  const handleMediaReady = useCallback(() => {
    setVideoReady(true);
    setLandmarkerError("");
  }, []);

  const handleMediaError = useCallback(() => {
    setVideoReady(false);
    setLandmarkerError("Camera unavailable. Please allow access and refresh.");
  }, []);

  const connectSocket = useCallback(() => {
    if (socketRef.current || connectionState === "connecting") return;
    setConnectionState("connecting");
    const socket = new WebSocket(WS_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      setConnectionState("connected");
      // Send model selection to server
      if (selectedModel) {
        socket.send(JSON.stringify({
          type: 'selectModel',
          modelType: selectedModel
        }));
      }
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const payloadType =
          payload.type || (payload.prediction ? "prediction" : undefined);
        if (payloadType === "prediction") {
          setPrediction(payload.prediction || "Unclassified");
          setFeedback(payload.feedback || payload.message || feedbackFallback);
          setConfidence(
            typeof payload.confidence === "number" ? payload.confidence : null
          );
          setLastUpdated(payload.timestamp || Date.now());
          setExerciseType(payload.exerciseType || "");
          setIsCorrectForm(payload.isCorrectForm || false);
          
          // Handle ML-specific fields
          if (payload.modelType === 'ml') {
            setRepCount(
              typeof payload.repCount === "number" ? payload.repCount : 0
            );
            setStage(payload.stage || "neutral");
          }
          
          // Handle DL-specific fields
          if (payload.modelType === 'dl') {
            setBadJoints(payload.badJoints || []);
            setLoss(typeof payload.loss === "number" ? payload.loss : null);
          }
        }
        if (payloadType === "status") {
          setFeedback(payload.message || payload.status || feedbackFallback);
          if (payload.exerciseType) {
            setExerciseType(payload.exerciseType);
          }
        }
      } catch (error) {
        console.error("Failed to parse websocket payload", error);
      }
    };

    socket.onerror = () => {
      setConnectionState("error");
      setFeedback("Connection error. Please try again.");
    };

    socket.onclose = () => {
      socketRef.current = null;
      setConnectionState("idle");
      setIsStreaming(false);
    };
  }, [connectionState, selectedModel]);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);

  const stopDetectionLoop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const sendLandmarks = useCallback(() => {
    const landmarkModel = poseRef.current;
    const socket = socketRef.current;
    if (!landmarkModel) return;
    
    const videoEl = webcamRef.current?.video;
    if (!videoEl || videoEl.readyState < 2) return;

    const now = performance.now();
    const results = landmarkModel.detectForVideo(videoEl, now);
    
    // Draw landmarks on canvas
    const canvas = canvasRef.current;
    if (canvas && results?.landmarks?.length) {
      const ctx = canvas.getContext("2d");
      // Match canvas size to video
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const drawingUtils = new DrawingUtils(ctx);
      // Draw connections (skeleton lines)
      drawingUtils.drawConnectors(
        results.landmarks[0],
        PoseLandmarker.POSE_CONNECTIONS,
        { color: "#00FF00", lineWidth: 3 }
      );
      // Draw landmarks (joint points)
      drawingUtils.drawLandmarks(results.landmarks[0], {
        radius: 5,
        color: "#FF0000",
        fillColor: "#FFFF00",
      });
    }
    
    // Only send to server at interval
    const shouldSend = now - lastSentRef.current >= LANDMARK_PUSH_INTERVAL_MS;
    if (!results?.landmarks?.length || !shouldSend) return;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    
    lastSentRef.current = now;

    const points = results.landmarks[0].map((point) => ({
      x: Number(point.x?.toFixed(5) ?? 0),
      y: Number(point.y?.toFixed(5) ?? 0),
      z: Number(point.z?.toFixed(5) ?? 0),
      visibility: Number(point.visibility?.toFixed(5) ?? 0),
    }));

    socket.send(
      JSON.stringify({
        type: "landmarks",
        timestamp: Date.now(),
        frameWidth: videoEl.videoWidth,
        frameHeight: videoEl.videoHeight,
        landmarks: points,
      })
    );
  }, []);

  const detectionLoop = useCallback(() => {
    sendLandmarks();
    rafRef.current = requestAnimationFrame(detectionLoop);
  }, [sendLandmarks]);

  useEffect(() => {
    if (isStreaming) {
      detectionLoop();
    } else {
      stopDetectionLoop();
    }
    return () => stopDetectionLoop();
  }, [detectionLoop, isStreaming, stopDetectionLoop]);

  useEffect(() => {
    let cancelled = false;
    const loadLandmarker = async () => {
      setConnectionState("loading");
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          WASM_ASSET_URL
        );
        const landmarker = await PoseLandmarker.createFromOptions(
          filesetResolver,
          {
            baseOptions: {
              modelAssetPath: POSE_TASK_URL,
            },
            runningMode: "VIDEO",
            numPoses: 1,
          }
        );
        if (cancelled) {
          landmarker.close();
          return;
        }
        poseRef.current = landmarker;
        setLandmarkerReady(true);
        setConnectionState("idle");
        setLandmarkerError("");
      } catch (error) {
        console.error("Failed to load PoseLandmarker", error);
        setLandmarkerError("Pose detection failed to initialize.");
        setConnectionState("error");
      }
    };
    loadLandmarker();
    return () => {
      cancelled = true;
      poseRef.current?.close?.();
      poseRef.current = null;
    };
  }, []);

  const startStreaming = useCallback(() => {
    if (!landmarkerReady) {
      setFeedback("Pose landmarker still loading…");
      return;
    }
    lastSentRef.current = 0;
    setPrediction("Detecting…");
    setFeedback("Streaming landmarks to AI.");
    setRepCount(0);
    setStage("neutral");
    setExerciseType("");
    setConfidence(null);
    setLastUpdated(null);
    setIsStreaming(true);
    connectSocket();
  }, [connectSocket, landmarkerReady]);

  const stopStreaming = useCallback(() => {
    setIsStreaming(false);
    disconnectSocket();
    setPrediction("No prediction yet");
    setFeedback(feedbackFallback);
    setConfidence(null);
    setRepCount(0);
    setStage("neutral");
    setExerciseType("");
    setLastUpdated(null);
    setBadJoints([]);
    setLoss(null);
    setIsCorrectForm(false);
  }, [disconnectSocket]);

  useEffect(
    () => () => {
      stopDetectionLoop();
      disconnectSocket();
      poseRef.current?.close?.();
    },
    [disconnectSocket, stopDetectionLoop]
  );

  const statusMeta = statusMap[connectionState] || statusMap.idle;

  const formattedTimestamp = useMemo(() => {
    if (!lastUpdated) return "No data yet";
    return new Date(lastUpdated).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, [lastUpdated]);

  // Model Selection Screen
  if (selectedModel === null) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex flex-col">
        <div className="w-full pt-6 px-4 md:px-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 w-max rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <h1 className="text-4xl font-bold mb-3 text-center">AI Live Feedback</h1>
          <p className="text-white/70 text-center max-w-xl mb-10">
            Choose your preferred AI approach for real-time exercise form analysis.
          </p>
          
          <div className="grid gap-6 md:grid-cols-2 max-w-3xl w-full">
            {Object.values(MODEL_OPTIONS).map((model) => {
              const IconComponent = model.icon;
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => setSelectedModel(model.id)}
                  className="group relative bg-white/5 border border-white/10 rounded-3xl p-6 text-left hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-2xl"
                      style={{ background: theme.gradients.primary }}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">{model.name}</h3>
                      <p className="text-white/60 text-sm mb-3">{model.description}</p>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs text-white/80">
                        <span>{model.exercise}</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="mt-10 text-center text-white/50 text-sm max-w-md">
            <p><strong>Machine Learning:</strong> Fast classification with rep counting.</p>
            <p className="mt-2"><strong>Deep Learning:</strong> Autoencoder-based anomaly detection with joint-level feedback.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentModelInfo = MODEL_OPTIONS[selectedModel];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <Webcam
        ref={webcamRef}
        audio={false}
        muted
        mirrored
        playsInline
        onUserMedia={handleMediaReady}
        onUserMediaError={handleMediaError}
        className="absolute inset-0 h-full w-full object-cover"
        videoConstraints={{ facingMode: "user" }}
      />
      {/* Canvas overlay for landmark drawing */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
        style={{ transform: "scaleX(-1)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-black/60 pointer-events-none" />
      <div className="relative z-10 flex flex-col h-screen">
        <div className="w-full pt-6 px-4 md:px-8">
          <div className="flex w-full flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 w-max rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={isStreaming ? stopStreaming : startStreaming}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white shadow-lg"
                  style={{ background: theme.gradients.primary }}
                >
                  {isStreaming ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isStreaming ? "Stop Streaming" : "Start Streaming"}
                </button>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white/70">
                  {currentModelInfo.exercise}
                </p>
                <h1 className="text-3xl font-bold">Live Form Feedback</h1>
                <p className="text-white/80 mt-2 max-w-2xl">
                  Using <strong>{currentModelInfo.name}</strong> approach. {currentModelInfo.description}
                </p>
              </div>
              {!videoReady && (
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-yellow-200">
                  <Camera className="w-4 h-4" />
                  <span>Waiting for camera permission…</span>
                </div>
              )}
              {videoReady && !isStreaming && (
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80">
                  <Camera className="w-4 h-4" />
                  <span>Camera ready. Press “Start Streaming” when you are set.</span>
                </div>
              )}
            </div>
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
              style={{ backgroundColor: theme.colors.background.softBlue }}
            >
              <Wifi className="w-4 h-4" style={{ color: statusMeta.color }} />
              <span style={{ color: statusMeta.color }}>{statusMeta.label}</span>
            </div>
          </div>
        </div>

        <div className="flex-1" />

        <div className="w-full pb-8 px-4 md:px-8">
          <div className="flex w-full flex-col gap-4">
            {/* Top Row: Form Status + Joints Needing Adjustment */}
            <div className="flex w-full flex-col gap-4 lg:flex-row lg:justify-between">
              {/* Left: Form Status / Prediction Card */}
              <div className="flex-1 lg:max-w-sm">
                <div className="bg-white/10 border border-white/15 rounded-3xl p-4 md:p-5 h-full">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                    {selectedModel === 'dl' ? 'Form Status' : 'Predicted Exercise'}
                  </p>
                  <h2 
                    className="text-2xl font-semibold"
                    style={{ 
                      color: selectedModel === 'dl' 
                        ? (isCorrectForm ? theme.colors.primary.green : theme.colors.primary.pink)
                        : 'white'
                    }}
                  >
                    {prediction}
                  </h2>
                  {exerciseType && <p className="text-sm text-white/70">{exerciseType}</p>}
                  <div className="mt-3 text-sm text-white/70">
                    <p>{selectedModel === 'dl' ? 'Reconstruction Loss' : 'Confidence'}</p>
                    <p className="text-xl font-semibold text-white">
                      {selectedModel === 'dl' 
                        ? (loss != null ? loss.toFixed(6) : "—")
                        : (confidence != null ? `${Math.round(confidence * 100)}%` : "—")
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* ML Model: Rep Counter (Right side for ML) */}
              {selectedModel === 'ml' && (
                <div className="flex-1 lg:max-w-sm">
                  <div className="bg-white/10 border border-white/15 rounded-3xl p-4 h-full">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">Rep counter</p>
                    <p className="text-2xl font-semibold">{repCount}</p>
                    <p className="text-sm text-white/70 capitalize">Stage: {stage}</p>
                    <div className="text-xs text-white/70 mt-2">
                      <p>Last update</p>
                      <p className="font-medium text-white">{formattedTimestamp}</p>
                      {landmarkerError && (
                        <p className="text-xs text-red-200 mt-1">{landmarkerError}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* DL Model: Bad Joints List (Right side) */}
              {selectedModel === 'dl' && badJoints.length > 0 && (
                <div className="flex-1 lg:max-w-md">
                  <div className="bg-white/10 border border-white/15 rounded-3xl p-4 h-full">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60 mb-2">
                      Joints Needing Adjustment
                    </p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {badJoints.slice(0, 5).map((joint, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center justify-between bg-red-500/20 rounded-lg px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <span className="text-sm text-white">{joint.name}</span>
                          </div>
                          <span className="text-xs text-red-300">
                            {joint.error.toFixed(5)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-white/70 mt-2">
                      <p>Last update</p>
                      <p className="font-medium text-white">{formattedTimestamp}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* DL Model: Good Form Indicator (Right side when no bad joints) */}
              {selectedModel === 'dl' && badJoints.length === 0 && isStreaming && (
                <div className="flex-1 lg:max-w-sm">
                  <div className="bg-green-500/20 border border-green-500/30 rounded-3xl p-4 h-full">
                    <p className="text-xs uppercase tracking-[0.3em] text-green-300">Form Status</p>
                    <p className="text-lg font-semibold text-green-400">All joints aligned correctly!</p>
                    <div className="text-xs text-white/70 mt-2">
                      <p>Last update</p>
                      <p className="font-medium text-white">{formattedTimestamp}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Row: Feedback */}
            <div className="w-full">
              <div className="bg-white/10 border border-white/15 rounded-3xl p-4 md:p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-200 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60 mb-1">Feedback</p>
                    <p className="text-white/90">{feedback}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFeedback(feedbackFallback)}
                    className="text-xs text-white/60 hover:text-white/90 underline-offset-4 hover:underline flex-shrink-0"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStream2;
