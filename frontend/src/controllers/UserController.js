import { supabase } from "../supabaseClient";
import { historyItemComparator } from "../utils/utils";
import User from "../models/User";
import UserSettings from "../models/UserSettings";
import UserProgress from "../models/UserProgress";
import UserAchievement from "../models/UserAchievement";
import {
  getAllAchievements,
  getGoal,
  getIntensity,
} from "./LocalTablesController";
import { getUserCompletedPrograms } from "./ProgramController";
import { getUserCompletedRoutines } from "./RoutineController";

const getUser = async (authUser, allInfo = true) => {
  try {
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    // If the profile row doesn't exist yet, create a minimal one.
    if (error) throw error;
    if (!data) {
      await createUser({
        id: authUser.id,
        name:
          authUser?.user_metadata?.full_name ||
          authUser?.user_metadata?.name ||
          authUser?.email ||
          '',
      });
    }

    const { data: userRow, error: refetchError } = await supabase
      .from('user')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();
    if (refetchError) throw refetchError;

    const pictureFromAuth =
      authUser?.user_metadata?.profile_picture_url ||
      authUser?.user_metadata?.avatar_url ||
      authUser?.user_metadata?.picture ||
      null;

    const user = new User(
      authUser.id,
      userRow?.full_name || authUser?.user_metadata?.full_name,
      pictureFromAuth,
      userRow?.birthday,
      userRow?.gender,
      userRow?.weight,
      userRow?.weight_unit
    );
    if (allInfo) {
      user.settings = await getUserSettings(user.id);
      user.progress = await getUserProgress(user.id);
      user.schedule = await getUserSchedule(user.id);
      user.achievements = await getUserAchievements(user.id);
     }

    return user;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getUserSettings = async (id) => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const goal = await getGoal(data.goal_id);
    const intensity = await getIntensity(data.intensity_id);
    return new UserSettings(goal, intensity);
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getUserProgress = async (id) => {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const progress = new UserProgress(
      data.level,
      data.level_progress,
      data.streak,
      data.highest_streak,
      data.reached_goals,
      data.highest_score
    );
    return progress;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const createUser = async (userObj) => {
  try {
    const user = new User();
    user.id = userObj.id;
    user.full_name = userObj.name;
    user.picture = userObj.picture;
    user.birthday = userObj.birthday;
    user.gender = userObj.gender;
    user.weight = userObj.weight;
    user.weight_unit = userObj.weight_unit;

    const { error: userError } = await supabase.from('user').upsert({
      id: user.id,
      full_name: user.full_name,
      birthday: user.birthday,
      gender: user.gender,
      weight: user.weight,
      weight_unit: user.weight_unit,
      // user_id: user.id // Removed as it seems redundant based on typical schema, but check if needed
    });
    if (userError) throw userError;

    // Save user settings if provided (e.g., after onboarding)
    if (userObj?.settings) {
      const settingsResponse = await updateUserSettings(user.id, userObj.settings);
      user.settings = settingsResponse;
    }

    // Create default progress only if it doesn't exist yet (avoid resetting real progress)
    // First check if progress exists
    const { data: existingProgress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    let progressRow = existingProgress;

    // Only insert if no progress exists
    if (!existingProgress) {
      const { data: insertedProgress, error: insertProgressError } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          level: 1,
          level_progress: 0,
          streak: 0,
          highest_streak: 0,
          reached_goals: 0,
          highest_score: 0,
        })
        .select()
        .single();

      // Ignore duplicate key error (23505) - another process may have created it
      if (insertProgressError && insertProgressError.code !== '23505') {
        throw insertProgressError;
      }
      progressRow = insertedProgress;
    }

    if (progressRow) {
      user.progress = new UserProgress(
        progressRow.level,
        progressRow.level_progress,
        progressRow.streak,
        progressRow.highest_streak,
        progressRow.reached_goals,
        progressRow.highest_score
      );
    }

    if (userObj.schedule) {
      await createUserSchedule(user.id, userObj.schedule);
      user.schedule = userObj.schedule;
    }

    return user;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

/**
 * Update or create a user with all their details.
 * Uses upsert to handle both new users (from SignUp) and existing users.
 */
const updateUser = async (user_id, updatedUserObj) => {
  try {
    // Use upsert to create or update user - handles both new signups and updates
    const { error } = await supabase.from('user').upsert({
      id: user_id,
      full_name: updatedUserObj.full_name ?? updatedUserObj.name,
      birthday: updatedUserObj.birthday,
      gender: updatedUserObj.gender,
      weight: updatedUserObj.weight,
      weight_unit: updatedUserObj.weight_unit
    }, { onConflict: 'id' });

    if (error) throw error;

    // Create/update user settings if provided (e.g., goal_id, intensity_id from onboarding)
    if (updatedUserObj.settings) {
      await updateUserSettings(user_id, updatedUserObj.settings);
    }

    // Create/update user progress if provided
    if (updatedUserObj.progress) {
      await updateUserProgress(user_id, updatedUserObj.progress);
    } else {
      // Ensure default progress exists for new users
      // First check if progress exists
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('user_id')
        .eq('user_id', user_id)
        .maybeSingle();

      // Only insert if no progress exists
      if (!existingProgress) {
        const { error: insertError } = await supabase
          .from('user_progress')
          .insert({
            user_id: user_id,
            level: 1,
            level_progress: 0,
            streak: 0,
            highest_streak: 0,
            reached_goals: 0,
            highest_score: 0,
          });

        // Ignore duplicate key error (23505) - user may already have progress
        if (insertError && insertError.code !== '23505') {
          console.error('Error creating default progress:', insertError);
        }
      }
    }

    // Create/update workout schedule if provided
    if (updatedUserObj.schedule) {
      await createUserSchedule(user_id, updatedUserObj.schedule);
    }

    return true;
  } catch (e) {
    console.error('Error in updateUser:', e);
    throw e;
  }
};

const updateUserSettings = async (user_id, updatedSettingsObj) => {
  try {
    const settings = typeof user_id === 'object' ? user_id : updatedSettingsObj;
    const id = typeof user_id === 'object' ? user_id.user_id : user_id;

    const { data, error } = await supabase.from('user_settings').upsert({
      user_id: id,
      goal_id: settings.goal_id,
      intensity_id: settings.intensity_id
    }).select().single();

    if (error) throw error;
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const updateUserProgress = async (user_id, updatedProgressObj) => {
  try {
    const { data, error } = await supabase.from('user_progress').update({
      level: updatedProgressObj.level,
      level_progress: updatedProgressObj.level_progress,
      streak: updatedProgressObj.streak,
      highest_streak: updatedProgressObj.highest_streak,
      reached_goals: updatedProgressObj.reached_goals,
      highest_score: updatedProgressObj.highest_score,
    }).eq('user_id', user_id).select();

    if (error) throw error;
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getUserSchedule = async (user_id) => {
  try {
    const { data, error } = await supabase
      .from('user_workout_schedule')
      .select('week_day')
      .eq('user_id', user_id)
      .eq('active', true);

    if (error) throw error;
    return (data ?? [])
      .map((row) => row.week_day)
      .filter(Boolean);
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const createUserSchedule = async (user_id, scheduleArray = []) => {
  try {
    const normalizedDays = (scheduleArray || [])
      .filter((day) => typeof day === 'string' && day.trim())
      .map((day) => day.trim());

    const uniqueDays = Array.from(new Set(normalizedDays));

    // Delete all rows if schedule is empty
    if (!uniqueDays.length) {
      const { error: deleteError } = await supabase
        .from('user_workout_schedule')
        .delete()
        .eq('user_id', user_id);
      if (deleteError) throw deleteError;
      return [];
    }

    // Upsert selected days
    const upsertPayload = uniqueDays.map((day) => ({
      user_id,
      week_day: day,
      active: true,
    }));

    const { error: upsertError } = await supabase
      .from('user_workout_schedule')
      .upsert(upsertPayload, { onConflict: 'user_id,week_day' });
    if (upsertError) throw upsertError;

    // Remove any days that are no longer in the schedule
    const { error: cleanupError } = await supabase
      .from('user_workout_schedule')
      .delete()
      .eq('user_id', user_id)
      .not('week_day', 'in', `(${uniqueDays.map((d) => `"${d}"`).join(',')})`);
    if (cleanupError) throw cleanupError;

    return uniqueDays;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const updateUserSchedule = async (
  user_id,
  currentScheduleArray,
  newScheduleArray
) => {
  try {
    return createUserSchedule(user_id, newScheduleArray);
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getUserHistory = async (user_id) => {
  try {
    const programsResponse = await getUserCompletedPrograms(user_id);
    const routinesResponse = await getUserCompletedRoutines(user_id);
    const achievementsResponse = await getUserAchievements(user_id);
    const history = [
      ...programsResponse,
      ...routinesResponse,
      ...achievementsResponse,
    ];
    if (history.length > 1) history.sort(historyItemComparator);
    return history;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getUserAchievements = async (user_id) => {
  try {
    const { data, error } = await supabase
      .from('user_achievement')
      .select('*')
      .eq('user_id', user_id);

    if (error) throw error;

    const userAchievements = [];
    const achievements = await getAllAchievements();
    
    data.forEach((achievement) => {
      let localAchievement = achievements.find(
        (element) => element.id == achievement.achievement_id
      );
      if (localAchievement) {
        userAchievements.push(
          new UserAchievement(
            localAchievement.id,
            localAchievement.name,
            localAchievement.description,
            achievement.earned_on
          )
        );
      }
    });
    return userAchievements;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const addUserAchievement = async (user_id, achievement_id, earned_at) => {
  try {
    const earned_on = earned_at
      ? new Date(earned_at).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase.from('user_achievement').insert({
      user_id,
      achievement_id,
      earned_on,
    }).select();

    if (error) throw error;
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getUserAccumulatedStats = async (user_id) => {
  try {
    const { data, error } = await supabase
      .from('user_accumulated_stats')
      .select('*')
      .eq('user_id', user_id);

    if (error) throw error;
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const updateUserAccumulatedStats = async (user_id, date, minutes, calories) => {
  try {
    const { error } = await supabase.from('user_accumulated_stats').upsert({
      user_id: user_id,
      date: date,
      minutes: minutes,
      calories: calories
    });

    if (error) throw error;
    return { success: true };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export {
  getUser,
  getUserSettings,
  getUserProgress,
  createUser,
  updateUser,
  getUserHistory,
  createUserSchedule,
  updateUserSchedule,
  getUserAchievements,
  addUserAchievement,
  getUserAccumulatedStats,
  updateUserAccumulatedStats,
  updateUserProgress,
  getUserSchedule,
};
