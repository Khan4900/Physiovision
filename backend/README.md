# Physiovision Node.js Backend

This is the Node.js backend for Physiovision, replacing the original Python FastAPI server. It handles WebSocket connections for real-time pose estimation feedback.

## Architecture

- **Node.js (Express + ws)**: Handles the WebSocket server and client connections.
- **Python Worker (`inference_worker.py`)**: A child process spawned by Node.js. It loads the Scikit-learn machine learning models (`.pkl` files) and performs inference.
- **Communication**: Node.js sends landmarks to the Python worker via `stdin`, and the worker returns predictions via `stdout`.

## Prerequisites

1.  **Node.js**: Ensure Node.js is installed.
2.  **Python**: Ensure Python is installed and available in your system PATH.
3.  **Python Dependencies**: The Python environment must have the following packages installed (same as the original backend):
    - `scikit-learn`
    - `joblib`
    - `numpy`
    - `pandas`

## Setup

1.  Navigate to the `backend-node` directory:
    ```bash
    cd backend-node
    ```

2.  Install Node.js dependencies:
    ```bash
    npm install
    ```

## Running the Server

Start the server using:

```bash
npm start
```

The server will start on port **8000**.
WebSocket endpoint: `ws://localhost:8000/ws`

## Files

- `server.js`: Main application entry point.
- `inference_worker.py`: Python script for model inference.
- `repCounter.js`: Logic for counting reps and tracking exercise state.
- `feedbackMap.js`: Feedback messages for different exercise states.
- `model/`: Directory containing the `.pkl` and `.keras` models (ensure your models are here).
