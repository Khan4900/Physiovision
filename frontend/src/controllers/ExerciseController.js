import { supabase } from "../supabaseClient";
import Exercise from "../models/Exercise";
import ExerciseType from "../models/ExerciseType";
import Goal from "../models/Goal";
import MuscleGroup from "../models/MuscleGroup";
import {
  getExerciseType,
  getGoal,
  getMuscleGroup,
} from "./LocalTablesController";

const EXERCISE_TABLE = "exercise";
// ERD: associative table between Exercise and Type
const EXERCISE_TYPE_TABLE = "exercise_type";
const EXERCISE_GOAL_TABLE = "exercise_goal";
const EXERCISE_MUSCLE_GROUP_TABLE = "exercise_muscle_group";

const handleSupabaseError = (error) => {
  if (error) {
    console.error(error);
    throw error;
  }
};

const getAllExercises = async (offset, limit) => {
  try {
    const start = Math.max(0, offset ?? 0);
    const computedLimit = limit ?? 20;
    const { data, error } = await supabase
      .from(EXERCISE_TABLE)
      .select("id, name, description, demo_video_url")
      .order("name", { ascending: true })
      .range(start, start + computedLimit - 1);

    handleSupabaseError(error);
    const exercises = (data ?? []).map((item) => {
      const exercise = new Exercise();
      exercise.id = item.id;
      exercise.name = item.name;
      exercise.description = item.description;
      // Map ERD demo_video_url -> model demo_url
      exercise.demo_url = item.demo_video_url;
      exercise.video_tutorial_url = undefined;
      exercise.types = [];
      exercise.goals = [];
      exercise.muscleGroups = [];
      return exercise;
    });

    for (const exercise of exercises) {
      exercise.types = await getExerciseTypes(exercise.id, true);
      exercise.goals = await getExerciseGoals(exercise.id, false);
      exercise.muscleGroups = await getExerciseMuscleGroups(exercise.id, false);
    }
    return exercises;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
const getExercisesCount = async () => {
  const { count, error } = await supabase
    .from(EXERCISE_TABLE)
    .select("id", { count: "exact", head: true });
  handleSupabaseError(error);
  return count ?? 0;
};
const getExercisesThumbnails = async () => {
  const { data, error } = await supabase
    .from(EXERCISE_TABLE)
    .select("id, name, description, demo_video_url")
    .order("name", { ascending: true });
  handleSupabaseError(error);
  return (data ?? []).map((item) => {
    const exercise = new Exercise();
    exercise.id = item.id;
    exercise.name = item.name;
    exercise.description = item.description;
    exercise.demo_url = item.demo_video_url;
    exercise.video_tutorial_url = undefined;
    exercise.types = [];
    exercise.goals = [];
    exercise.muscleGroups = [];
    return exercise;
  });
};
const getExercise = async (id, allInfo = true) => {
  try {
    const { data, error } = await supabase
      .from(EXERCISE_TABLE)
      .select("id, name, description, demo_video_url, score_factor, calories_per_rep")
      .eq("id", id)
      .maybeSingle();
    handleSupabaseError(error);
    if (!data) return null;
    const exercise = new Exercise();
    exercise.id = data.id;
    exercise.name = data.name;
    exercise.description = data.description;
    exercise.demo_url = data.demo_video_url;
    exercise.types = await getExerciseTypes(exercise.id, allInfo);
    exercise.goals = await getExerciseGoals(exercise.id, allInfo);
    exercise.muscleGroups = await getExerciseMuscleGroups(exercise.id, allInfo);
    exercise.video_tutorial_url = undefined;
    exercise.execution_steps = [];
    exercise.score_factor = data.score_factor;
    exercise.calories_per_rep = data.calories_per_rep;
    return exercise;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
const getExerciseTypes = async (id, allInfo = true) => {
  try {
    const { data, error } = await supabase
      .from(EXERCISE_TYPE_TABLE)
      .select("type_id")
      .eq("exercise_id", id);
    handleSupabaseError(error);
    const typeArray = [];

    for (let exerciseType of data ?? []) {
      const type = allInfo
        ? await getExerciseType(exerciseType.type_id)
        : new ExerciseType(exerciseType.type_id);
      if (type) typeArray.push(type);
    }
    return typeArray;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
const getExerciseGoals = async (id, allInfo = true) => {
  try {
    const { data, error } = await supabase
      .from(EXERCISE_GOAL_TABLE)
      .select("goal_id")
      .eq("exercise_id", id);
    handleSupabaseError(error);
    const goalsArray = [];

    for (let exerciseGoal of data ?? []) {
      const goal = allInfo
        ? await getGoal(exerciseGoal.goal_id)
        : new Goal(exerciseGoal.goal_id);
      if (goal) goalsArray.push(goal);
    }
    return goalsArray;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
const getExerciseMuscleGroups = async (id, allInfo = true) => {
  try {
    const { data, error } = await supabase
      .from(EXERCISE_MUSCLE_GROUP_TABLE)
      .select("muscle_group_id")
      .eq("exercise_id", id);
    handleSupabaseError(error);
    const muscleGroupsArray = [];

    for (let item of data ?? []) {
      const muscleGroup = allInfo
        ? await getMuscleGroup(item.muscle_group_id)
        : new MuscleGroup(item.muscle_group_id);
      if (muscleGroup) muscleGroupsArray.push(muscleGroup);
    }
    return muscleGroupsArray;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
export {
  getAllExercises,
  getExercisesCount,
  getExercisesThumbnails,
  getExercise,
  getExerciseTypes,
  getExerciseGoals,
  getExerciseMuscleGroups,
};
