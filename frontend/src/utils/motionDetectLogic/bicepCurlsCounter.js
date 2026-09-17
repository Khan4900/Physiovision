import { landmarkNames } from "./landmarkNames";
import { BaseCounter } from "./baseCounter";

export class BicepCurlsCounter extends BaseCounter {
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

  static MET = 3.5; // Metabolic equivalent of task (MET) for bicep curls
  static TIME_PER_REP = 4; // Time taken to complete one bicep curl rep

  _processSpecificPose(landmarks) {
    const rightShoulder = landmarks[landmarkNames.RIGHT_SHOULDER];
    const rightElbow = landmarks[landmarkNames.RIGHT_ELBOW];
    const rightWrist = landmarks[landmarkNames.RIGHT_WRIST];
    const leftShoulder = landmarks[landmarkNames.LEFT_SHOULDER];
    const leftElbow = landmarks[landmarkNames.LEFT_ELBOW];
    const leftWrist = landmarks[landmarkNames.LEFT_WRIST];

    // Calculate left arm angle (using right landmarks as per original code)
    const leftVector1 = [
      rightElbow.x - rightShoulder.x,
      rightElbow.y - rightShoulder.y,
    ];
    const leftVector2 = [
      rightElbow.x - rightWrist.x,
      rightElbow.y - rightWrist.y,
    ];

    // Calculate right arm angle (using left landmarks as per original code)
    const rightVector1 = [
      leftElbow.x - leftShoulder.x,
      leftElbow.y - leftShoulder.y,
    ];
    const rightVector2 = [
      leftElbow.x - leftWrist.x,
      leftElbow.y - leftWrist.y,
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
      calorie: BicepCurlsCounter.MET * (BicepCurlsCounter.TIME_PER_REP / 3600) * 1.05,
      score: 1,
    };
  }

  #processAlert() {
    // Alert if arms are not moving through full range of motion
    if (this.leftAngle > 25 && this.leftAngle < 130 && this.rightAngle > 25 && this.rightAngle < 130) {
      this.alertCount += 1;
    } else {
      this.alertCount = 0;
    }

    if (this.alertCount >= this.alertThreshold) {
      this.alert = "Complete the full range of motion. Curl all the way up and extend fully.";
      this.alertCount = 0;
    } else {
      this.alert = null;
    }
  }

  #processCount() {
    // Track left arm position
    if (this.leftAngle <= 25) {
      this.leftDown = true;
    } else if (this.leftAngle >= 130) {
      this.leftUp = true;
    }

    // Track right arm position
    if (this.rightAngle <= 25) {
      this.rightDown = true;
    } else if (this.rightAngle >= 130) {
      this.rightUp = true;
    }

    // Count rep when both arms complete full range of motion
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
    return BicepCurlsCounter.MET / 3600 * 1.05;
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
