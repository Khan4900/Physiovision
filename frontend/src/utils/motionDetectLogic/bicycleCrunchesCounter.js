import { landmarkNames } from "./landmarkNames";
import { BaseCounter } from "./baseCounter";
import { calculateAngle } from "../utils";

export class BicycleCrunchesCounter extends BaseCounter {
  constructor() {
    super();
    this.leftKneeAngle = null;
    this.rightKneeAngle = null;
    this.isReady = false;
    this.alertThreshold = 80;
    this.side = "right"; // Track which side we're crunching towards
  }

  static MET = 5.0; // Metabolic equivalent of task (MET) for bicycle crunches
  static TIME_PER_REP = 2; // Time taken to complete one bicycle crunch rep

  _validateCustomConditions(landmarks) {
    // Ensure key landmarks are visible for bicycle crunches detection
    const leftHip = landmarks[landmarkNames.LEFT_HIP];
    const leftKnee = landmarks[landmarkNames.LEFT_KNEE];
    const leftAnkle = landmarks[landmarkNames.LEFT_ANKLE];
    const rightHip = landmarks[landmarkNames.RIGHT_HIP];
    const rightKnee = landmarks[landmarkNames.RIGHT_KNEE];
    const rightAnkle = landmarks[landmarkNames.RIGHT_ANKLE];

    // Check if all required landmarks are visible
    const requiredLandmarks = [leftHip, leftKnee, leftAnkle, rightHip, rightKnee, rightAnkle];
    return requiredLandmarks.every(
      (landmark) => landmark && landmark.x >= 0 && landmark.x <= 1 && landmark.y >= 0 && landmark.y <= 1
    );
  }

  _processSpecificPose(landmarks) {
    const leftHip = landmarks[landmarkNames.LEFT_HIP];
    const leftKnee = landmarks[landmarkNames.LEFT_KNEE];
    const leftAnkle = landmarks[landmarkNames.LEFT_ANKLE];

    const rightHip = landmarks[landmarkNames.RIGHT_HIP];
    const rightKnee = landmarks[landmarkNames.RIGHT_KNEE];
    const rightAnkle = landmarks[landmarkNames.RIGHT_ANKLE];

    // Calculate knee angles
    this.leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    this.rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

    // Process Alert
    this.#processAlert();

    // Process Count
    this.#processCount();

    return {
      count: this.successCount,
      alert: this.alert,
      calorie: BicycleCrunchesCounter.MET * (BicycleCrunchesCounter.TIME_PER_REP / 3600) * 1.05,
      score: 1,
    };
  }

  #processAlert() {
    // Check if user is in starting position (one knee bent)
    if (this.leftKneeAngle < 50 || this.rightKneeAngle < 50) {
      this.isReady = true;
      this.alert = null;
    }

    // Alert if neither leg is properly positioned
    if (this.isReady && this.leftKneeAngle > 120 && this.rightKneeAngle > 120) {
      this.alertCount += 1;
    }

    if (this.alertCount >= this.alertThreshold) {
      this.alert = "Bring your knee closer to your chest and twist.";
      this.alertCount = 0;
    }
  }

  #processCount() {
    // Check to ensure right form before starting
    // Starting position: at least one knee bent (angle < 50)
    if (this.leftKneeAngle < 50 || this.rightKneeAngle < 50) {
      this.isReady = true;
    }

    if (!this.isReady) {
      return;
    }

    // Crunch towards one side (one leg extended, other bent)
    // When right knee angle > 160 OR left knee angle > 160 (leg extended)
    if (
      (this.rightKneeAngle > 160 || this.leftKneeAngle > 160) &&
      !this.up
    ) {
      this.up = true;
      this.down = false;
    }

    // Crunch towards other side (switch legs)
    // When one knee is bent again (angle < 50)
    if (
      this.up &&
      (this.rightKneeAngle < 50 || this.leftKneeAngle < 50) &&
      !this.down
    ) {
      this.down = true;
      this.successCount += 1;
    }

    // Reset for next rep when leg extends again
    if (this.down && (this.rightKneeAngle > 120 || this.leftKneeAngle > 120)) {
      this.up = false;
    }
  }

  getAngle() {
    // Return the smaller angle (the bent knee)
    return Math.min(Number(this.leftKneeAngle), Number(this.rightKneeAngle));
  }

  getCaloriePerSec() {
    return BicycleCrunchesCounter.MET / 3600 * 1.05;
  }

  getScorePerSec() {
    return 1;
  }
}
