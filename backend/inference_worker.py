"""
Physiovision Inference Worker - Supports both ML (classification) and DL (autoencoder) models.

Models:
- ML: Horizontal_Shoulder_Abduction.pkl (sklearn classifier)
- DL: horizontal_weighted_openings_Coords_Angles_NormalizedO.pkl (PyTorch Autoencoder)
"""

import sys
import json
import joblib
import numpy as np
import os
from pathlib import Path

# Try to import torch for deep learning model
try:
    import torch
    import torch.nn as nn
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    print("Python Log: PyTorch not available, deep learning model disabled", file=sys.stderr)

# --- MODEL PATHS ---
MODEL_DIR = Path(__file__).parent / 'model'

ML_MODEL_PATH = MODEL_DIR / 'Horizontal_Shoulder_Abduction.pkl'
DL_MODEL_PATH = MODEL_DIR / 'horizontal_weighted_openings_Coords_Angles_NormalizedO.pkl'

# Allow environment overrides
if os.environ.get('Physiovision_ML_MODEL_PATH'):
    ML_MODEL_PATH = Path(os.environ['Physiovision_ML_MODEL_PATH'])
if os.environ.get('Physiovision_DL_MODEL_PATH'):
    DL_MODEL_PATH = Path(os.environ['Physiovision_DL_MODEL_PATH'])

# --- AUTOENCODER DEFINITION (for DL model) ---
if TORCH_AVAILABLE:
    class Autoencoder(nn.Module):
        def __init__(self, input_size):
            super(Autoencoder, self).__init__()
            self.encoder = nn.Sequential(
                nn.Linear(input_size, 64),
                nn.ReLU(),
                nn.Linear(64, 32),
                nn.ReLU()
            )
            self.decoder = nn.Sequential(
                nn.Linear(32, 64),
                nn.ReLU(),
                nn.Linear(64, input_size)
            )

        def forward(self, x):
            encoded = self.encoder(x)
            decoded = self.decoder(encoded)
            return decoded

# --- LOAD MODELS ---
ML_MODEL = None
DL_MODEL = None
DL_THRESHOLD = 0.005313  # Anomaly detection threshold

# Load ML model (sklearn)
try:
    if ML_MODEL_PATH.exists():
        ML_MODEL = joblib.load(ML_MODEL_PATH)
        print(f"Python Log: Loaded ML model from {ML_MODEL_PATH}", file=sys.stderr)
    else:
        print(f"Python Log: ML model not found at {ML_MODEL_PATH}", file=sys.stderr)
except Exception as e:
    print(f"Python Log: Failed to load ML model: {e}", file=sys.stderr)

# Load DL model (PyTorch autoencoder via pickle)
if TORCH_AVAILABLE:
    try:
        import pickle
        if DL_MODEL_PATH.exists():
            with open(DL_MODEL_PATH, 'rb') as f:
                DL_MODEL = pickle.load(f)
            DL_MODEL.eval()
            print(f"Python Log: Loaded DL model from {DL_MODEL_PATH}", file=sys.stderr)
        else:
            print(f"Python Log: DL model not found at {DL_MODEL_PATH}", file=sys.stderr)
    except Exception as e:
        print(f"Python Log: Failed to load DL model: {e}", file=sys.stderr)

# --- LANDMARK NAMES (for DL bad joint reporting) ---
LANDMARK_NAMES = {
    0: "Nose", 1: "Left Eye Inner", 2: "Left Eye", 3: "Left Eye Outer",
    4: "Right Eye Inner", 5: "Right Eye", 6: "Right Eye Outer",
    7: "Left Ear", 8: "Right Ear", 9: "Mouth Left", 10: "Mouth Right",
    11: "Left Shoulder", 12: "Right Shoulder",
    13: "Left Elbow", 14: "Right Elbow",
    15: "Left Wrist", 16: "Right Wrist",
    17: "Left Pinky", 18: "Right Pinky",
    19: "Left Index", 20: "Right Index",
    21: "Left Thumb", 22: "Right Thumb",
    23: "Left Hip", 24: "Right Hip",
    25: "Left Knee", 26: "Right Knee",
    27: "Left Ankle", 28: "Right Ankle",
    29: "Left Heel", 30: "Right Heel",
    31: "Left Foot Index", 32: "Right Foot Index"
}

# --- HELPER FUNCTIONS ---

def flatten_landmarks(landmarks):
    """Flatten landmarks list to a vector [x, y, z, visibility] * 33."""
    vector = []
    for landmark in landmarks or []:
        vector.extend([
            float(landmark.get('x', 0.0)),
            float(landmark.get('y', 0.0)),
            float(landmark.get('z', 0.0)),
            float(landmark.get('visibility', 0.0)),
        ])
    return vector


def normalize_landmarks_live(landmarks_list):
    """
    Normalize landmarks: center at hip midpoint, scale by max distance.
    Used for DL model input.
    """
    landmarks = np.array(landmarks_list).reshape(-1, 4)
    
    # Indices: 23=Left Hip, 24=Right Hip
    left_hip = landmarks[23, :3]
    right_hip = landmarks[24, :3]
    
    # 1. Center (Midpoint of Hips)
    center = (left_hip + right_hip) / 2.0
    
    # 2. Translate
    landmarks[:, :3] -= center
    
    # 3. Scale
    distances = np.linalg.norm(landmarks[:, :3], axis=1)
    max_dist = np.max(distances)
    
    if max_dist > 0:
        landmarks[:, :3] /= max_dist
        
    return landmarks.flatten().tolist()


def calculate_angle(a, b, c):
    """Calculate angle at point b given three 2D points."""
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)

    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(
        a[1] - b[1], a[0] - b[0]
    )
    angle = np.abs(radians * 180.0 / np.pi)
    if angle > 180.0:
        angle = 360 - angle
    return angle


def get_live_angles(norm_landmarks):
    """Calculate joint angles from normalized landmarks."""
    lm = np.array(norm_landmarks).reshape(-1, 4)
    
    def get_pt(idx):
        return [lm[idx][0], lm[idx][1]]  # Only x, y needed for angles

    neck_angle = (calculate_angle(get_pt(11), get_pt(0), get_pt(23)) + 
                  calculate_angle(get_pt(12), get_pt(0), get_pt(24))) / 2
    left_elbow_angle = calculate_angle(get_pt(11), get_pt(13), get_pt(15))
    right_elbow_angle = calculate_angle(get_pt(12), get_pt(14), get_pt(16))
    left_shoulder_angle = calculate_angle(get_pt(13), get_pt(11), get_pt(23))
    right_shoulder_angle = calculate_angle(get_pt(14), get_pt(12), get_pt(24))
    left_hip_angle = calculate_angle(get_pt(11), get_pt(23), get_pt(25))
    right_hip_angle = calculate_angle(get_pt(12), get_pt(24), get_pt(26))
    left_knee_angle = calculate_angle(get_pt(23), get_pt(25), get_pt(27))
    right_knee_angle = calculate_angle(get_pt(24), get_pt(26), get_pt(28))
    left_ankle_angle = calculate_angle(get_pt(25), get_pt(27), get_pt(29))
    right_ankle_angle = calculate_angle(get_pt(26), get_pt(28), get_pt(30))

    return [neck_angle, left_elbow_angle, right_elbow_angle, left_shoulder_angle,
            right_shoulder_angle, left_hip_angle, right_hip_angle, left_knee_angle,
            right_knee_angle, left_ankle_angle, right_ankle_angle]


# --- CLASSIFICATION FUNCTIONS ---

def classify_ml(vector):
    """ML classification using sklearn model."""
    if ML_MODEL is None:
        return "ml_model_unavailable", 0.0, None
    
    try:
        features = np.array(vector, dtype=np.float32).reshape(1, -1)
        probabilities = ML_MODEL.predict_proba(features)[0]
        best_index = int(np.argmax(probabilities))
        confidence = float(probabilities[best_index])
        label = str(ML_MODEL.classes_[best_index])
        return label, confidence, None
    except Exception as e:
        try:
            label = str(ML_MODEL.predict(features)[0])
            return label, 0.0, None
        except Exception as e2:
            return "error", 0.0, str(e2)


def classify_dl(raw_landmarks):
    """DL anomaly detection using autoencoder."""
    if not TORCH_AVAILABLE or DL_MODEL is None:
        return "dl_model_unavailable", 0.0, None, []
    
    try:
        # 1. Normalize coordinates
        norm_coords = normalize_landmarks_live(raw_landmarks)
        
        # 2. Calculate angles
        raw_angles = get_live_angles(norm_coords)
        
        # 3. Normalize angles (divide by 360)
        norm_angles = [a / 360.0 for a in raw_angles]
        
        # 4. Combine input
        final_input = norm_coords + norm_angles
        
        # 5. Padding if needed
        expected_size = DL_MODEL.encoder[0].in_features
        if len(final_input) < expected_size:
            final_input.extend([0.0] * (expected_size - len(final_input)))
        
        # 6. Inference
        input_tensor = torch.tensor([final_input]).float()
        criterion = nn.MSELoss()
        
        with torch.no_grad():
            reconstruction = DL_MODEL(input_tensor)
            loss = criterion(reconstruction, input_tensor).item()
        
        # 7. Calculate per-joint error
        input_coords_only = input_tensor.numpy()[0][:132].reshape(33, 4)
        recon_coords_only = reconstruction.numpy()[0][:132].reshape(33, 4)
        
        diff_sq = (input_coords_only - recon_coords_only) ** 2
        joint_errors = np.mean(diff_sq, axis=1)  # Shape (33,)
        
        # Collect bad joints
        bad_joints = []
        for idx, err in enumerate(joint_errors):
            if err > DL_THRESHOLD:
                name = LANDMARK_NAMES.get(idx, f"Joint {idx}")
                # Skip face landmarks for cleaner feedback
                if idx >= 11:  # Body landmarks only
                    bad_joints.append({
                        "index": idx,
                        "name": name,
                        "error": float(err)
                    })
        
        # Sort by error (highest first)
        bad_joints.sort(key=lambda x: x["error"], reverse=True)
        
        # Determine label based on loss
        if loss > DL_THRESHOLD:
            label = "BAD_FORM"
            confidence = min(1.0, loss / (DL_THRESHOLD * 10))  # Scale confidence
        else:
            label = "GOOD_FORM"
            confidence = 1.0 - (loss / DL_THRESHOLD)
        
        return label, confidence, loss, bad_joints
        
    except Exception as e:
        return "error", 0.0, None, []


# --- MAIN LOOP ---

def main():
    print("Python inference worker ready (ML + DL models).", file=sys.stderr)
    print(f"  ML Model: {'Loaded' if ML_MODEL else 'Not available'}", file=sys.stderr)
    print(f"  DL Model: {'Loaded' if DL_MODEL else 'Not available'}", file=sys.stderr)
    
    for line in sys.stdin:
        try:
            data = json.loads(line)
            landmarks = data.get('landmarks', [])
            request_id = data.get('requestId')
            model_type = data.get('modelType', 'ml')  # 'ml' or 'dl'
            
            if model_type == 'dl':
                # Deep Learning (Autoencoder) inference
                raw_vector = flatten_landmarks(landmarks)
                label, confidence, loss, bad_joints = classify_dl(raw_vector)
                
                result = {
                    "requestId": request_id,
                    "modelType": "dl",
                    "label": label,
                    "confidence": confidence,
                    "loss": loss,
                    "badJoints": bad_joints,
                    "threshold": DL_THRESHOLD
                }
            else:
                # Machine Learning (Classification) inference
                vector = flatten_landmarks(landmarks)
                label, confidence, error = classify_ml(vector)
                
                result = {
                    "requestId": request_id,
                    "modelType": "ml",
                    "label": label,
                    "confidence": confidence
                }
                if error:
                    result["error"] = error
            
            print(json.dumps(result))
            sys.stdout.flush()
            
        except Exception as e:
            error_result = {
                "error": str(e),
                "requestId": data.get('requestId') if 'data' in dir() else None
            }
            print(json.dumps(error_result))
            sys.stdout.flush()


if __name__ == "__main__":
    main()
