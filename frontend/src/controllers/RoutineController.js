import { supabase } from "../supabaseClient";
import Routine from "../models/Routine";
import Exercise from "../models/Exercise";
import RoutineHistory from "../models/RoutineHistory";
import { getExercise } from "./ExerciseController";
import Goal from "../models/Goal";

const ROUTINE_TABLE = "routine";
const PROGRAM_ROUTINE_TABLE = "program_routine";
const ROUTINE_EXERCISE_TABLE = "routine_exercise";
const ROUTINE_HISTORY_TABLE = "routine_history";
const ROUTINE_GOAL_TABLE = "routine_goal";

const handleSupabaseError = (error) => {
  if (error) {
    console.error(error);
    throw error;
  }
};

const mapRoutineRowToModel = (data) =>
  new Routine(
    data.id,
    data.duration,
    null,
    data.name,
    data.description,
    data.estimated_calories,
    null,
    false,
    null,
    null,
    [],
    [],
    0,
    0
  );

const getRoutine = async (routine_id) => {
  try {
    const { data, error } = await supabase
      .from(ROUTINE_TABLE)
      .select("*")
      .eq("id", routine_id)
      .maybeSingle();
    handleSupabaseError(error);
    if (!data) return null;
    return mapRoutineRowToModel(data);
  } catch (e) {
    console.error(e);
    throw e;
  }
};
const getRoutinesFromProgram = async (program_id, getExercises = true) => {
  try {
    const { data, error } = await supabase
      .from(PROGRAM_ROUTINE_TABLE)
      .select("*")
      .eq("program_id", program_id)
      .order("scheduled_date", { ascending: true });
    handleSupabaseError(error);

    let routines = [];
    if (data?.length) {
      for (const item of data) {
        const routine = await getRoutine(item.routine_id);
        if (!routine) continue;
        routine.program_id = item.program_id ?? routine.program_id;
        routine.scheduled_date = item.scheduled_date ?? routine.scheduled_date;
        routine.completed = item.completed ?? routine.completed;
        routines.push(routine);
      }
    }

    if (getExercises && routines.length > 0) {
      for (const routine of routines) {
        const routineExercises = await getExercisesFromRoutine(routine.id);
        routineExercises.forEach((exercise) => routine.addExercise(exercise));
      }
    }
    return routines;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getUserCompletedRoutines = async (user_id) => {
  try {
    const { data, error } = await supabase
      .from(ROUTINE_HISTORY_TABLE)
      .select("*")
      .eq("user_id", user_id)
      .order("completed_at", { ascending: false });
    handleSupabaseError(error);
    if (!data?.length) return [];

    const routines = [];
    for (const entry of data) {
      const routine = await getRoutine(entry.routine_id);
      if (!routine) continue;
      routines.push(
        new Routine(
          routine.id,
          routine.duration,
          routine.program_id,
          routine.name,
          routine.description,
          routine.estimated_calories,
          routine.scheduled_date,
          routine.completed,
          entry.completed_at ?? routine.completed_at,
          entry.recording_url ?? routine.recording_url,
          undefined,
          undefined,
          entry.calories ?? routine.burned_calories,
          entry.score ?? routine.score
        )
      );
    }
    return routines;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getAllPresetRoutines = async () => {
  try {
    const { data, error } = await supabase
      .from(ROUTINE_TABLE)
      .select("*")
      .eq("preset", true)
      .order("name", { ascending: true });
    handleSupabaseError(error);

    const routines = (data ?? []).map(mapRoutineRowToModel);

    if (routines.length > 0) {
      for (const routine of routines) {
        const routineExercises = await getExercisesFromRoutine(routine.id);
        routine.exercises = routineExercises;
        const routineGoals = await getRoutineGoals(routine.id);
        routine.goals = routineGoals;
      }
    }
    return routines;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

/**
 * 
 * @param {Obj} routineObj - Expected properties of this object:
 *    id,
      program_id,
      name,
      description,
      duration,
      preset,
      estimated_calories,
      scheduled_date,
      completed,
 * @returns 
 */
const createRoutine = async (routineObj) => {
  try {
    const payload = {
      id: routineObj.id,
      duration: routineObj.duration,
      name: routineObj.name,
      description: routineObj.description,
      estimated_calories: routineObj.estimated_calories,
      preset: routineObj.preset ?? false,
    };
    const { data, error } = await supabase
      .from(ROUTINE_TABLE)
      .insert(payload)
      .select()
      .single();
    handleSupabaseError(error);
    return mapRoutineRowToModel(data);
  } catch (e) {
    console.error(e);
    throw e;
  }
};

/**
 * Returns the an array of Exercise objects that has the info from RoutineExercise and Exercise tables combined
 * @param {UUID} routine_id
 */
const getExercisesFromRoutine = async (routine_id) => {
  try {
    const { data, error } = await supabase
      .from(ROUTINE_EXERCISE_TABLE)
      .select("exercise_id, routine_id, order, sets, reps, duration, rest_period")
      .eq("routine_id", routine_id)
      .order("order", { ascending: true });
    handleSupabaseError(error);

    const routineExercises = (data ?? []).map(
      (exercise) =>
        new Exercise(
          exercise.exercise_id,
          exercise.routine_id,
          undefined,
          undefined,
          exercise.order,
          exercise.sets,
          exercise.reps,
          exercise.duration,
          exercise.rest_period,
          undefined,
          undefined
        )
    );

    for (const exercise of routineExercises) {
      try {
        const detailedExercise = await getExercise(exercise.id);
        if (detailedExercise) {
          exercise.name = detailedExercise.name;
          exercise.description = detailedExercise.description;
          exercise.demo_url = detailedExercise.demo_url;
          exercise.video_tutorial_url = detailedExercise.video_tutorial_url;
          exercise.types = detailedExercise.types;
          exercise.muscleGroups = detailedExercise.muscleGroups;
          exercise.goals = detailedExercise.goals;
          exercise.execution_steps = detailedExercise.execution_steps;
        }
      } catch (detailError) {
        console.warn("Unable to load detailed exercise info", detailError);
      }
    }
    return routineExercises;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const createRoutineExercise = async (exerciseObj) => {
  try {
    const routineExercise = {
      exercise_id: exerciseObj.exercise_id,
      routine_id: exerciseObj.routine_id,
      order: exerciseObj.order,
      sets: exerciseObj.sets,
      reps: exerciseObj.reps,
      duration: exerciseObj.duration ?? 0,
      rest_period: exerciseObj.rest_time ?? exerciseObj.rest_period ?? exerciseObj.restPeriod ?? 0,
    };
    const { data, error } = await supabase
      .from(ROUTINE_EXERCISE_TABLE)
      .insert(routineExercise)
      .select()
      .single();
    handleSupabaseError(error);
    return { status: 201, data };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getRoutineHistory = async (user_id) => {
  try {
    const { data, error } = await supabase
      .from(ROUTINE_HISTORY_TABLE)
      .select("*")
      .eq("user_id", user_id)
      .order("completed_at", { ascending: false });
    handleSupabaseError(error);

    return (data ?? []).map(
      (routineHistory) =>
        new RoutineHistory(
          routineHistory.user_id,
          routineHistory.routine_id,
          routineHistory.completed_at,
          routineHistory.recording_url,
          routineHistory.score,
          routineHistory.calories
        )
    );
  } catch (e) {
    console.error(e);
    throw e;
  }
};
const getRoutineGoals = async (routine_id) => {
  try {
    const { data, error } = await supabase
      .from(ROUTINE_GOAL_TABLE)
      .select("goal_id")
      .eq("routine_id", routine_id);
    handleSupabaseError(error);
    return (data ?? []).map((goal) => new Goal(goal.goal_id));
  } catch (e) {
    console.error(e);
    throw e;
  }
};
export {
  getRoutine,
  getRoutinesFromProgram,
  getUserCompletedRoutines,
  getAllPresetRoutines,
  createRoutine,
  createRoutineExercise,
  getExercisesFromRoutine,
  getRoutineHistory,
};
