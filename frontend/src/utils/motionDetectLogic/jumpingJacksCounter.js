import { landmarkNames } from "./landmarkNames";
import { BaseCounter } from "./baseCounter";

export class JumpingJacksCounter extends BaseCounter {
  constructor() {
    super();
    this.alertThreshold = 180;
  }

  static MET = 14.0; // Metabolic equivalent of task (MET) for jumpingjacks

  _processSpecificPose(landmarks) {
    const leftShoulder = landmarks[landmarkNames.LEFT_SHOULDER];
    const rightShoulder = landmarks[landmarkNames.RIGHT_SHOULDER];
    const leftHand = landmarks[landmarkNames.LEFT_WRIST];
    const rightHand = landmarks[landmarkNames.RIGHT_WRIST];

    // Process Alert
    this.#processAlert(leftShoulder, rightShoulder, leftHand, rightHand);

    // Process Count
    this.#processCount(leftShoulder, rightShoulder, leftHand, rightHand);

    return { 
      count: this.successCount, 
      alert: this.alert,
      calorie: JumpingJacksCounter.MET / 3600 * 1.05,
      score: 1,
    };
  }

  #processAlert(leftShoulder, rightShoulder, leftHand, rightHand) {
    const handsUp = leftHand.y < leftShoulder.y && rightHand.y < rightShoulder.y;
    const handsDown = leftHand.y > leftShoulder.y && rightHand.y > rightShoulder.y;

    // Encourage consistency when hands stay down too long
    if (handsDown) {
      this.alertCount += 1;
    } else if (handsUp) {
      this.alertCount = 0;
    }

    if (this.alertCount >= this.alertThreshold) {
      this.alert = "Keep it going. Don’t stop.";
      this.alertCount = 0;
    } else {
      this.alert = "";
    }
  }

  #processCount(leftShoulder, rightShoulder, leftHand, rightHand) {
    const handsUp = leftHand.y < leftShoulder.y && rightHand.y < rightShoulder.y;
    const handsDown = leftHand.y > leftShoulder.y && rightHand.y > rightShoulder.y;

    // Up state when both hands above shoulders
    if (handsUp && !this.up) {
      this.up = true;
      this.down = false;
    }

    // Count a rep when returning to down after an up
    if (this.up && handsDown && !this.down) {
      this.down = true;
      this.successCount += 1;
    }

    // Reset up when hands go above shoulders again
    if (this.down && handsUp) {
      this.up = false;
    }
  }

  getAngle() {
    // No angle for jumping jacks used in counting
  }

  getCaloriePerSec() {
    return JumpingJacksCounter.MET / 3600 * 1.05;
  }

  getScorePerSec() {
    return 1;
  }
}
