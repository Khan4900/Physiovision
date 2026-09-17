import { BaseCounter } from "./baseCounter";
import { 
  calculatePoseSimilarity, 
  cosineDistanceMatching, 
  getPoseVector,
  evaluateYogaPose 
} from "./yogaPoseSimilarity";

/**
 * Yoga Counter class that evaluates poses using cosine similarity
 * Extends BaseCounter to maintain consistency with other exercise counters
 */
export class YogaCounter extends BaseCounter {
  constructor(poseName = 'tadasana', holdDuration = 5000) {
    super();
    this.poseName = poseName;
    this.holdDuration = holdDuration; // Duration to hold pose in milliseconds
    this.currentHoldStart = null;
    this.isHoldingPose = false;
    this.lastSimilarity = 0;
    this.similarityThreshold = 0.7; // Minimum similarity to consider pose held
    this.excellentThreshold = 0.9; // Threshold for excellent form
    this.goodThreshold = 0.8; // Threshold for good form
    this.fairThreshold = 0.7; // Threshold for fair form
    
    // Pose-specific settings
    this.poseSettings = {
      'tadasana': { holdDuration: 60000, similarityThreshold: 0.965 },
      'warrior-i': { holdDuration: 60000, similarityThreshold: 0.9 },
      'warrior-ii': { holdDuration: 60000, similarityThreshold: 0.9 },
      'tree-pose': { holdDuration: 60000, similarityThreshold: 0.85 },
      'chair-pose': { holdDuration: 60000, similarityThreshold: 0.9 },
      'eagle': { holdDuration: 60000, similarityThreshold: 0.9 },
      'garland': { holdDuration: 60000, similarityThreshold: 0.9 },
      'half-moon': { holdDuration: 60000, similarityThreshold: 0.9 },
      'bigtoe-pose': { holdDuration: 60000, similarityThreshold: 0.9 },
      'gate': { holdDuration: 60000, similarityThreshold: 0.8 },
      'parivrtta-trikonasana': { holdDuration: 60000, similarityThreshold: 0.9 },
      'vrksasana': { holdDuration: 20000, similarityThreshold: 0.9 },
      'dance': { holdDuration: 60000, similarityThreshold: 0.9 }
    };

    // Apply pose-specific settings if available
    if (this.poseSettings[poseName]) {
      const settings = this.poseSettings[poseName];
      this.holdDuration = settings.holdDuration;
      this.similarityThreshold = settings.similarityThreshold;
    }
  }

  /**
   * Process pose landmarks and evaluate similarity
   * @param {Array} landmarks - MediaPipe landmarks
   * @returns {Object} Result with count, alert, calorie, and score
   */
  _processSpecificPose(landmarks) {
    if (!landmarks || landmarks.length === 0) {
      return { count: this.successCount, alert: "No pose detected", calorie: 0, score: 0 };
    }

    // Evaluate pose similarity
    const evaluation = evaluateYogaPose(landmarks, this.poseName);
    this.lastSimilarity = evaluation.similarity;

    // Determine if user is holding the pose correctly
    const isCorrectPose = evaluation.similarity >= this.similarityThreshold;
    
    if (isCorrectPose) {
      if (!this.isHoldingPose) {
        // Start holding the pose
        this.isHoldingPose = true;
        this.currentHoldStart = Date.now();
        this.alert = `Hold the ${evaluation.poseName} pose!`;
      } else {
        // Continue holding - check if duration is met
        const holdTime = Date.now() - this.currentHoldStart;
        const progressPercent = Math.min(100, (holdTime / this.holdDuration) * 100);
        
        this.alert = `${evaluation.feedback}`;    //(${Math.round(progressPercent)}%)
        
        // Check if hold duration is completed
        if (holdTime >= this.holdDuration) {
          // Successfully completed the pose hold
          this.successCount++;
          this.isHoldingPose = false;
          this.currentHoldStart = null;
          this.alert = `Excellent! ${evaluation.poseName} completed!`;
          return { 
            count: this.successCount, 
            alert: this.alert, 
            calorie: this.getCaloriePerSec() * (this.holdDuration / 1000), 
            score: this.getScorePerSec() * (this.holdDuration / 1000)
          };
        }
      }
    } else {
      // Not holding correct pose
      if (this.isHoldingPose) {
        // Lost the pose
        this.isHoldingPose = false;
        this.currentHoldStart = null;
        this.alert = `Hold lost! ${evaluation.feedback}`;
      } else {
        this.lastSimilarity = 0
        this.alert = evaluation.feedback;
      }
    }

    return { 
      count: this.successCount, 
      alert: this.alert, 
      calorie: this.getCaloriePerSec(), 
      score: this.getScorePerSec() 
    };
  }

  /**
   * Validate custom conditions for yoga poses
   * @param {Array} landmarks - MediaPipe landmarks
   * @returns {boolean} Whether the pose is valid for evaluation
   */
  _validateCustomConditions(landmarks) {
    // Basic validation - ensure key landmarks are visible
    const nose = landmarks[0]; // NOSE
    const leftShoulder = landmarks[11]; // LEFT_SHOULDER
    const rightShoulder = landmarks[12]; // RIGHT_SHOULDER
    const leftHip = landmarks[23]; // LEFT_HIP
    const rightHip = landmarks[24]; // RIGHT_HIP

    // Check if essential landmarks are present and visible
    const essentialLandmarks = [nose, leftShoulder, rightShoulder, leftHip, rightHip];
    
    for (const landmark of essentialLandmarks) {
      if (!landmark || landmark.x < 0 || landmark.x > 1 || landmark.y < 0 || landmark.y > 1) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get current pose similarity score (0-1)
   * @returns {number} Current similarity score
   */
  getCurrentSimilarity() {
    return this.lastSimilarity;
  }

  /**
   * Get current pose evaluation
   * @param {Array} landmarks - Current landmarks
   * @returns {Object} Current pose evaluation
   */
  getCurrentEvaluation(landmarks) {
    return evaluateYogaPose(landmarks, this.poseName);
  }

  /**
   * Get hold progress percentage
   * @returns {number} Hold progress (0-100)
   */
  getHoldProgress() {
    if (!this.isHoldingPose || !this.currentHoldStart) {
      return 0;
    }
    const holdTime = Date.now() - this.currentHoldStart;
    return Math.min(100, (holdTime / this.holdDuration) * 100);
  }

  /**
   * Get calories burned per second for yoga
   * @returns {number} Calories per second
   */
  getCaloriePerSec() {
    // Yoga burns approximately 3-6 calories per minute depending on intensity
    // This is a moderate yoga pace
    return 0.05; // ~3 calories per minute
  }

  /**
   * Get score per second based on pose quality
   * @returns {number} Score per second
   */
  getScorePerSec() {
    // Score based on pose similarity
    if (this.lastSimilarity >= this.excellentThreshold) {
      return 3; // Excellent form
    } else if (this.lastSimilarity >= this.goodThreshold) {
      return 2; // Good form
    } else if (this.lastSimilarity >= this.fairThreshold) {
      return 1; // Fair form
    } else {
      return 0; // Poor form
    }
  }

  /**
   * Get angle for pose alignment (placeholder for future use)
   * @returns {number} Angle measurement
   */
  getAngle() {
    // For yoga poses, we might want to measure specific angles
    // This is a placeholder that could be expanded for specific poses
    return 0;
  }

  /**
   * Reset counter state
   */
  resetCount() {
    super.resetCount();
    this.isHoldingPose = false;
    this.currentHoldStart = null;
    this.lastSimilarity = 0;
  }

  /**
   * Set pose name and update settings
   * @param {string} poseName - Name of the yoga pose
   */
  setPoseName(poseName) {
    this.poseName = poseName;
    
    // Apply pose-specific settings
    if (this.poseSettings[poseName]) {
      const settings = this.poseSettings[poseName];
      this.holdDuration = settings.holdDuration;
      this.similarityThreshold = settings.similarityThreshold;
    }
    
    // Reset state when changing poses
    this.resetCount();
  }

  /**
   * Get pose-specific instructions
   * @returns {string} Instructions for the current pose
   */
  getPoseInstructions() {
    const instructions = {
      'tadasana': 'Stand tall with feet together, arms at sides. Engage your core and breathe deeply.',
      'warrior-i': 'Step one foot forward, bend the front knee, raise arms overhead. Keep back leg straight.',
      'warrior-ii': 'Stand with feet wide apart, turn one foot out, bend the front knee, extend arms horizontally.',
      'tree-pose': 'Stand on one leg, place the other foot on inner thigh, bring hands to prayer position.',
      'chair-pose': 'Stand with feet together, bend knees as if sitting in a chair, raise arms overhead.',
      'eagle': 'Wrap one leg around the other, cross arms, and try to bring palms together.',
      'garland': 'Squat down with feet hip-width apart, bring arms together in front of chest.',
      'half-moon': 'Stand on one leg, extend the other leg back, reach one arm up and one arm down.',
      'bigtoe-pose': 'Stand with feet together, fold forward and grab big toes with fingers.',
      'gate': 'Kneel on one knee, extend the other leg to the side, reach one arm up and one arm down.',
      'parivrtta-trikonasana': 'Stand with feet wide apart, twist torso and reach one hand down, one hand up.',
      'vrksasana': 'Stand on one leg, place other foot on inner thigh, bring hands to prayer position.',
      'dance': 'Stand on one leg, grab the other foot behind you, reach the other arm forward.'
    };
    
    return instructions[this.poseName] || 'Hold the pose steadily and breathe deeply.';
  }
}
