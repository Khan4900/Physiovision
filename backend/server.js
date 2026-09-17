const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const path = require('path');
const { updateRepState, EXERCISE_TYPE } = require('./repCounter');
const { FEEDBACK_MAP, DEFAULT_FEEDBACK, DL_FEEDBACK_MAP, getDLFeedback } = require('./feedbackMap');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

// Spawn Python worker
const pythonScriptPath = path.join(__dirname, 'inference_worker.py');
console.log(`Spawning Python worker: ${pythonScriptPath}`);
const pythonProcess = spawn('python', [pythonScriptPath]);

pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Stderr: ${data}`);
});

pythonProcess.on('error', (err) => {
    console.error('Failed to start Python process:', err);
});

pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
});

const pendingRequests = new Map();

pythonProcess.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            // Handle potential multiple JSONs in one chunk or partials (simple split by newline works if flush is used)
            if (line.startsWith('Python Log:')) {
                console.log(line);
                continue;
            }
            
            const result = JSON.parse(line);
            const { requestId, label, confidence, error, modelType, loss, badJoints, threshold } = result;
            
            if (pendingRequests.has(requestId)) {
                const { ws } = pendingRequests.get(requestId);
                // Don't delete immediately if we want to track something, but here request is done
                pendingRequests.delete(requestId);

                if (ws.readyState === WebSocket.OPEN) {
                    if (error) {
                        ws.send(JSON.stringify({ 
                            type: 'status', 
                            status: 'error', 
                            message: error,
                            timestamp: new Date().toISOString()
                        }));
                        return;
                    }

                    // Handle Deep Learning model response
                    if (modelType === 'dl') {
                        const feedback = getDLFeedback(label, badJoints);
                        
                        ws.send(JSON.stringify({
                            type: 'prediction',
                            modelType: 'dl',
                            prediction: label,
                            feedback: feedback,
                            confidence: confidence,
                            loss: loss,
                            threshold: threshold,
                            badJoints: badJoints || [],
                            isCorrectForm: label === 'GOOD_FORM',
                            exerciseType: 'Horizontal Weighted Openings (Deep Learning)',
                            message: 'DL Prediction generated',
                            timestamp: new Date().toISOString()
                        }));
                        return;
                    }

                    // Handle Machine Learning model response (existing logic)
                    // Update State
                    // We use the state stored on the ws object
                    const newState = updateRepState(label, ws.repState);
                    ws.repState = newState;

                    const feedback = FEEDBACK_MAP[label] || DEFAULT_FEEDBACK;

                    ws.send(JSON.stringify({
                        type: 'prediction',
                        modelType: 'ml',
                        prediction: label,
                        feedback: feedback,
                        confidence: confidence,
                        repCount: newState.repCount,
                        stage: newState.stage,
                        isCorrectForm: newState.isCorrectForm,
                        exerciseType: EXERCISE_TYPE,
                        message: 'ML Prediction generated',
                        timestamp: new Date().toISOString()
                    }));
                }
            }
        } catch (e) {
            console.error('Error parsing Python output:', e, 'Line:', line);
        }
    }
});

wss.on('connection', (ws) => {
    console.log('Client connected');
    
    // Initialize state for this connection
    ws.repState = { stage: 'neutral', repCount: 0, isCorrectForm: false };
    ws.modelType = 'ml'; // Default to ML model

    ws.send(JSON.stringify({
        type: 'status',
        status: 'connected',
        message: 'WebSocket connected. Send pose landmarks to receive feedback.',
        exerciseType: EXERCISE_TYPE,
        availableModels: ['ml', 'dl'],
        timestamp: new Date().toISOString()
    }));

    ws.on('message', (message) => {
        try {
            const payload = JSON.parse(message);
            
            // Handle model selection message
            if (payload.type === 'selectModel') {
                ws.modelType = payload.modelType === 'dl' ? 'dl' : 'ml';
                ws.repState = { stage: 'neutral', repCount: 0, isCorrectForm: false }; // Reset state
                ws.send(JSON.stringify({
                    type: 'status',
                    status: 'model_selected',
                    modelType: ws.modelType,
                    message: `Model switched to ${ws.modelType === 'dl' ? 'Deep Learning (Autoencoder)' : 'Machine Learning (Classification)'}`,
                    timestamp: new Date().toISOString()
                }));
                return;
            }
            
            if (payload.type !== 'landmarks') {
                ws.send(JSON.stringify({ 
                    type: 'status', 
                    status: 'ignored', 
                    message: 'Unsupported message type',
                    timestamp: new Date().toISOString()
                }));
                return;
            }

            const requestId = Math.random().toString(36).substring(7);
            pendingRequests.set(requestId, { ws });

            // Send to Python worker with model type
            const workerPayload = JSON.stringify({
                landmarks: payload.landmarks,
                requestId: requestId,
                modelType: ws.modelType
            });
            pythonProcess.stdin.write(workerPayload + '\n');

        } catch (e) {
            console.error('Error processing message:', e);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Node.js Physiovision Server running on port ${PORT}`);
    console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
    console.log(`Available models: ML (Classification), DL (Autoencoder)`);
});
