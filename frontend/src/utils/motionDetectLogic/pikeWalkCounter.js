import { landmarkNames } from "./landmarkNames";
import { BaseCounter } from "./baseCounter";
import { calculateAngle } from "../utils";

export class PikeWalkCounter extends BaseCounter {
  constructor() {
    super();
    this.elbowAngle = null;
    this.shoulderAngle = null;
    this.hipAngle = null;
    this.isReady = false;
    this.alertThreshold = 60;
  }

  static MET = 6.0; // Metabolic equivalent of task (MET) for pike walk
  static TIME_PER_REP = 4; // Time taken to complete one pike walk rep

  _validateCustomConditions(landmarks) {
    // Ensure key landmarks are visible for pike walk detection
    const leftShoulder = landmarks[landmarkNames.LEFT_SHOULDER];
    const leftElbow = landmarks[landmarkNames.LEFT_ELBOW];
    const leftWrist = landmarks[landmarkNames.LEFT_WRIST];
    const leftHip = landmarks[landmarkNames.LEFT_HIP];
    const leftKnee = landmarks[landmarkNames.LEFT_KNEE];

    // Check if all required landmarks are visible
    const requiredLandmarks = [leftShoulder, leftElbow, leftWrist, leftHip, leftKnee];
    return requiredLandmarks.every(
      (landmark) => landmark && landmark.x >= 0 && landmark.x <= 1 && landmark.y >= 0 && landmark.y <= 1
    );
  }

  _processSpecificPose(landmarks) {
    const leftShoulder = landmarks[landmarkNames.LEFT_SHOULDER];
    const leftElbow = landmarks[landmarkNames.LEFT_ELBOW];
    const leftWrist = landmarks[landmarkNames.LEFT_WRIST];
    const leftHip = landmarks[landmarkNames.LEFT_HIP];
    const leftKnee = landmarks[landmarkNames.LEFT_KNEE];

    // Calculate angles
    this.elbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    this.shoulderAngle = calculateAngle(leftElbow, leftShoulder, leftHip);
    this.hipAngle = calculateAngle(leftShoulder, leftHip, leftKnee);

    // Process Alert
    this.#processAlert();

    // Process Count
    this.#processCount();

    return {
      count: this.successCount,
      alert: this.alert,
      calorie: PikeWalkCounter.MET * (PikeWalkCounter.TIME_PER_REP / 3600) * 1.05,
      score: 1,
    };
  }

  #processAlert() {
    // Check if user is in proper starting position (standing with arms straight)
    if (this.elbowAngle > 160 && this.shoulderAngle > 40 && this.hipAngle > 140) {
      this.isReady = true;
      this.alert = null;
    }

    // Alert if elbow is bent during movement
    if (this.isReady && this.elbowAngle < 150) {
      this.alertCount += 1;
    }

    if (this.alertCount >= this.alertThreshold) {
      this.alert = "Keep your arms straight during the movement.";
      this.alertCount = 0;
    }
  }

  #processCount() {
    // Check to ensure right form before starting the program
    // Standing position: elbow straight (>160), shoulder angle (>40), hip extended (>140)
    if (this.elbowAngle > 160 && this.shoulderAngle > 40 && this.hipAngle > 140) {
      this.isReady = true;
    }

    if (!this.isReady) {
      return;
    }

    // Pike Walk "Down" position (hands walked out, hip angle decreases)
    // Arms straight (elbow > 160), shoulder engaged (>40), pike position (hip < 75)
    if (
      this.elbowAngle > 160 &&
      this.shoulderAngle > 40 &&
      this.hipAngle < 75 &&
      !this.down
    ) {
      this.down = true;
      this.up = false;
    }

    // Pike Walk "Up" position (walking back to standing)
    // Arms straight (elbow > 160), shoulder engaged (>40), standing (hip > 140)
    if (
      this.down &&
      this.elbowAngle > 160 &&
      this.shoulderAngle > 40 &&
      this.hipAngle > 140 &&
      !this.up
    ) {
      this.up = true;
      this.successCount += 1;
    }

    // Reset for next rep
    if (this.up && this.hipAngle < 100) {
      this.down = false;
    }
  }

  getAngle() {
    return Number(this.hipAngle);
  }

  getCaloriePerSec() {
    return PikeWalkCounter.MET / 3600 * 1.05;
  }

  getScorePerSec() {
    return 1;
  }
}
