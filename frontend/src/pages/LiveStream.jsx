import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { motion as Motion } from 'framer-motion';
import {
	Activity,
	AlertTriangle,
	ArrowRightLeft,
	Camera,
	CheckCircle2,
	Dumbbell,
	Pause,
	Play,
	RefreshCcw,
	Send,
	Signal,
	Square,
} from 'lucide-react';
import theme from '../theme';

const {
	colors: { primary, background, text, border },
	gradients,
	shadows,
} = theme;

const WS_URL = import.meta.env.VITE_LIVE_STREAM_WS || 'ws://localhost:8000/ws';

const messagesMap = {
	landmarks_not_visible: 'Please make sure your full body is visible in the camera.',
	side_view_required: 'Rotate your body sideways so the model can evaluate your form.',
};

const exerciseToMuscleMap = {
	'bicep-curl': ['Biceps'],
	squat: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'],
	'push-up': ['Chest', 'Triceps', 'Shoulders', 'Core'],
};

const defaultWorkoutState = {
	exerciseName: 'Bicep Curls',
	totalSets: 5,
	completedSets: 3,
	totalReps: 40,
	completedReps: 24,
	targetMuscle: 'Biceps',
	intensity: 65,
	formQuality: 4,
	isActive: false,
	elapsedTime: 0,
};

const defaultExerciseState = {
	exercise: 'bicep-curl',
	REP_COUNT: 0,
	IMPROPER_REP_COUNT: 0,
	message: '',
};

const statusStyles = {
	idle: {
		wrapper: {
			backgroundColor: background.softBlue,
			color: primary.darkGray,
		},
		dot: primary.blue,
	},
	connecting: {
		wrapper: {
			backgroundColor: background.softPink,
			color: primary.pink,
		},
		dot: primary.pink,
	},
	connected: {
		wrapper: {
			background: gradients.primary,
			color: text.light,
		},
		dot: text.light,
	},
	error: {
		wrapper: {
			backgroundColor: 'rgba(255, 17, 140, 0.15)',
			color: primary.pink,
		},
		dot: primary.pink,
	},
};

const statusCopy = {
	idle: 'Idle — stream is paused',
	connecting: 'Connecting to AI stream…',
	connected: 'Live — receiving pose data',
	error: 'Connection lost — retry to continue',
};

const toneStyles = {
	error: {
		backgroundColor: 'rgba(255, 17, 140, 0.12)',
		border: `1px solid ${primary.pink}`,
		color: primary.pink,
	},
	success: {
		backgroundColor: 'rgba(77, 197, 60, 0.12)',
		border: '1px solid rgba(77, 197, 60, 0.4)',
		color: primary.green,
	},
	warning: {
		backgroundColor: 'rgba(255, 184, 0, 0.12)',
		border: '1px solid rgba(255, 184, 0, 0.4)',
		color: '#c97c00',
	},
	info: {
		backgroundColor: background.softBlue,
		border: `1px solid ${border.light}`,
		color: primary.darkGray,
	},
};

const formatTime = (seconds) => {
	const minutes = Math.floor(seconds / 60)
		.toString()
		.padStart(2, '0');
	const remainingSeconds = Math.floor(seconds % 60)
		.toString()
		.padStart(2, '0');
	return `${minutes}:${remainingSeconds}`;
};

const formatTimestamp = (value) => {
	if (!value) return 'No data yet';
	return new Date(value).toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	});
};

const LiveStream = () => {
	const webcamRef = useRef(null);
	const socketRef = useRef(null);
	const canvasRef = useRef(null);
	const frameIntervalRef = useRef(null);

	const [connectionState, setConnectionState] = useState('idle');
	const [statusMessage, setStatusMessage] = useState('Ready when you are.');
	const [workoutState, setWorkoutState] = useState(defaultWorkoutState);
	const [exerciseState, setExerciseState] = useState(defaultExerciseState);
	const [prediction, setPrediction] = useState('');
	const [predictionConfidence, setPredictionConfidence] = useState(0);
	const [resultImage, setResultImage] = useState('');
	const [messageLog, setMessageLog] = useState([]);
	const [timeline, setTimeline] = useState([]);
	const [promptUser, setPromptUser] = useState(true);
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [showManualSelect, setShowManualSelect] = useState(false);
	const [isStarted, setIsStarted] = useState(false);
	const [confirmEndWorkout, setConfirmEndWorkout] = useState(false);
	const [lastFrameAt, setLastFrameAt] = useState(null);

	const appendMessage = useCallback((text, tone = 'info') => {
		setMessageLog((prev) => [
			{ id: Date.now(), text, tone },
			...prev,
		].slice(0, 8));
	}, []);

	const pushTimelineEntry = useCallback((state) => {
		setTimeline((prev) => [
			{
				id: Date.now(),
				exercise: state.exercise || prediction || workoutState.exerciseName,
				reps: state.REP_COUNT ?? exerciseState.REP_COUNT,
				improper: state.IMPROPER_REP_COUNT ?? exerciseState.IMPROPER_REP_COUNT,
				timestamp: formatTimestamp(Date.now()),
			},
			...prev,
		].slice(0, 6));
	}, [exerciseState.IMPROPER_REP_COUNT, exerciseState.REP_COUNT, prediction, workoutState.exerciseName]);

	const ensureCanvas = useCallback(() => {
		if (!canvasRef.current) {
			canvasRef.current = document.createElement('canvas');
		}
		return canvasRef.current;
	}, []);

	const captureFrame = useCallback(() => {
		const video = webcamRef.current?.video;
		if (!video || video.readyState < 2) return null;

		const canvas = ensureCanvas();
		canvas.width = video.videoWidth || 640;
		canvas.height = video.videoHeight || 480;
		const ctx = canvas.getContext('2d');
		if (!ctx) return null;
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
		return canvas.toDataURL('image/jpeg', 0.75);
	}, [ensureCanvas]);

	const sendFrame = useCallback(() => {
		const socket = socketRef.current;
		if (!socket || socket.readyState !== WebSocket.OPEN) return;
		const frame = captureFrame();
		if (!frame) return;
		const predictedExercise = prediction || exerciseState.exercise || 'unknown';
		socket.send(JSON.stringify({ type: 'img', image: frame, prediction: predictedExercise }));
	}, [captureFrame, exerciseState.exercise, prediction]);

	const startFrameLoop = useCallback(() => {
		if (frameIntervalRef.current) return;
		frameIntervalRef.current = setInterval(sendFrame, 400);
	}, [sendFrame]);

	const stopFrameLoop = useCallback(() => {
		if (frameIntervalRef.current) {
			clearInterval(frameIntervalRef.current);
			frameIntervalRef.current = null;
		}
	}, []);

	const handleServerState = useCallback((state) => {
		setExerciseState((prev) => ({
			...prev,
			...state,
		}));
		setWorkoutState((prev) => ({
			...prev,
			completedReps: state.REP_COUNT ?? prev.completedReps,
			totalReps: Math.max(prev.totalReps, state.REP_COUNT ?? 0),
			intensity: state.intensity ?? prev.intensity,
			formQuality: state.formQuality ?? prev.formQuality,
			isActive: true,
			elapsedTime: prev.elapsedTime + 10,
		}));
		pushTimelineEntry(state);
		setLastFrameAt(Date.now());
		const key = state.message;
		if (key) {
			appendMessage(messagesMap[key] || key, key.includes('not') ? 'warning' : 'info');
		}
	}, [appendMessage, pushTimelineEntry]);

	const handleSocketMessage = useCallback((event) => {
		try {
			const payload = JSON.parse(event.data);
			if (payload.prediction) {
				setPrediction(payload.prediction.label);
				setPredictionConfidence(payload.prediction.confidence ?? 0);
				setShowConfirmation(true);
			}
			if (payload.image) {
				setResultImage(payload.image);
				setLastFrameAt(Date.now());
			}
			if (payload.state) {
				handleServerState(payload.state);
			}
			if (payload.message) {
				const friendly = messagesMap[payload.message] || payload.message;
				appendMessage(friendly, 'info');
			}
		} catch (error) {
			console.error('Failed to parse websocket payload', error);
			appendMessage('Received unreadable data from AI stream.', 'error');
		}
	}, [appendMessage, handleServerState]);

	const connectSocket = useCallback(() => {
		if (socketRef.current) return;
		setConnectionState('connecting');
		setStatusMessage('Connecting to FastAPI backend…');
		const socket = new WebSocket(WS_URL);
		socketRef.current = socket;

		socket.onopen = () => {
			setConnectionState('connected');
			setStatusMessage('Live stream connected.');
			appendMessage('Connected to AI stream.', 'success');
			startFrameLoop();
		};

		socket.onerror = () => {
			appendMessage('WebSocket error. Retry in a moment.', 'error');
			setConnectionState('error');
			setStatusMessage('Connection error.');
			stopFrameLoop();
		};

		socket.onclose = () => {
			stopFrameLoop();
			socketRef.current = null;
			if (connectionState === 'connected') {
				appendMessage('Stream closed by server.', 'warning');
			}
			setConnectionState('idle');
			setStatusMessage('Stream paused.');
		};

		socket.onmessage = handleSocketMessage;
	}, [appendMessage, connectionState, handleSocketMessage, startFrameLoop, stopFrameLoop]);

	const disconnectSocket = useCallback(() => {
		stopFrameLoop();
		if (socketRef.current) {
			socketRef.current.close();
			socketRef.current = null;
		}
	}, [stopFrameLoop]);

	const handleConfirmExercise = useCallback(() => {
		setShowConfirmation(false);
		appendMessage(`Exercise confirmed: ${prediction}`, 'success');
	}, [appendMessage, prediction]);

	const handleRejectExercise = useCallback(() => {
		setPrediction('');
		setPredictionConfidence(0);
		setShowManualSelect(true);
		appendMessage('Select the exercise manually to continue.', 'warning');
	}, [appendMessage]);

	const handleManualSelect = useCallback((exercise) => {
		setPrediction(exercise);
		setShowManualSelect(false);
		setShowConfirmation(false);
		appendMessage(`Exercise manually set to ${exercise}.`, 'info');
	}, [appendMessage]);

	const startSession = useCallback(() => {
		if (connectionState === 'connected' || connectionState === 'connecting') return;
		setIsStarted(true);
		setWorkoutState((prev) => ({ ...prev, isActive: true }));
		connectSocket();
	}, [connectSocket, connectionState]);

	const requestEndSession = useCallback(() => {
		setConfirmEndWorkout(true);
	}, []);

	const confirmEndSession = useCallback(() => {
		setConfirmEndWorkout(false);
		setIsStarted(false);
		setPrediction('');
		setPredictionConfidence(0);
		setResultImage('');
		setWorkoutState(defaultWorkoutState);
		setExerciseState(defaultExerciseState);
		setTimeline([]);
		disconnectSocket();
		appendMessage('Session ended and reset.', 'info');
	}, [appendMessage, disconnectSocket]);

	const cancelEndSession = useCallback(() => {
		setConfirmEndWorkout(false);
	}, []);

	const sendCalibration = useCallback(() => {
		if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
			socketRef.current.send(JSON.stringify({ type: 'calibrate' }));
			appendMessage('Calibration command sent.', 'info');
		} else {
			appendMessage('Start the stream before calibrating.', 'warning');
		}
	}, [appendMessage]);

	const changeExercise = useCallback(() => {
		setPrediction('');
		appendMessage('Looking for a new exercise…', 'info');
	}, [appendMessage]);

	useEffect(() => () => {
		disconnectSocket();
	}, [disconnectSocket]);

	const statCards = useMemo(() => ([
		{
			key: 'sets',
			label: 'Total Sets',
			value: workoutState.totalSets,
			subline: `${workoutState.completedSets} completed`,
			icon: CheckCircle2,
			accent: primary.green,
		},
		{
			key: 'reps',
			label: 'Reps',
			value: workoutState.completedReps,
			subline: `${exerciseState.IMPROPER_REP_COUNT} improper`,
			icon: Dumbbell,
			accent: primary.blue,
		},
		{
			key: 'intensity',
			label: 'Intensity',
			value: `${workoutState.intensity}%`,
			subline: 'Last 30s effort',
			icon: Activity,
			accent: primary.pink,
		},
		{
			key: 'time',
			label: 'Elapsed Time',
			value: formatTime(workoutState.elapsedTime),
			subline: workoutState.isActive ? 'Session live' : 'Standby',
			icon: Signal,
			accent: primary.black,
		},
	]), [exerciseState.IMPROPER_REP_COUNT, workoutState]);

	const processedImageSrc = useMemo(() => {
		if (!resultImage) return '';
		if (resultImage.startsWith('data:')) return resultImage;
		return `data:image/jpeg;base64,${resultImage}`;
	}, [resultImage]);

	const latestMessage = messageLog[0];

	const statusStyle = statusStyles[connectionState] || statusStyles.idle;

	return (
		<div className="min-h-screen py-10 px-4 md:px-10" style={{ backgroundColor: background.sidebar }}>
			<Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<p className="text-sm uppercase tracking-[0.3em] text-gray-500">AI Live Stream</p>
						<h1 className="text-3xl font-bold text-gray-900 mt-2">Realtime Pose Intelligence</h1>
						<p className="text-gray-600 mt-2 max-w-2xl">
							Start the stream to open your webcam, push frames to the FastAPI backend, and receive overlays, warnings, and rep tracking in the same view.
						</p>
					</div>
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={statusStyle.wrapper}>
						<span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: statusStyle.dot }} />
						{statusCopy[connectionState]}
					</div>
				</div>
			</Motion.div>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
				{statCards.map((card) => {
					const Icon = card.icon;
					return (
						<div
							key={card.key}
							className="rounded-3xl p-5"
							style={{ backgroundColor: background.card, border: `1px solid ${border.light}`, boxShadow: shadows.sm }}
						>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs uppercase tracking-[0.25em] text-gray-500">{card.label}</p>
									<p className="text-2xl font-semibold text-gray-900 mt-2">{card.value}</p>
								</div>
								<span className="p-3 rounded-2xl" style={{ backgroundColor: background.softBlue, border: `1px solid ${border.light}` }}>
									<Icon className="w-5 h-5" style={{ color: card.accent }} />
								</span>
							</div>
							<p className="text-xs text-gray-500 mt-3">{card.subline}</p>
						</div>
					);
				})}
			</div>

			<div className="grid gap-6 xl:grid-cols-3">
				<div className="xl:col-span-2 space-y-6">
					<Motion.div
						initial={{ opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="rounded-3xl p-6"
						style={{ backgroundColor: background.card, border: `1px solid ${border.light}`, boxShadow: shadows.md }}
					>
						<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
							<div>
								<p className="text-sm text-gray-500">Current Exercise</p>
								<h2 className="text-3xl font-semibold text-gray-900">{prediction || workoutState.exerciseName}</h2>
								<p className="text-sm text-gray-500 mt-1">{messagesMap[exerciseState.message] || statusMessage}</p>
							</div>
							<div className="text-left lg:text-right">
								<p className="text-xs uppercase tracking-[0.3em] text-gray-500">Last Update</p>
								<p className="text-sm font-semibold text-gray-900">{formatTimestamp(lastFrameAt)}</p>
								{prediction && (
									<p className="text-xs text-gray-500 mt-1">{Math.round(predictionConfidence * 100)}% confidence</p>
								)}
							</div>
						</div>
						<div className="mt-5 flex flex-wrap gap-3">
							<span className="text-sm font-semibold px-4 py-2 rounded-full" style={{ backgroundColor: background.softBlue, border: `1px solid ${border.light}`, color: primary.darkGray }}>
								Mode: <span className="text-gray-900">{connectionState === 'connected' ? 'Live' : 'Standby'}</span>
							</span>
							<span className="text-sm font-semibold px-4 py-2 rounded-full" style={{ backgroundColor: background.softBlue, border: `1px solid ${border.light}`, color: primary.darkGray }}>
								Improper reps: <span className="text-gray-900">{exerciseState.IMPROPER_REP_COUNT}</span>
							</span>
						</div>
					</Motion.div>

					<Motion.div
						initial={{ opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.15 }}
						className="rounded-3xl p-6"
						style={{ backgroundColor: background.card, border: `1px solid ${border.light}`, boxShadow: shadows.md }}
					>
						<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-4">
							<div>
								<p className="text-sm text-gray-500">Live Feed</p>
								<h3 className="text-xl font-semibold text-gray-900">AI overlay</h3>
							</div>
							<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold" style={statusStyle.wrapper}>
								<span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusStyle.dot }} />
								{connectionState === 'connected' ? 'Streaming' : 'Standby'}
							</div>
						</div>
						<div className="relative rounded-3xl overflow-hidden border h-[28rem]" style={{ borderColor: border.light, backgroundColor: background.softBlue }}>
							{isStarted ? (
								<>
									<Webcam
										ref={webcamRef}
										className="w-full h-full object-cover"
										mirrored
										audio={false}
										screenshotFormat="image/jpeg"
										onUserMediaError={() => {
											appendMessage('Camera permission denied.', 'error');
										}}
									/>
									{processedImageSrc && (
										<img
											src={processedImageSrc}
											alt="Pose output"
											className="absolute inset-0 w-full h-full object-cover"
										/>
									)}
								</>
							) : (
								<div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
									<Camera className="w-10 h-10 text-gray-400 mb-3" />
									<p className="text-gray-600 font-semibold">Camera inactive</p>
									<p className="text-sm text-gray-500">Click “Start Session” to enable the webcam and begin streaming.</p>
								</div>
							)}
							{isStarted && !processedImageSrc && (
								<div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
									<AlertTriangle className="w-10 h-10 text-gray-400 mb-3" />
									<p className="text-gray-600 font-semibold">Waiting for processed frame…</p>
									<p className="text-sm text-gray-500">Frames will appear once the backend responds.</p>
								</div>
							)}
						</div>
						<div className="mt-4 grid gap-3 md:grid-cols-2">
							<div className="rounded-2xl p-4" style={{ backgroundColor: background.softBlue, border: `1px solid ${border.light}` }}>
								<p className="text-xs uppercase tracking-[0.3em] text-gray-500">Status</p>
								<p className="text-sm font-semibold text-gray-900">{statusMessage}</p>
							</div>
							<div className="rounded-2xl p-4" style={{ backgroundColor: background.card, border: `1px solid ${border.light}` }}>
								<p className="text-xs uppercase tracking-[0.3em] text-gray-500">Last frame</p>
								<p className="text-sm font-semibold text-gray-900">{formatTimestamp(lastFrameAt)}</p>
							</div>
						</div>
					</Motion.div>
				</div>

				<div className="space-y-6">
					<Motion.div
						initial={{ opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.15 }}
						className="rounded-3xl p-6"
						style={{ backgroundColor: background.card, border: `1px solid ${border.light}`, boxShadow: shadows.md }}
					>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-500">Session Controls</p>
								<h3 className="text-xl font-semibold text-gray-900">{statusMessage}</h3>
								<p className="text-xs text-gray-500">{statusCopy[connectionState]}</p>
							</div>
							<span className="h-3 w-3 rounded-full" style={{ backgroundColor: statusStyle.dot }} />
						</div>
						<button
							type="button"
							onClick={connectionState === 'connected' ? requestEndSession : startSession}
							className="w-full mt-4 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold shadow-sm transition"
							style={
								connectionState === 'connected'
									? { backgroundColor: background.softPink, color: primary.pink, border: `1px solid ${primary.pink}` }
									: { background: gradients.primary, color: text.light, boxShadow: shadows.md }
							}
						>
							{connectionState === 'connected' ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
							{connectionState === 'connected' ? 'End Session' : 'Start Session'}
						</button>
						<div className="mt-4 grid grid-cols-2 gap-3">
							<button
								type="button"
								onClick={sendCalibration}
								className="flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold"
								style={{ borderColor: border.light, backgroundColor: background.softBlue, color: primary.blue }}
							>
								<RefreshCcw className="w-4 h-4" /> Calibrate
							</button>
							<button
								type="button"
								onClick={changeExercise}
								className="flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold"
								style={{ borderColor: border.light, backgroundColor: background.card, color: primary.black }}
							>
								<ArrowRightLeft className="w-4 h-4" /> Change Exercise
							</button>
							<button
								type="button"
								onClick={() => appendMessage('Coach tip sent to headset.', 'info')}
								className="col-span-2 flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold"
								style={{ borderColor: border.light, backgroundColor: background.card, color: primary.black }}
							>
								<Send className="w-4 h-4" /> Send Coach Tip
							</button>
						</div>
					</Motion.div>

					<Motion.div
						initial={{ opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="rounded-3xl p-6"
						style={{ backgroundColor: background.card, border: `1px solid ${border.light}`, boxShadow: shadows.md }}
					>
						<div className="flex items-center gap-3 mb-4">
							<Camera className="w-5 h-5" style={{ color: primary.blue }} />
							<h3 className="text-lg font-semibold text-gray-900">Live Guidance</h3>
						</div>
						{latestMessage ? (
							<div
								key={latestMessage.id}
								className="rounded-2xl px-4 py-3 text-sm font-medium flex items-center gap-3"
								style={{ ...(toneStyles[latestMessage.tone] || toneStyles.info), borderRadius: '9999px' }}
							>
								<span className="w-2 h-2 rounded-full" style={{ backgroundColor: primary.blue }} />
								{latestMessage.text}
							</div>
						) : (
							<p className="text-sm text-gray-500">No alerts yet. Start the stream to receive AI prompts.</p>
						)}
					</Motion.div>

					<Motion.div
						initial={{ opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.25 }}
						className="rounded-3xl p-6"
						style={{ backgroundColor: background.card, border: `1px solid ${border.light}`, boxShadow: shadows.md }}
					>
						<div className="flex items-center gap-3 mb-4">
							<Signal className="w-5 h-5" style={{ color: primary.blue }} />
							<h3 className="text-lg font-semibold text-gray-900">Session Timeline</h3>
						</div>
						<div className="space-y-4 max-h-80 overflow-auto pr-1">
							{timeline.length === 0 && <p className="text-sm text-gray-500">No events yet. Live updates will appear once the backend responds.</p>}
							{timeline.map((item) => (
								<div key={item.id} className="p-4 rounded-2xl" style={{ border: `1px solid ${border.light}`, backgroundColor: background.softBlue }}>
									<div className="flex items-center justify-between">
										<p className="font-semibold text-gray-900">{item.exercise}</p>
										<span className="text-xs text-gray-500">{item.timestamp}</span>
									</div>
									<p className="text-sm text-gray-600 mt-1">Reps: {item.reps} · Improper: {item.improper}</p>
								</div>
							))}
						</div>
					</Motion.div>

					<Motion.div
						initial={{ opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="rounded-3xl p-6"
						style={{ backgroundColor: background.card, border: `1px solid ${border.light}`, boxShadow: shadows.md }}
					>
						<h3 className="text-lg font-semibold text-gray-900 mb-4">Exercise Details</h3>
						<div className="space-y-4">
							<div>
								<p className="text-gray-500 text-sm mb-1">Target Muscles</p>
								<p className="font-semibold">
									{exerciseToMuscleMap[prediction]?.join(', ') || workoutState.targetMuscle}
								</p>
							</div>
							<div>
								<p className="text-gray-500 text-sm mb-1">Intensity</p>
								<div className="w-full bg-gray-200 rounded-full h-2.5">
									<div
										className="h-2.5 rounded-full"
										style={{ width: `${workoutState.intensity}%`, background: gradients.primary }}
									/>
								</div>
							</div>
							<div>
								<p className="text-gray-500 text-sm mb-1">Form Quality</p>
								<div className="flex items-center gap-1">
									{new Array(5).fill(null).map((_, idx) => (
										<span key={idx} className="text-lg" style={{ color: idx < workoutState.formQuality ? primary.pink : '#d1d5db' }}>
											★
										</span>
									))}
								</div>
							</div>
						</div>
					</Motion.div>
				</div>
			</div>

			{promptUser && (
				<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
					<div className="w-[90%] max-w-md rounded-3xl p-6 text-center" style={{ backgroundColor: background.card, border: `1px solid ${border.light}` }}>
						<h2 className="text-xl font-semibold text-gray-900 mb-2">Perform an Exercise</h2>
						<p className="text-gray-600 mb-4">Move through a rep so the AI can detect your pattern. Keep your full body visible.</p>
						<button
							type="button"
							onClick={() => setPromptUser(false)}
							className="w-full py-3 rounded-2xl text-sm font-semibold"
							style={{ background: gradients.primary, color: text.light }}
						>
							Got it
						</button>
					</div>
				</div>
			)}

			{showConfirmation && (
				<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
					<div className="w-[90%] max-w-md rounded-3xl p-6" style={{ backgroundColor: background.card, border: `1px solid ${border.light}` }}>
						<h2 className="text-xl font-semibold text-gray-900 mb-2">Confirm Exercise</h2>
						<p className="text-gray-600 mb-4">Are you performing {prediction}? ({Math.round(predictionConfidence * 100)}% confidence)</p>
						<div className="flex flex-col gap-3">
							<button
								type="button"
								onClick={handleConfirmExercise}
								className="py-3 rounded-2xl font-semibold"
								style={{ background: gradients.primary, color: text.light }}
							>
								Yes, that's correct
							</button>
							<button
								type="button"
								onClick={handleRejectExercise}
								className="py-3 rounded-2xl font-semibold border"
								style={{ borderColor: border.light, color: primary.black }}
							>
								No, choose manually
							</button>
						</div>
						{showManualSelect && (
							<div className="mt-4 text-left">
								<label className="text-sm text-gray-500">Select exercise</label>
								<select
									className="w-full mt-1 rounded-2xl border px-3 py-2"
									style={{ borderColor: border.light }}
									defaultValue=""
									onChange={(event) => handleManualSelect(event.target.value)}
								>
									<option value="" disabled>
										Choose exercise…
									</option>
									{Object.keys(exerciseToMuscleMap).map((name) => (
										<option key={name} value={name}>
											{name}
										</option>
									))}
								</select>
							</div>
						)}
					</div>
				</div>
			)}

			{confirmEndWorkout && (
				<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
					<div className="w-[90%] max-w-lg rounded-3xl p-8 text-center" style={{ backgroundColor: background.card, border: `1px solid ${border.light}` }}>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">End workout session?</h2>
						<p className="text-gray-600 mb-6">This will stop streaming and reset counters.</p>
						<div className="flex flex-col gap-3">
							<button
								type="button"
								onClick={confirmEndSession}
								className="py-3 rounded-2xl font-semibold"
								style={{ background: gradients.primary, color: text.light }}
							>
								Yes, end now
							</button>
							<button
								type="button"
								onClick={cancelEndSession}
								className="py-3 rounded-2xl font-semibold border"
								style={{ borderColor: border.light, color: primary.black }}
							>
								No, keep streaming
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default LiveStream;
