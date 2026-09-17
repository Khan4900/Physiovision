export default class UserProgress {
  /**
   *
   * @param {*} level
   * @param {*} level_progress
   * @param {*} streak
   * @param {*} highest_streak
   * @param {*} reached_goals
   * @param {*} highest_score
   */
  constructor(
    level,
    level_progress,
    streak,
    highest_streak,
    reached_goals = 0,
    highest_score = 0
  ) {
    this.level = level;
    this.level_progress = level_progress;
    this.streak = streak;
    this.highest_streak = highest_streak;
    this.reached_goals = reached_goals;
    this.highest_score = highest_score;
  }
}
