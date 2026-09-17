import { landmarkNames } from "./landmarkNames";
import { BaseCounter } from "./baseCounter";
import { calculateAngle } from "../utils";

export class PullUpsCounter extends BaseCounter {
  constructor() {
    super();
    this.elbowAngle = null;
    this.isReady = false;
    this.alertThreshold = 60;
  }

  static MET = 8.0; // Metabolic equivalent of task (MET) for pull-ups
  static TIME_PER_REP = 4; // Time taken to complete one pull-up rep

  _validateCustomConditions(landmarks) {
    // Ensure key landmarks are visible for pull-up detection
    const nose = landmarks[landmarkNames.NOSE];
    const rightShoulder = landmarks[landmarkNames.RIGHT_SHOULDER];
    const rightElbow = landmarks[landmarkNames.RIGHT_ELBOW];
    const rightWrist = landmarks[landmarkNames.RIGHT_WRIST];

    // Check if all required landmarks are visible
    const requiredLandmarks = [nose, rightShoulder, rightElbow, rightWrist];
    return requiredLandmarks.every(
      (landmark) => landmark && landmark.x >= 0 && landmark.x <= 1 && landmark.y >= 0 && landmark.y <= 1
    );
  }

  _processSpecificPose(landmarks) {
    const nose = landmarks[landmarkNames.NOSE];
    const rightShoulder = landmarks[landmarkNames.RIGHT_SHOULDER];
    const rightElbow = landmarks[landmarkNames.RIGHT_ELBOW];
    const rightWrist = landmarks[landmarkNames.RIGHT_WRIST];

    // Also check left side for better accuracy
    const leftShoulder = landmarks[landmarkNames.LEFT_SHOULDER];
    const leftElbow = landmarks[landmarkNames.LEFT_ELBOW];
    const leftWrist = landmarks[landmarkNames.LEFT_WRIST];

    // Calculate elbow angles
    const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
    const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    
    // Use the average or the visible arm
    this.elbowAngle = (rightElbowAngle + leftElbowAngle) / 2;
    this.noseY = nose.y;
    this.wristY = (rightWrist.y + leftWrist.y) / 2;

    // Process Alert
    this.#processAlert();

    // Process Count
    this.#processCount();

    return {
      count: this.successCount,
      alert: this.alert,
      calorie: PullUpsCounter.MET * (PullUpsCounter.TIME_PER_REP / 3600) * 1.05,
      score: 1,
    };
  }

  #processAlert() {
    // Check if user is in starting position (hanging with arms extended)
    if (this.elbowAngle > 150) {
      this.isReady = true;
    }

    // Alert if movement is too fast or jerky
    if (this.isReady && this.elbowAngle > 90 && this.elbowAngle < 150 && !this.up && !this.down) {
      this.alertCount += 1;
    }

    if (this.alertCount >= this.alertThreshold) {
      this.alert = "Control your movement. Pull up steadily.";
      this.alertCount = 0;
    } else if (this.isReady) {
      this.alert = null;
    }
  }

  #processCount() {
    // Check to ensure right form before starting
    // Starting position (dead hang): arms extended (elbow > 160), chin below hands
    if (this.elbowAngle > 160 && this.noseY > this.wristY) {
      this.isReady = true;
    }

    if (!this.isReady) {
      return;
    }

    // Pull-up "Up" position (chin above bar/hands)
    // Arms bent (elbow <= 70), chin at or above hand level
    if (
      this.elbowAngle <= 70 &&
      this.noseY <= this.wristY &&
      !this.up
    ) {
      this.up = true;
      this.down = false;
    }

    // Pull-up "Down" position (return to dead hang)
    // Arms extended (elbow > 160), chin below hands
    if (
      this.up &&
      this.elbowAngle > 160 &&
      this.noseY > this.wristY &&
      !this.down
    ) {
      this.down = true;
      this.successCount += 1;
    }

    // Reset for next rep when arms start to bend again
    if (this.down && this.elbowAngle < 140) {
      this.up = false;
    }
  }

  getAngle() {
    return Number(this.elbowAngle);
  }

  getCaloriePerSec() {
    return PullUpsCounter.MET / 3600 * 1.05;
  }

  getScorePerSec() {
    return 1;
  }
}
