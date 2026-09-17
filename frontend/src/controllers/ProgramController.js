import { supabase } from "../supabaseClient";
import { Program } from "../models/Program";
import { getRoutinesFromProgram } from "./RoutineController";

const PROGRAM_TABLE = "program";
const PROGRAM_ROUTINE_TABLE = "program_routine";

const handleSupabaseError = (error) => {
  if (error) {
    console.error(error);
    throw error;
  }
};

const mapProgramRowToModel = (row) =>
  new Program(
    row.id,
    row.creation_date ?? row.created_at,
    row.completed_at,
    row.duration,
    row.user_id,
    row.name,
    row.description
  );

const getProgram = async (
  id,
  getRoutines = true,
  getRoutineExercises = true
) => {
  try {
    const { data, error } = await supabase
      .from(PROGRAM_TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle();
    handleSupabaseError(error);
    if (!data) return null;

    const program = mapProgramRowToModel(data);
    if (getRoutines) {
      const programRoutines = await getRoutinesFromProgram(
        program.id,
        getRoutineExercises
      );
      programRoutines?.forEach((routine) => program.addRoutine(routine));
    }
    return program;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
const getAllUserPrograms = async (
  user_id,
  getRoutines = true,
  getRoutineExercises = true
) => {
  try {
    if (!user_id) throw new Error("user id is null");
    const { data, error } = await supabase
      .from(PROGRAM_TABLE)
      .select("*")
      .eq("user_id", user_id)
      .order("creation_date", { ascending: false });
    handleSupabaseError(error);

    const programs = (data ?? []).map(mapProgramRowToModel);
    if (getRoutines) {
      for (const program of programs) {
        const programRoutines = await getRoutinesFromProgram(
          program.id,
          getRoutineExercises
        );
        if (programRoutines?.length) {
          programRoutines.forEach((routine) => program.addRoutine(routine));
        }
      }
    }

    return programs;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
const getUserCompletedPrograms = async (
  user_id,
  getRoutines = true,
  getRoutineExercises = true
) => {
  try {
    if (!user_id) throw new Error("user id is null");
    const { data, error } = await supabase
      .from(PROGRAM_TABLE)
      .select("*")
      .eq("user_id", user_id)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false });
    handleSupabaseError(error);

    const programs = (data ?? []).map(mapProgramRowToModel);
    if (getRoutines) {
      if (programs.length > 0) {
        for (const program of programs) {
          const programRoutines = await getRoutinesFromProgram(
            program.id,
            getRoutineExercises
          );
          if (programRoutines?.length) {
            programRoutines.forEach((routine) => program.addRoutine(routine));
          }
        }
      }
    }

    return programs;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const createProgram = async (user_id, generatedProgramObj) => {
  try {
    if (!user_id) throw new Error("User ID is null");
    const payload = {
      id: generatedProgramObj?.id ?? undefined,
      user_id,
      duration: generatedProgramObj.duration,
      name: generatedProgramObj.name,
      description: generatedProgramObj.description,
      goal_id: generatedProgramObj.goal_id ?? null,
    };
    const { data, error } = await supabase
      .from(PROGRAM_TABLE)
      .insert(payload)
      .select()
      .single();
    handleSupabaseError(error);
    return { status: 201, data };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const createProgramRoutine = async (
  program_id,
  routine_id,
  scheduled_date,
  completed
) => {
  try {
    const programRoutine = {
      program_id,
      routine_id,
      scheduled_date,
      completed,
    };
    const { data, error } = await supabase
      .from(PROGRAM_ROUTINE_TABLE)
      // Allow the same routine to be scheduled multiple times within a program (e.g., week 1 + week 2)
      // while still preventing duplicate rows for the same day.
      .upsert(programRoutine, { onConflict: "program_id,scheduled_date" })
      .select()
      .single();
    handleSupabaseError(error);
    return { status: 201, data };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export {
  getProgram,
  getAllUserPrograms,
  getUserCompletedPrograms,
  createProgram,
  createProgramRoutine,
};
