import { landmarkNames } from "./landmarkNames";
import { BaseCounter } from "./baseCounter";
import { calculateAngle } from "../utils";

export class PlankCounter extends BaseCounter {
  constructor() {
    super();

    this.alertThreshold = 60;

    this.leftBodyAngle = null;
    this.rightBodyAngle = null;
    this.leftElbowAngle = null;
    this.rightElbowAngle = null;

    this._holding = false;
    this._holdRemainderMs = 0;
    this._lastTs = null;
  }

  // Approx MET for plank/isometric core work
  static MET = 3.8;

  _processSpecificPose(landmarks) {
    const leftShoulder = landmarks[landmarkNames.LEFT_SHOULDER];
    const leftElbow = landmarks[landmarkNames.LEFT_ELBOW];
    const leftWrist = landmarks[landmarkNames.LEFT_WRIST];
    const leftHip = landmarks[landmarkNames.LEFT_HIP];
    const leftAnkle = landmarks[landmarkNames.LEFT_ANKLE];

    const rightShoulder = landmarks[landmarkNames.RIGHT_SHOULDER];
    const rightElbow = landmarks[landmarkNames.RIGHT_ELBOW];
    const rightWrist = landmarks[landmarkNames.RIGHT_WRIST];
    const rightHip = landmarks[landmarkNames.RIGHT_HIP];
    const rightAnkle = landmarks[landmarkNames.RIGHT_ANKLE];

    // Angles
    this.leftBodyAngle = calculateAngle(leftShoulder, leftHip, leftAnkle);
    this.rightBodyAngle = calculateAngle(rightShoulder, rightHip, rightAnkle);
    this.leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    this.rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);

    const bodyStraight = this.leftBodyAngle >= 160 && this.rightBodyAngle >= 160;

    // Support both high-plank (straight arms) and forearm-plank (bent elbows)
    const leftArmOk =
      this.leftElbowAngle >= 155 ||
      (this.leftElbowAngle >= 65 && this.leftElbowAngle <= 115);
    const rightArmOk =
      this.rightElbowAngle >= 155 ||
      (this.rightElbowAngle >= 65 && this.rightElbowAngle <= 115);

    // Basic “hands/forearms are down” sanity check (laptop webcams are finicky)
    const armsDown = leftWrist.y >= 0.35 && rightWrist.y >= 0.35;

    const isPlank = bodyStraight && leftArmOk && rightArmOk && armsDown;

    // Alerting (only when sustained bad form)
    if (!bodyStraight) {
      this.alertCount += 1;
      if (this.alertCount >= this.alertThreshold) {
        this.alert = "Keep your body in a straight line from head to heels.";
        this.alertCount = 0;
      } else {
        this.alert = null;
      }
    } else if (!leftArmOk || !rightArmOk) {
      this.alertCount += 1;
      if (this.alertCount >= this.alertThreshold) {
        this.alert = "Keep your shoulders stacked over wrists/elbows.";
        this.alertCount = 0;
      } else {
        this.alert = null;
      }
    } else {
      this.alertCount = 0;
      this.alert = null;
    }

    // Hold-time counting: increment count as “seconds held (total)” while form is valid.
    const now =
      typeof performance !== "undefined" && performance.now
        ? performance.now()
        : Date.now();

    if (isPlank) {
      if (!this._holding) {
        this._holding = true;
        this._lastTs = now;
        this._holdRemainderMs = 0;
      } else {
        const prev = this._lastTs ?? now;
        // Clamp to avoid huge jumps if tab was backgrounded.
        const delta = Math.min(Math.max(now - prev, 0), 250);
        this._lastTs = now;

        this._holdRemainderMs += delta;
        const incSeconds = Math.floor(this._holdRemainderMs / 1000);
        if (incSeconds > 0) {
          this.successCount += incSeconds;
          this._holdRemainderMs -= incSeconds * 1000;
        }
      }
    } else {
      this._holding = false;
      this._lastTs = null;
      this._holdRemainderMs = 0;
    }

    return {
      count: this.successCount,
      alert: this.alert,
      calorie: PlankCounter.MET / 3600 * 1.05,
      score: 1,
    };
  }

  getAngle() {
    const left = Number(this.leftBodyAngle);
    const right = Number(this.rightBodyAngle);
    if (!Number.isFinite(left) && !Number.isFinite(right)) return 0;
    if (!Number.isFinite(left)) return right;
    if (!Number.isFinite(right)) return left;
    return (left + right) / 2;
  }

  getCaloriePerSec() {
    return PlankCounter.MET / 3600 * 1.05;
  }

  getScorePerSec() {
    return 1;
  }

  resetCount() {
    super.resetCount();
    this._holding = false;
    this._lastTs = null;
    this._holdRemainderMs = 0;
  }
}
