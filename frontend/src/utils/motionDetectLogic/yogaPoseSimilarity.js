import similarity from 'compute-cosine-similarity';

// Reference poses extracted from the provided JSON data
// These are the actual keypoints from reference images
export const referencePoses = {
  'tadasana': {
    name: 'Mountain Pose',
    keypoints: [
      { x: 147.9, y: 55.8 }, // nose
      { x: 155.1, y: 45.6 }, // left_eye_inner
      { x: 155.1, y: 45.6 }, // left_eye
      { x: 155.1, y: 45.6 }, // left_eye_outer
      { x: 139.5, y: 46.6 }, // right_eye_inner
      { x: 139.5, y: 46.6 }, // right_eye
      { x: 139.5, y: 46.6 }, // right_eye_outer
      { x: 168.1, y: 52.9 }, // left_ear
      { x: 129.5, y: 54 }, // right_ear
      { x: 147.9, y: 55.8 }, // mouth_left
      { x: 147.9, y: 55.8 }, // mouth_right
      { x: 186.8, y: 102 }, // left_shoulder
      { x: 111.7, y: 101.3 }, // right_shoulder
      { x: 198.7, y: 166.5 }, // left_elbow
      { x: 95.6, y: 165.1 }, // right_elbow
      { x: 212.8, y: 217.6 }, // left_wrist
      { x: 77.7, y: 215.3 }, // right_wrist
      { x: 212.8, y: 217.6 }, // left_pinky
      { x: 77.7, y: 215.3 }, // right_pinky
      { x: 212.8, y: 217.6 }, // left_index
      { x: 77.7, y: 215.3 }, // right_index
      { x: 212.8, y: 217.6 }, // left_thumb
      { x: 77.7, y: 215.3 }, // right_thumb
      { x: 169.5, y: 210 }, // left_hip
      { x: 125.8, y: 210.2 }, // right_hip
      { x: 165.8, y: 295.4 }, // left_knee
      { x: 130.7, y: 295.3 }, // right_knee
      { x: 160.2, y: 378.3 }, // left_ankle
      { x: 138.4, y: 381.9 }, // right_ankle
      { x: 160.2, y: 378.3 }, // left_heel
      { x: 138.4, y: 381.9 }, // right_heel
      { x: 160.2, y: 378.3 }, // left_foot_index
      { x: 138.4, y: 381.9 }, // right_foot_index
    ]
  },
  'warrior-i': {
    name: 'Warrior I Pose',
    keypoints: [
      { x: 205.2, y: 171.4 }, // nose
      { x: 214.7, y: 163.2 }, // left_eye_inner
      { x: 214.7, y: 163.2 }, // left_eye
      { x: 214.7, y: 163.2 }, // left_eye_outer
      { x: 203.9, y: 155.1 }, // right_eye_inner
      { x: 203.9, y: 155.1 }, // right_eye
      { x: 203.9, y: 155.1 }, // right_eye_outer
      { x: 221.1, y: 165.7 }, // left_ear
      { x: 199.1, y: 161.8 }, // right_ear
      { x: 205.2, y: 171.4 }, // mouth_left
      { x: 205.2, y: 171.4 }, // mouth_right
      { x: 189.9, y: 191.2 }, // left_shoulder
      { x: 182.5, y: 175 }, // right_shoulder
      { x: 191.2, y: 123.6 }, // left_elbow
      { x: 191.9, y: 122.3 }, // right_elbow
      { x: 282.4, y: 343.8 }, // left_wrist
      { x: 195.9, y: 59.1 }, // right_wrist
      { x: 282.4, y: 343.8 }, // left_pinky
      { x: 195.9, y: 59.1 }, // right_pinky
      { x: 282.4, y: 343.8 }, // left_index
      { x: 195.9, y: 59.1 }, // right_index
      { x: 282.4, y: 343.8 }, // left_thumb
      { x: 195.9, y: 59.1 }, // right_thumb
      { x: 161.8, y: 269.5 }, // left_hip
      { x: 184.7, y: 273.6 }, // right_hip
      { x: 79.8, y: 276.3 }, // left_knee
      { x: 238.5, y: 321.1 }, // right_knee
      { x: 70, y: 361.2 }, // left_ankle
      { x: 306.4, y: 386.1 }, // right_ankle
      { x: 70, y: 361.2 }, // left_heel
      { x: 306.4, y: 386.1 }, // right_heel
      { x: 70, y: 361.2 }, // left_foot_index
      { x: 306.4, y: 386.1 }, // right_foot_index
    ]
  },
  'warrior-ii': {
    name: 'Warrior II Pose',
    keypoints: [
      { x: 231, y: 55.1 }, // nose
      { x: 245.7, y: 48.8 }, // left_eye_inner
      { x: 245.7, y: 48.8 }, // left_eye
      { x: 245.7, y: 48.8 }, // left_eye_outer
      { x: 230.4, y: 44 }, // right_eye_inner
      { x: 230.4, y: 44 }, // right_eye
      { x: 230.4, y: 44 }, // right_eye_outer
      { x: 273.7, y: 59.4 }, // left_ear
      { x: 232.5, y: 63.8 }, // right_ear
      { x: 231, y: 55.1 }, // mouth_left
      { x: 231, y: 55.1 }, // mouth_right
      { x: 299.9, y: 110.4 }, // left_shoulder
      { x: 216.1, y: 99.1 }, // right_shoulder
      { x: 379.1, y: 105.9 }, // left_elbow
      { x: 163.7, y: 101.5 }, // right_elbow
      { x: 453.3, y: 94.1 }, // left_wrist
      { x: 82.2, y: 82.9 }, // right_wrist
      { x: 453.3, y: 94.1 }, // left_pinky
      { x: 82.2, y: 82.9 }, // right_pinky
      { x: 453.3, y: 94.1 }, // left_index
      { x: 82.2, y: 82.9 }, // right_index
      { x: 453.3, y: 94.1 }, // left_thumb
      { x: 82.2, y: 82.9 }, // right_thumb
      { x: 284.7, y: 236.6 }, // left_hip
      { x: 224.8, y: 230.5 }, // right_hip
      { x: 347.6, y: 287.2 }, // left_knee
      { x: 121.4, y: 246.5 }, // right_knee
      { x: 412.5, y: 360.8 }, // left_ankle
      { x: 123, y: 351.1 }, // right_ankle
      { x: 412.5, y: 360.8 }, // left_heel
      { x: 123, y: 351.1 }, // right_heel
      { x: 412.5, y: 360.8 }, // left_foot_index
      { x: 123, y: 351.1 }, // right_foot_index
    ]
  },
  'vrksasana': {
    name: 'Tree Pose',
    keypoints: [
      { x: 157.1, y: 112.2 }, // nose
      { x: 165.7, y: 110.2 }, // left_eye_inner
      { x: 165.7, y: 110.2 }, // left_eye
      { x: 165.7, y: 110.2 }, // left_eye_outer
      { x: 152.7, y: 107.6 }, // right_eye_inner
      { x: 152.7, y: 107.6 }, // right_eye
      { x: 152.7, y: 107.6 }, // right_eye_outer
      { x: 180.2, y: 117.3 }, // left_ear
      { x: 137.9, y: 115.2 }, // right_ear
      { x: 157.1, y: 112.2 }, // mouth_left
      { x: 157.1, y: 112.2 }, // mouth_right
      { x: 172.3, y: 146 }, // left_shoulder
      { x: 134.3, y: 136.6 }, // right_shoulder
      { x: 208.7, y: 99.7 }, // left_elbow
      { x: 98.2, y: 103.6 }, // right_elbow
      { x: 224.3, y: 57.2 }, // left_wrist
      { x: 93.5, y: 55 }, // right_wrist
      { x: 224.3, y: 57.2 }, // left_pinky
      { x: 93.5, y: 55 }, // right_pinky
      { x: 224.3, y: 57.2 }, // left_index
      { x: 93.5, y: 55 }, // right_index
      { x: 224.3, y: 57.2 }, // left_thumb
      { x: 93.5, y: 55 }, // right_thumb
      { x: 157.8, y: 240.7 }, // left_hip
      { x: 127.1, y: 222 }, // right_hip
      { x: 154.6, y: 314.7 }, // left_knee
      { x: 56.4, y: 255.1 }, // right_knee
      { x: 143.5, y: 373.9 }, // left_ankle
      { x: 121.4, y: 277.2 }, // right_ankle
      { x: 143.5, y: 373.9 }, // left_heel
      { x: 121.4, y: 277.2 }, // right_heel
      { x: 143.5, y: 373.9 }, // left_foot_index
      { x: 121.4, y: 277.2 }, // right_foot_index
    ]
  },
  'chair-pose': {
    name: 'Chair Pose',
    keypoints: [
      { x: 315.9, y: 118.8 }, // nose
      { x: 311.1, y: 111.2 }, // left_eye_inner
      { x: 311.1, y: 111.2 }, // left_eye
      { x: 311.1, y: 111.2 }, // left_eye_outer
      { x: 315.9, y: 110.7 }, // right_eye_inner
      { x: 315.9, y: 110.7 }, // right_eye
      { x: 315.9, y: 110.7 }, // right_eye_outer
      { x: 311.1, y: 111.7 }, // left_ear
      { x: 302.4, y: 104.2 }, // right_ear
      { x: 315.9, y: 118.8 }, // mouth_left
      { x: 315.9, y: 118.8 }, // mouth_right
      { x: 298.4, y: 123 }, // left_shoulder
      { x: 282.2, y: 108.8 }, // right_shoulder
      { x: 335.4, y: 63.2 }, // left_elbow
      { x: 312.7, y: 86.1 }, // right_elbow
      { x: 353, y: 48.5 }, // left_wrist
      { x: 336.4, y: 60.6 }, // right_wrist
      { x: 353, y: 48.5 }, // left_pinky
      { x: 336.4, y: 60.6 }, // right_pinky
      { x: 353, y: 48.5 }, // left_index
      { x: 336.4, y: 60.6 }, // right_index
      { x: 353, y: 48.5 }, // left_thumb
      { x: 336.4, y: 60.6 }, // right_thumb
      { x: 260, y: 196.9 }, // left_hip
      { x: 252.1, y: 202.2 }, // right_hip
      { x: 318.7, y: 228.5 }, // left_knee
      { x: 325.8, y: 217.5 }, // right_knee
      { x: 281.1, y: 289.2 }, // left_ankle
      { x: 284.8, y: 256.9 }, // right_ankle
      { x: 281.1, y: 289.2 }, // left_heel
      { x: 284.8, y: 256.9 }, // right_heel
      { x: 281.1, y: 289.2 }, // left_foot_index
      { x: 284.8, y: 256.9 }, // right_foot_index
    ]
  },
  'eagle': {
    name: 'Eagle Pose',
    keypoints: [
      { x: 138.8, y: 64.5 }, // nose
      { x: 145.1, y: 62.1 }, // left_eye_inner
      { x: 145.1, y: 62.1 }, // left_eye
      { x: 145.1, y: 62.1 }, // left_eye_outer
      { x: 138.1, y: 55.6 }, // right_eye_inner
      { x: 138.1, y: 55.6 }, // right_eye
      { x: 138.1, y: 55.6 }, // right_eye_outer
      { x: 167.5, y: 76.1 }, // left_ear
      { x: 128.8, y: 64 }, // right_ear
      { x: 138.8, y: 64.5 }, // mouth_left
      { x: 138.8, y: 64.5 }, // mouth_right
      { x: 176.8, y: 117.2 }, // left_shoulder
      { x: 144.1, y: 111.9 }, // right_shoulder
      { x: 122.5, y: 114.9 }, // left_elbow
      { x: 86.4, y: 115.9 }, // right_elbow
      { x: 86.7, y: 57.6 }, // left_wrist
      { x: 75.4, y: 67.7 }, // right_wrist
      { x: 86.7, y: 57.6 }, // left_pinky
      { x: 75.4, y: 67.7 }, // right_pinky
      { x: 86.7, y: 57.6 }, // left_index
      { x: 75.4, y: 67.7 }, // right_index
      { x: 86.7, y: 57.6 }, // left_thumb
      { x: 75.4, y: 67.7 }, // right_thumb
      { x: 185.5, y: 244.4 }, // left_hip
      { x: 174.7, y: 240.2 }, // right_hip
      { x: 93.8, y: 286.6 }, // left_knee
      { x: 119, y: 282.4 }, // right_knee
      { x: 168.7, y: 370.4 }, // left_ankle
      { x: 186.5, y: 340.9 }, // right_ankle
      { x: 168.7, y: 370.4 }, // left_heel
      { x: 186.5, y: 340.9 }, // right_heel
      { x: 168.7, y: 370.4 }, // left_foot_index
      { x: 186.5, y: 340.9 }, // right_foot_index
    ]
  },
  'garland': {
    name: 'Garland Pose',
    keypoints: [
      { x: 182.2, y: 111 }, // nose
      { x: 193.8, y: 99.9 }, // left_eye_inner
      { x: 193.8, y: 99.9 }, // left_eye
      { x: 193.8, y: 99.9 }, // left_eye_outer
      { x: 172.8, y: 99.9 }, // right_eye_inner
      { x: 172.8, y: 99.9 }, // right_eye
      { x: 172.8, y: 99.9 }, // right_eye_outer
      { x: 211, y: 108.7 }, // left_ear
      { x: 158, y: 106.2 }, // right_ear
      { x: 182.2, y: 111 }, // mouth_left
      { x: 182.2, y: 111 }, // mouth_right
      { x: 231, y: 167.7 }, // left_shoulder
      { x: 131.5, y: 166.5 }, // right_shoulder
      { x: 255.6, y: 240.9 }, // left_elbow
      { x: 98.6, y: 235.9 }, // right_elbow
      { x: 217, y: 250.6 }, // left_wrist
      { x: 155, y: 256.2 }, // right_wrist
      { x: 217, y: 250.6 }, // left_pinky
      { x: 155, y: 256.2 }, // right_pinky
      { x: 217, y: 250.6 }, // left_index
      { x: 155, y: 256.2 }, // right_index
      { x: 217, y: 250.6 }, // left_thumb
      { x: 155, y: 256.2 }, // right_thumb
      { x: 215.2, y: 284.4 }, // left_hip
      { x: 156.7, y: 279 }, // right_hip
      { x: 281.1, y: 247.4 }, // left_knee
      { x: 72.1, y: 251.5 }, // right_knee
      { x: 242.4, y: 336.5 }, // left_ankle
      { x: 130.4, y: 335.6 }, // right_ankle
      { x: 242.4, y: 336.5 }, // left_heel
      { x: 130.4, y: 335.6 }, // right_heel
      { x: 242.4, y: 336.5 }, // left_foot_index
      { x: 130.4, y: 335.6 }, // right_foot_index
    ]
  },
  'half-moon': {
    name: 'Half Moon Pose',
    keypoints: [
      { x: 87.2, y: 231 }, // nose
      { x: 84.3, y: 225.3 }, // left_eye_inner
      { x: 84.3, y: 225.3 }, // left_eye
      { x: 84.3, y: 225.3 }, // left_eye_outer
      { x: 76.9, y: 232 }, // right_eye_inner
      { x: 76.9, y: 232 }, // right_eye
      { x: 76.9, y: 232 }, // right_eye_outer
      { x: 86.5, y: 207.3 }, // left_ear
      { x: 82, y: 234.1 }, // right_ear
      { x: 87.2, y: 231 }, // mouth_left
      { x: 87.2, y: 231 }, // mouth_right
      { x: 110.9, y: 181.3 }, // left_shoulder
      { x: 133.4, y: 248.9 }, // right_shoulder
      { x: 111.7, y: 136.6 }, // left_elbow
      { x: 144, y: 287.1 }, // right_elbow
      { x: 391.6, y: 150 }, // left_wrist
      { x: 108.8, y: 356.1 }, // right_wrist
      { x: 391.6, y: 150 }, // left_pinky
      { x: 108.8, y: 356.1 }, // right_pinky
      { x: 391.6, y: 150 }, // left_index
      { x: 108.8, y: 356.1 }, // right_index
      { x: 391.6, y: 150 }, // left_thumb
      { x: 108.8, y: 356.1 }, // right_thumb
      { x: 229.2, y: 168 }, // left_hip
      { x: 209.2, y: 216.2 }, // right_hip
      { x: 222, y: 294.9 }, // left_knee
      { x: 227.5, y: 289.6 }, // right_knee
      { x: 230, y: 383.5 }, // left_ankle
      { x: 129.8, y: 367.1 }, // right_ankle
      { x: 230, y: 383.5 }, // left_heel
      { x: 129.8, y: 367.1 }, // right_heel
      { x: 230, y: 383.5 }, // left_foot_index
      { x: 129.8, y: 367.1 }, // right_foot_index
    ]
  },
  'bigtoe-pose': {
    name: 'Big Toe Pose',
    keypoints: [
      { x: 217.8, y: 259.4 }, // nose
      { x: 177.9, y: 229 }, // left_eye_inner
      { x: 177.9, y: 229 }, // left_eye
      { x: 177.9, y: 229 }, // left_eye_outer
      { x: 200.6, y: 262.5 }, // right_eye_inner
      { x: 200.6, y: 262.5 }, // right_eye
      { x: 200.6, y: 262.5 }, // right_eye_outer
      { x: 138.8, y: 260.5 }, // left_ear
      { x: 204.8, y: 259.7 }, // right_ear
      { x: 217.8, y: 259.4 }, // mouth_left
      { x: 217.8, y: 259.4 }, // mouth_right
      { x: 158.6, y: 194.6 }, // left_shoulder
      { x: 220.6, y: 182.4 }, // right_shoulder
      { x: 155.8, y: 239 }, // left_elbow
      { x: 233.4, y: 255 }, // right_elbow
      { x: 155.8, y: 310.9 }, // left_wrist
      { x: 178.3, y: 349.7 }, // right_wrist
      { x: 155.8, y: 310.9 }, // left_pinky
      { x: 178.3, y: 349.7 }, // right_pinky
      { x: 155.8, y: 310.9 }, // left_index
      { x: 178.3, y: 349.7 }, // right_index
      { x: 155.8, y: 310.9 }, // left_thumb
      { x: 178.3, y: 349.7 }, // right_thumb
      { x: 237, y: 45.6 }, // left_hip
      { x: 266.8, y: 62.5 }, // right_hip
      { x: 148.4, y: 203.1 }, // left_knee
      { x: 261.3, y: 218.5 }, // right_knee
      { x: 247.7, y: 370.4 }, // left_ankle
      { x: 195, y: 363.3 }, // right_ankle
      { x: 247.7, y: 370.4 }, // left_heel
      { x: 195, y: 363.3 }, // right_heel
      { x: 247.7, y: 370.4 }, // left_foot_index
      { x: 195, y: 363.3 }, // right_foot_index
    ]
  },
  'gate': {
    name: 'Gate Pose',
    keypoints: [
      { x: 188.9, y: 144.4 }, // nose
      { x: 192.2, y: 133.3 }, // left_eye_inner
      { x: 192.2, y: 133.3 }, // left_eye
      { x: 192.2, y: 133.3 }, // left_eye_outer
      { x: 181.2, y: 145 }, // right_eye_inner
      { x: 181.2, y: 145 }, // right_eye
      { x: 181.2, y: 145 }, // right_eye_outer
      { x: 208.7, y: 131 }, // left_ear
      { x: 181.7, y: 154.8 }, // right_ear
      { x: 188.9, y: 144.4 }, // mouth_left
      { x: 188.9, y: 144.4 }, // mouth_right
      { x: 239.8, y: 155.2 }, // left_shoulder
      { x: 210.2, y: 193.2 }, // right_shoulder
      { x: 207.5, y: 93 }, // left_elbow
      { x: 185.1, y: 260.5 }, // right_elbow
      { x: 184.4, y: 56.1 }, // left_wrist
      { x: 146.4, y: 328.1 }, // right_wrist
      { x: 184.4, y: 56.1 }, // left_pinky
      { x: 146.4, y: 328.1 }, // right_pinky
      { x: 184.4, y: 56.1 }, // left_index
      { x: 146.4, y: 328.1 }, // right_index
      { x: 184.4, y: 56.1 }, // left_thumb
      { x: 146.4, y: 328.1 }, // right_thumb
      { x: 265, y: 268.1 }, // left_hip
      { x: 276.6, y: 278.2 }, // right_hip
      { x: 246.6, y: 349.4 }, // left_knee
      { x: 290, y: 345 }, // right_knee
      { x: 159.8, y: 348.6 }, // left_ankle
      { x: 290.4, y: 417.9 }, // right_ankle
      { x: 159.8, y: 348.6 }, // left_heel
      { x: 290.4, y: 417.9 }, // right_heel
      { x: 159.8, y: 348.6 }, // left_foot_index
      { x: 290.4, y: 417.9 }, // right_foot_index
    ]
  },
  'parivrtta-trikonasana': {
    name: 'Revolved Triangle Pose',
    keypoints: [
      { x: 59, y: 213.9 }, // nose
      { x: 55.6, y: 208.7 }, // left_eye_inner
      { x: 55.6, y: 208.7 }, // left_eye
      { x: 55.6, y: 208.7 }, // left_eye_outer
      { x: 50.5, y: 224.9 }, // right_eye_inner
      { x: 50.5, y: 224.9 }, // right_eye
      { x: 50.5, y: 224.9 }, // right_eye_outer
      { x: 70.9, y: 196.3 }, // left_ear
      { x: 60, y: 230.8 }, // right_ear
      { x: 59, y: 213.9 }, // mouth_left
      { x: 59, y: 213.9 }, // mouth_right
      { x: 90.4, y: 172.9 }, // left_shoulder
      { x: 101, y: 246.3 }, // right_shoulder
      { x: 117.6, y: 123.8 }, // left_elbow
      { x: 120.6, y: 295.9 }, // right_elbow
      { x: 109.6, y: 66.3 }, // left_wrist
      { x: 107.6, y: 374.4 }, // right_wrist
      { x: 109.6, y: 66.3 }, // left_pinky
      { x: 107.6, y: 374.4 }, // right_pinky
      { x: 109.6, y: 66.3 }, // left_index
      { x: 107.6, y: 374.4 }, // right_index
      { x: 109.6, y: 66.3 }, // left_thumb
      { x: 107.6, y: 374.4 }, // right_thumb
      { x: 208.4, y: 206.3 }, // left_hip
      { x: 203.2, y: 236 }, // right_hip
      { x: 166.9, y: 295.9 }, // left_knee
      { x: 275.9, y: 298.9 }, // right_knee
      { x: 117.4, y: 368.9 }, // left_ankle
      { x: 346.7, y: 365.6 }, // right_ankle
      { x: 117.4, y: 368.9 }, // left_heel
      { x: 346.7, y: 365.6 }, // right_heel
      { x: 117.4, y: 368.9 }, // left_foot_index
      { x: 346.7, y: 365.6 }, // right_foot_index
    ]
  },
  'dance': {
    name: 'Dancer Pose',
    keypoints: [
      { x: 278.3, y: 135.3 }, // nose
      { x: 280.2, y: 131.7 }, // left_eye_inner
      { x: 280.2, y: 131.7 }, // left_eye
      { x: 280.2, y: 131.7 }, // left_eye_outer
      { x: 276.1, y: 122.2 }, // right_eye_inner
      { x: 276.1, y: 122.2 }, // right_eye
      { x: 276.1, y: 122.2 }, // right_eye_outer
      { x: 257, y: 115.8 }, // left_ear
      { x: 257.7, y: 121 }, // right_ear
      { x: 278.3, y: 135.3 }, // mouth_left
      { x: 278.3, y: 135.3 }, // mouth_right
      { x: 253.3, y: 150.1 }, // left_shoulder
      { x: 220, y: 129.5 }, // right_shoulder
      { x: 289, y: 176.5 }, // left_elbow
      { x: 158.1, y: 123.8 }, // right_elbow
      { x: 351.6, y: 172.7 }, // left_wrist
      { x: 115.4, y: 96.4 }, // right_wrist
      { x: 351.6, y: 172.7 }, // left_pinky
      { x: 115.4, y: 96.4 }, // right_pinky
      { x: 351.6, y: 172.7 }, // left_index
      { x: 115.4, y: 96.4 }, // right_index
      { x: 351.6, y: 172.7 }, // left_thumb
      { x: 115.4, y: 96.4 }, // right_thumb
      { x: 181.8, y: 202.3 }, // left_hip
      { x: 158.5, y: 192.2 }, // right_hip
      { x: 159.9, y: 288.3 }, // left_knee
      { x: 159.1, y: 276.4 }, // right_knee
      { x: 153.6, y: 362.9 }, // left_ankle
      { x: 154.3, y: 357.8 }, // right_ankle
      { x: 153.6, y: 362.9 }, // left_heel
      { x: 154.3, y: 357.8 }, // right_heel
      { x: 153.6, y: 362.9 }, // left_foot_index
      { x: 154.3, y: 357.8 }, // right_foot_index
    ]
  }
};

/**
 * Convert MediaPipe landmarks to pose vector for similarity calculation
 * @param {Array} landmarks - MediaPipe landmarks array
 * @returns {Array} Normalized pose vector
 */
export function getPoseVector(landmarks) {
  if (!landmarks || landmarks.length === 0) {
    return [];
  }

  const xPos = landmarks.map(k => k.x);
  const yPos = landmarks.map(k => k.y);

  let minX = Math.min(...xPos);
  let minY = Math.min(...yPos);

  const vector = [];
  for (let i = 0; i < xPos.length; i++) {
    vector.push(xPos[i] - minX);
    vector.push(yPos[i] - minY);
  }
  return vector;
}

/**
 * Calculate cosine similarity between two poses
 * @param {Array} pose1 - First pose vector
 * @param {Array} pose2 - Second pose vector
 * @returns {number} Cosine similarity score (0-1, where 1 is perfect match)
 */
export function calculatePoseSimilarity(pose1, pose2) {
  if (!pose1 || !pose2 || pose1.length !== pose2.length) {
    return 0;
  }

  try {
    const cosineSimilarity = similarity(pose1, pose2);
    return Math.max(0, cosineSimilarity); // Ensure non-negative
  } catch (error) {
    console.error('Error calculating cosine similarity:', error);
    return 0;
  }
}

/**
 * Calculate pose similarity using cosine distance matching
 * @param {Array} pose1 - First pose vector
 * @param {Array} pose2 - Second pose vector
 * @returns {number} Distance score (lower is better match)
 */
export function cosineDistanceMatching(pose1, pose2) {
  if (!pose1 || !pose2 || pose1.length !== pose2.length) {
    return 1; // Maximum distance for invalid poses
  }

  try {
    const cosineSimilarity = similarity(pose1, pose2);
    const distance = 2 * (1 - cosineSimilarity);
    return Math.sqrt(distance);
  } catch (error) {
    console.error('Error calculating cosine distance:', error);
    return 1;
  }
}

/**
 * Evaluate yoga pose against reference pose
 * @param {Array} currentLandmarks - Current MediaPipe landmarks
 * @param {string} poseName - Name of the reference pose
 * @returns {Object} Evaluation result with similarity score and feedback
 */
export function evaluateYogaPose(currentLandmarks, poseName) {
  const referencePose = referencePoses[poseName];
  
  if (!referencePose || !currentLandmarks) {
    return {
      similarity: 0,
      score: 0,
      feedback: 'No reference pose found or invalid landmarks'
    };
  }

  // Convert current landmarks to vector
  const currentVector = getPoseVector(currentLandmarks);
  
  // Convert reference pose to vector
  const referenceVector = getPoseVector(referencePose.keypoints);
  
  // Calculate similarity
  const similarity = calculatePoseSimilarity(currentVector, referenceVector);
  
  // Calculate score based on similarity (0-100)
  const score = Math.round(similarity * 100);
  
  // Generate feedback based on similarity
  let feedback = '';
  if (similarity >= 0.9) {
    feedback = 'Excellent!';
  // } else if (similarity >= 0.8) {
  //   feedback = 'Good form, minor adjustments needed';
  // } else if (similarity >= 0.7) {
  //   feedback = 'Fair form, focus on alignment';
  // } else if (similarity >= 0.6) {
  //   feedback = 'Needs improvement, check your posture';
  // } else {
    feedback = 'Please adjust your pose to match the reference';
  }
  
  return {
    similarity,
    score,
    feedback,
    poseName: referencePose.name
  };
}

/**
 * Get available yoga poses
 * @returns {Array} List of available pose names
 */
export function getAvailableYogaPoses() {
  return Object.keys(referencePoses);
}

/**
 * Load reference pose data (placeholder for future implementation)
 * In a real implementation, this would load pose data from files or API
 * @param {string} poseName - Name of the pose
 * @returns {Object|null} Reference pose data or null
 */
export function loadReferencePose(poseName) {
  return referencePoses[poseName] || null;
}
