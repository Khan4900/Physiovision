import { landmarkNames } from "./landmarkNames";
import { BaseCounter } from "./baseCounter";

export class LungesCounter extends BaseCounter {
  constructor() {
    super();
    this.leftUp = false;
    this.leftDown = false;
    this.rightUp = false;
    this.rightDown = false;
    this.leftCounter = 0;
    this.rightCounter = 0;
    this.leftMaxAngle = 10;
    this.rightMaxAngle = 10;
    this.leftAngle = 0;
    this.rightAngle = 0;
  }

  static MET = 5.0; // Metabolic equivalent of task (MET) for lunges
  static TIME_PER_REP = 4; // Time taken to complete one lunge rep

  _processSpecificPose(landmarks) {
    const rightHip = landmarks[landmarkNames.RIGHT_HIP];
    const rightKnee = landmarks[landmarkNames.RIGHT_KNEE];
    const rightAnkle = landmarks[landmarkNames.RIGHT_ANKLE];
    const leftHip = landmarks[landmarkNames.LEFT_HIP];
    const leftKnee = landmarks[landmarkNames.LEFT_KNEE];
    const leftAnkle = landmarks[landmarkNames.LEFT_ANKLE];

    // Calculate left knee angle (using right landmarks as per original code)
    const leftVector1 = [
      rightKnee.x - rightHip.x,
      rightKnee.y - rightHip.y,
    ];
    const leftVector2 = [
      rightKnee.x - rightAnkle.x,
      rightKnee.y - rightAnkle.y,
    ];

    // Calculate right knee angle (using left landmarks as per original code)
    const rightVector1 = [
      leftKnee.x - leftHip.x,
      leftKnee.y - leftHip.y,
    ];
    const rightVector2 = [
      leftKnee.x - leftAnkle.x,
      leftKnee.y - leftAnkle.y,
    ];

    // Calculate left angle
    const leftDot = leftVector1[0] * leftVector2[0] + leftVector1[1] * leftVector2[1];
    const leftMod_a = Math.sqrt(leftVector1[0] * leftVector1[0] + leftVector1[1] * leftVector1[1]);
    const leftMod_b = Math.sqrt(leftVector2[0] * leftVector2[0] + leftVector2[1] * leftVector2[1]);
    this.leftAngle = parseFloat(((Math.acos(leftDot / (leftMod_a * leftMod_b)) * 180) / Math.PI).toFixed(2));
    this.leftMaxAngle = Math.max(this.leftMaxAngle, this.leftAngle);

    // Calculate right angle
    const rightDot = rightVector1[0] * rightVector2[0] + rightVector1[1] * rightVector2[1];
    const rightMod_a = Math.sqrt(rightVector1[0] * rightVector1[0] + rightVector1[1] * rightVector1[1]);
    const rightMod_b = Math.sqrt(rightVector2[0] * rightVector2[0] + rightVector2[1] * rightVector2[1]);
    this.rightAngle = parseFloat(((Math.acos(rightDot / (rightMod_a * rightMod_b)) * 180) / Math.PI).toFixed(2));
    this.rightMaxAngle = Math.max(this.rightMaxAngle, this.rightAngle);

    // Process Alert
    this.#processAlert();

    // Process Count
    this.#processCount();

    return {
      count: this.successCount,
      alert: this.alert,
      calorie: LungesCounter.MET * (LungesCounter.TIME_PER_REP / 3600) * 1.05,
      score: 1,
    };
  }

  #processAlert() {
    // Alert if knees are not bending enough
    if (this.leftAngle > 95 && this.leftAngle < 140 && this.rightAngle > 95 && this.rightAngle < 140) {
      this.alertCount += 1;
    } else {
      this.alertCount = 0;
    }

    if (this.alertCount >= this.alertThreshold) {
      this.alert = "Bend your knee deeper. Go lower for a proper lunge.";
      this.alertCount = 0;
    } else {
      this.alert = null;
    }
  }

  #processCount() {
    // Track left knee position
    if (this.leftAngle <= 95) {
      this.leftDown = true;
    } else if (this.leftAngle >= 140) {
      this.leftUp = true;
    }

    // Track right knee position
    if (this.rightAngle <= 95) {
      this.rightDown = true;
    } else if (this.rightAngle >= 140) {
      this.rightUp = true;
    }

    // Count rep when both legs complete full range of motion
    if (this.leftUp && this.leftDown && this.rightUp && this.rightDown) {
      if (this.leftUp && this.leftDown) {
        this.leftCounter += 1;
        this.leftUp = false;
        this.leftDown = false;
      }
      if (this.rightUp && this.rightDown) {
        this.rightCounter += 1;
        this.rightUp = false;
        this.rightDown = false;
      }
      if ((this.leftCounter + this.rightCounter) % 4 === 0) {
        this.successCount = (this.leftCounter + this.rightCounter) / 4;
        this.leftMaxAngle = 10;
        this.rightMaxAngle = 10;
      }
    }
  }

  getAngle() {
    return Number(this.leftAngle);
  }

  getCaloriePerSec() {
    return LungesCounter.MET / 3600 * 1.05;
  }

  getScorePerSec() {
    return 1;
  }

  resetCount() {
    super.resetCount();
    this.leftUp = false;
    this.leftDown = false;
    this.rightUp = false;
    this.rightDown = false;
    this.leftCounter = 0;
    this.rightCounter = 0;
    this.leftMaxAngle = 10;
    this.rightMaxAngle = 10;
  }
}
