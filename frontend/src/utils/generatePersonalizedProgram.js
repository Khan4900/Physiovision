
import { createProgram, createProgramRoutine, getAllUserPrograms } from "../controllers/ProgramController";
import { createRoutine, createRoutineExercise } from "../controllers/RoutineController";
import { generateProgramObjectFromPrompt } from "./openaiProgramClient";
import { getUser } from "../controllers/UserController";

const isUuid = (value) =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const buildPromptFromUserProfile = (userInfo) => {
  const gender = userInfo?.gender ?? "unspecified";
  const goalName =
    userInfo?.settings?.goal?.name ??
    userInfo?.settings?.goal ??
    "Lose Weight";
  const intensityName =
    userInfo?.settings?.intensity?.name ??
    userInfo?.settings?.intensity ??
    "Moderate";
  const schedule = Array.isArray(userInfo?.schedule) ? userInfo.schedule : [];
  const scheduleText = schedule.length ? schedule.join(", ") : "Monday, Wednesday, Friday";
  const numWorkoutDays = schedule.length || 3;

  const today = new Date();
  const formattedDate = today.toISOString().slice(0, 10);

  return `
You will create a personalized fitness program. Return ONLY valid JSON (no markdown, no backticks, no commentary).

### User Profile
- Gender: ${gender}
- Primary Fitness Goal: ${goalName}
- Preferred Exercise Intensity: ${intensityName}
- Available Workout Days: ${scheduleText}

### CRITICAL REQUIREMENTS

1. Create exactly ${numWorkoutDays} unique routines (one per workout day: ${scheduleText})
2. Each routine must have a unique UUID in the format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (hex only, lowercase)
3. In program_routine, REUSE the same routine_id for the same day across both weeks
4. The routine_id in routine_exercise MUST match one of the routine ids from the routine array

### Output Format

{
  "program": {
    "id": "<uuid>",
    "duration": 14,
    "name": "<string>",
    "description": "<string>",
    "goal_id": 1
  },
  "routine": [
    {
      "id": "<uuid>",
      "name": "<day_name> Workout",
      "description": "<string>",
      "duration": 30,
      "preset": false,
      "estimated_calories": <number>
    }
  ],
  "program_routine": [
    {
      "program_id": "<same as program.id>",
      "routine_id": "<must match a routine.id from above>",
      "scheduled_date": "YYYY-MM-DD",
      "completed": false
    }
  ],
  "routine_exercise": [
    {
      "routine_id": "<must match a routine.id from routine array>",
      "exercise_id": "<uuid from predefined list>",
      "sets": <number>,
      "reps": <number>,
      "order": <number>,
      "rest_time": 30
    }
  ]
}

### Predefined Exercises (use ONLY these exercise_ids)
- 013d2168-a5bb-448d-8a03-7456055a3e68 (Push Ups)
- fb7180ab-f3e2-4a5d-b731-a2c0fc5de9fa (Squats)
- 0cc22f75-7d4d-4d50-9cdd-4ae3c731c517 (Jumping Jacks)
- 7c12ed44-7dac-4b42-90c3-aa9a02dd251d (Plank)
- 739c22c6-4dc7-434f-8434-7b851e6a37e6 (Lunges)
- d2f2a53c-d882-4068-ad47-984e7742584e (Pull Ups)
- 5adc2648-8c70-413b-ab66-fbb2f250104f (Bicep Curls)
- dacd227d-ccca-4cf4-a1d4-d7ec84259ce7 (Bicycle Crunches)
- 25e807c9-1a7b-440b-ab02-17b1b99d1430 (Sit Ups)
- 63eb2273-c7bd-4477-bf92-43a8836eb05e (Pike Walk)
- 1f102694-0d1d-417f-b987-7b0901791df1 (Mountain Pose (Tadasana))
- adfe4fb5-ff55-4264-9fc5-11ec2a029f45 (Warrior I Pose)
- 098bc494-cb6b-48f2-898a-63fa2ad6c1fb (Warrior II Pose)
- 2cce3fbd-e7ac-429a-8b76-3c8c2fa097cc (Tree Pose (Vrikshasana))
- 9b31ece0-e0ac-4c62-af23-65eca4b1bf4e (Chair Pose (Utkatasana))
- add14005-3df6-4676-beac-37c85043c13e (Eagle Pose)
- 264138a6-48a7-4a87-a786-34323274a5d2 (Garland Pose)
- 1d525b26-817e-458e-ab00-9009deaa3fc5 (Half Moon Pose)
- 831dba61-737d-4193-8c80-536c52d57156 (Big Toe Pose)
- 29a009f5-5b0f-40a4-847d-7fc11f3cbaa0 (Gate Pose)
- ed20ba04-27bd-4c72-bc0d-074c17a01c70 (Revolved Triangle Pose)
- 2c1ea41f-d45d-4dda-aeec-5c9921048e62 (Dancer Pose)


### Schedule Details
- Today's Date: ${formattedDate}
- First routine scheduled on: ${formattedDate}
- Program spans 2 weeks
- Create ${numWorkoutDays * 2} entries in program_routine (${numWorkoutDays} days × 2 weeks)
- Each routine should have 3-5 exercises from the predefined list
`;
};

export const generatePersonalizedProgram = async (userId, prompt) => {
  if (!prompt) return;

  try {
    if (!userId) throw new Error("User ID is required to save the program");

    // 1) Generate program object via Supabase Edge Function (OpenAI)
    const parsedContent = await generateProgramObjectFromPrompt(prompt);

    const debugGeneration =
      (typeof import.meta !== "undefined" && import.meta.env?.DEV) ||
      (typeof import.meta !== "undefined" &&
        import.meta.env?.VITE_DEBUG_PROGRAM_GENERATION === "true");

    if (!parsedContent?.program) {
      throw new Error("Generated payload missing 'program' object");
    }

    const routines = Array.isArray(parsedContent?.routine)
      ? parsedContent.routine
      : [];
    const programRoutines = Array.isArray(parsedContent?.program_routine)
      ? parsedContent.program_routine
      : [];
    const routineExercises = Array.isArray(parsedContent?.routine_exercise)
      ? parsedContent.routine_exercise
      : [];

    if (debugGeneration) {
      console.groupCollapsed("[Physiovision] Generated program payload (pre-insert)");
      console.log("program", parsedContent.program);
      console.log("routine[]", routines);
      console.log("program_routine[]", programRoutines);
      console.log("routine_exercise[]", routineExercises);
      console.groupEnd();
    }

    if (!routines.length || !programRoutines.length || !routineExercises.length) {
      throw new Error(
        "Generated payload is incomplete (needs routine, program_routine, routine_exercise)"
      );
    }

    // 2) Insert Program
    // IMPORTANT: do NOT trust LLM-generated IDs; let Postgres generate UUIDs.
    const programPayload = {
      id: undefined,
      duration: Number(parsedContent.program.duration ?? 14),
      name: String(parsedContent.program.name ?? "Personalized Program"),
      description: String(parsedContent.program.description ?? ""),
      goal_id: parsedContent.program.goal_id ?? 1,
    };

    const responseProgram = await createProgram(userId, programPayload);
    if (responseProgram?.status !== 201) {
      throw new Error("Failed to insert program");
    }

    const createdProgramId = responseProgram?.data?.id;
    if (!isUuid(createdProgramId)) {
      throw new Error("Program insert succeeded but returned an invalid id");
    }

    // 3) Insert all Routines
    // IMPORTANT: routine.id is UUID with default gen_random_uuid(); passing invalid ids causes 400 (22P02).
    // We'll insert routines without ids and keep a mapping from the LLM routine_id to the DB routine_id.
    const createdRoutines = await Promise.all(
      routines.map(async (routineItem) => {
        return await createRoutine({
          id: undefined,
          name: String(routineItem.name ?? "Routine"),
          description: String(routineItem.description ?? ""),
          duration: Number(routineItem.duration ?? 30),
          preset: routineItem.preset ?? false,
          estimated_calories: Number(routineItem.estimated_calories ?? 0),
        });
      })
    );

    const routineIdByOldId = new Map();
    createdRoutines.forEach((createdRoutine, idx) => {
      const oldId = routines[idx]?.id;
      if (oldId != null) {
        routineIdByOldId.set(String(oldId), createdRoutine.id);
      }
    });

    // LLM may produce more program_routine entries than unique routines (e.g., 14 days but 7 unique routines).
    // We need to handle this by cycling through the created routines when we encounter unknown routine_ids.
    let cyclicRoutineIndex = 0;
    
    const resolveRoutineId = (oldRoutineId, indexFallback, scheduledDate) => {
      if (oldRoutineId != null) {
        const key = String(oldRoutineId);
        const mapped = routineIdByOldId.get(key);
        if (mapped) return mapped;

        // Try to match by day name in routine name (e.g., "Monday Routine" for a Monday date)
        if (scheduledDate) {
          const date = new Date(scheduledDate);
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const dayName = dayNames[date.getDay()];
          
          for (let i = 0; i < createdRoutines.length; i++) {
            const routine = createdRoutines[i];
            const routineName = (routine?.name || routines[i]?.name || '').toLowerCase();
            if (routineName.includes(dayName.toLowerCase())) {
              // Cache this mapping for future lookups
              routineIdByOldId.set(key, routine.id);
              return routine.id;
            }
          }
        }

        // Fallback: cycle through created routines
        if (createdRoutines.length > 0) {
          const routineToUse = createdRoutines[cyclicRoutineIndex % createdRoutines.length];
          cyclicRoutineIndex++;
          // Cache this mapping
          routineIdByOldId.set(key, routineToUse.id);
          return routineToUse.id;
        }
      }

      if (
        typeof indexFallback === "number" &&
        indexFallback >= 0 &&
        createdRoutines.length > 0
      ) {
        // Use modulo to cycle through routines
        const fallbackId = createdRoutines[indexFallback % createdRoutines.length]?.id;
        if (fallbackId) return fallbackId;
      }

      return null;
    };

    // 4) Insert Program_Routine rows
    await Promise.all(
      programRoutines.map(async (item, index) => {
        const mappedRoutineId = resolveRoutineId(item.routine_id, index, item.scheduled_date);
        if (!isUuid(mappedRoutineId)) {
          throw new Error(
            `Unable to map routine_id from generated payload: ${String(item.routine_id)}`
          );
        }
        const res = await createProgramRoutine(
          createdProgramId,
          mappedRoutineId,
          item.scheduled_date,
          item.completed ?? false
        );
        if (res.status !== 201 && res.status !== 200) {
          throw new Error("Failed to insert program_routine info");
        }
      })
    );

    // 5) Insert Routine_Exercise rows
    await Promise.all(
      routineExercises.map(async (item) => {
        const mappedRoutineId = resolveRoutineId(item.routine_id, undefined);
        if (!isUuid(mappedRoutineId)) {
          throw new Error(
            `Unable to map routine_id in routine_exercise from generated payload: ${String(
              item.routine_id
            )}`
          );
        }
        if (!isUuid(item.exercise_id)) {
          throw new Error(
            `Generated payload contains invalid exercise_id: ${String(item.exercise_id)}`
          );
        }
        const res = await createRoutineExercise({
          exercise_id: item.exercise_id,
          routine_id: mappedRoutineId,
          order: Number(item.order ?? 0),
          sets: Number(item.sets ?? 0),
          reps: Number(item.reps ?? 0),
          duration: item.duration ?? 0,
          rest_time: item.rest_time ?? item.rest_period ?? 0,
        });
        if (res.status !== 201 && res.status !== 200) {
          throw new Error("Failed to insert routine_exercise info");
        }
      })
    );

    return responseProgram.data;
  } catch (error) {
    console.error("Error generating personalized program:", error);
    throw error;
  }
};

// Called from Home.jsx after onboarding registration.
// Creates the first personalized program only if the user has none.
export const ensureInitialPersonalizedProgram = async (authUser, { force = false } = {}) => {
  if (!authUser?.id) throw new Error("Auth user is required");

  const existing = await getAllUserPrograms(authUser.id, false, false);
  if (!force && Array.isArray(existing) && existing.length > 0) {
    return existing[0];
  }

  const userInfo = await getUser(authUser, true);
  const prompt = buildPromptFromUserProfile(userInfo);
  return await generatePersonalizedProgram(authUser.id, prompt);
};
