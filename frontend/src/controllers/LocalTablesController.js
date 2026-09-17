import { supabase } from "../supabaseClient";
import Goal from "../models/Goal";
import Intensity from "../models/Intensity";
import Achievement from "../models/Achievement";
import ExerciseType from "../models/ExerciseType";
import MuscleGroup from "../models/MuscleGroup";

const GOAL_TABLE = "goal";
const INTENSITY_TABLE = "intensity";
const ACHIEVEMENT_TABLE = "achievement";
const MUSCLE_GROUP_TABLE = "muscle_group";
const TYPE_TABLE = "type";

const handleSupabaseError = (error) => {
  if (error) {
    console.error(error);
    throw error;
  }
};

const maybeSingle = async (fromPromise) => {
  const { data, error } = await fromPromise;
  handleSupabaseError(error);
  return data ?? null;
};

const getAllGoals = async () => {
  try {
    const { data, error } = await supabase
      .from(GOAL_TABLE)
      .select("id, name, description")
      .order("name", { ascending: true });

    handleSupabaseError(error);
    return (data ?? []).map(
      (goal) => new Goal(goal.id, goal.name, goal.description)
    );
  } catch (e) {
    console.error(e);
    throw e;
  }
};
const getGoal = async (goal_id) => {
  try {
    const data = await maybeSingle(
      supabase
        .from(GOAL_TABLE)
        .select("id, name, description")
        .eq("id", goal_id)
        .maybeSingle()
    );

    if (!data) return null;
    return new Goal(data.id, data.name, data.description);
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getAllIntensities = async () => {
  try {
    const { data, error } = await supabase
      .from(INTENSITY_TABLE)
      .select("id, description")
      .order("description", { ascending: true });

    handleSupabaseError(error);
    // Map ERD `description` to our model's `name` field.
    return (data ?? []).map(
      (intensity) => new Intensity(intensity.id, intensity.description)
    );
  } catch (e) {
    console.error(e);
    throw e;
  }
};
const getIntensity = async (intensity_id) => {
  try {
    const data = await maybeSingle(
      supabase
        .from(INTENSITY_TABLE)
        .select("id, description")
        .eq("id", intensity_id)
        .maybeSingle()
    );
    if (!data) return null;
    return new Intensity(data.id, data.description);
  } catch (e) {
    console.error(e);
    throw e;
  }
};
const getAllAchievements = async () => {
  try {
    const { data, error } = await supabase
      .from(ACHIEVEMENT_TABLE)
      .select("id, name, description")
      .order("name", { ascending: true });

    handleSupabaseError(error);
    return (data ?? []).map(
      (achievement) =>
        new Achievement(
          achievement.id,
          achievement.name,
          achievement.description,
          null
        )
    );
  } catch (e) {
    console.error(e);
    throw e;
  }
};
const getAchievement = async (achievement_id) => {
  try {
    const data = await maybeSingle(
      supabase
        .from(ACHIEVEMENT_TABLE)
        .select("id, name, description")
        .eq("id", achievement_id)
        .maybeSingle()
    );
    if (!data) return null;
    return new Achievement(
      data.id,
      data.name,
      data.description,
      null
    );
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getAllExerciseTypes = async () => {
  try {
    const { data, error } = await supabase
      .from(TYPE_TABLE)
      .select("type_id, name")
      .order("name", { ascending: true });

    handleSupabaseError(error);
    // Map ERD Type(type_id) to our ExerciseType model's id.
    return (data ?? []).map(
      (type) => new ExerciseType(type.type_id, type.name)
    );
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getExerciseType = async (type_id) => {
  try {
    const data = await maybeSingle(
      supabase
        .from(TYPE_TABLE)
        .select("type_id, name")
        .eq("type_id", type_id)
        .maybeSingle()
    );
    if (!data) return null;
    return new ExerciseType(data.type_id, data.name);
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getAllMuscleGroups = async () => {
  try {
    const { data, error } = await supabase
      .from(MUSCLE_GROUP_TABLE)
      .select("id, name")
      .order("name", { ascending: true });

    handleSupabaseError(error);
    return (data ?? []).map(
      (muscleGroup) => new MuscleGroup(muscleGroup.id, muscleGroup.name)
    );
  } catch (e) {
    console.error(e);
    throw e;
  }
};
const getMuscleGroup = async (muscle_group_id) => {
  try {
    const data = await maybeSingle(
      supabase
        .from(MUSCLE_GROUP_TABLE)
        .select("id, name")
        .eq("id", muscle_group_id)
        .maybeSingle()
    );
    if (!data) return null;
    return new MuscleGroup(data.id, data.name);
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export {
  getAllGoals,
  getGoal,
  getAllIntensities,
  getIntensity,
  getAllAchievements,
  getAchievement,
  getAllExerciseTypes,
  getExerciseType,
  getAllMuscleGroups,
  getMuscleGroup,
};
