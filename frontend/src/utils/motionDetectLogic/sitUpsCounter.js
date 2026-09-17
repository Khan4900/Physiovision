import { landmarkNames } from "./landmarkNames";
import { BaseCounter } from "./baseCounter";
import { calculateAngle } from "../utils";

export class SitUpsCounter extends BaseCounter {
  constructor() {
    super();
    this.status = false;
    this.direction = 0; // 0 = waiting for up, 1 = waiting for down
    this.hipAngle = 0;
  }

  static MET = 6.0; // Metabolic equivalent of task (MET) for sit ups
  static TIME_PER_REP = 3; // Time taken to complete one sit up rep

  _processSpecificPose(landmarks) {
    const leftShoulder = landmarks[landmarkNames.LEFT_SHOULDER];
    const leftHip = landmarks[landmarkNames.LEFT_HIP];
    const leftKnee = landmarks[landmarkNames.LEFT_KNEE];

    // Calculate hip angle
    this.hipAngle = calculateAngle(leftShoulder, leftHip, leftKnee);

    // Process Alert
    this.#processAlert();

    // Process Count
    this.#processCount();

    return {
      count: this.successCount,
      alert: this.alert,
      calorie: SitUpsCounter.MET * (SitUpsCounter.TIME_PER_REP / 3600) * 1.05,
      score: 1,
    };
  }

  #processAlert() {
    // Alert if user is stuck in middle position
    if (this.hipAngle > 50 && this.hipAngle < 120) {
      this.alertCount += 1;
    } else {
      this.alertCount = 0;
    }

    if (this.alertCount >= this.alertThreshold) {
      this.alert = "Complete the full range of motion. Go all the way up and down.";
      this.alertCount = 0;
    } else {
      this.alert = null;
    }
  }

  #processCount() {
    // Check to ensure right form before starting the program
    if (this.hipAngle > 120) {
      this.status = true;
    }

    // Tracking "Up" movement
    if (this.status) {
      if (this.direction === 0) {
        if (this.hipAngle < 50) {
          this.up = true;
          this.direction = 1;
        }
      }
    }

    // Tracking "Down" movement
    if (this.direction === 1) {
      if (this.hipAngle > 120) {
        this.down = true;
        this.direction = 0;
      }
    }

    // Count rep when full cycle completed
    if (this.up && this.down) {
      this.successCount += 1;
      this.up = false;
      this.down = false;
    }
  }

  getAngle() {
    return Number(this.hipAngle);
  }

  getCaloriePerSec() {
    return SitUpsCounter.MET / 3600 * 1.05;
  }

  getScorePerSec() {
    return 1;
  }

  resetCount() {
    super.resetCount();
    this.status = false;
    this.direction = 0;
    this.up = false;
    this.down = false;
  }
}
