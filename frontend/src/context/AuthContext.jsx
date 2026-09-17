import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import {
  getUserProgress,
  updateUserProgress,
} from "../controllers/UserController";

const AuthContext = createContext(undefined);

// Daily login XP reward amount
const DAILY_LOGIN_XP = 5;

// Helper to check if last sign-in was on a different date (yesterday or earlier)
const isDifferentDate = (lastSignInAt) => {
  if (!lastSignInAt) return false;
  
  const lastSignInUTC = new Date(lastSignInAt);
  const now = new Date();

  const yesterday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1)
  );
  return lastSignInUTC <= yesterday;
};

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const dailyLoginProcessed = useRef(false);

  // Retrieve the session information
  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }

        const sessionData = data?.session;
        if (sessionData) {
          setSession(sessionData);
        } else {
          setSession(null);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch the session from supabase
    fetchSession();

    // Listener for changes on auth state
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);

      if (event === "INITIAL_SESSION") {
        // Initial session already handled by fetchSession
      } else if (event === "SIGNED_IN" && session?.access_token) {
        setSession(session);
        setIsLoading(false);
      } else if (event === "SIGNED_OUT") {
        setSession(null);
        dailyLoginProcessed.current = false;
      } else if (event === "TOKEN_REFRESHED") {
        console.log("Access token refreshed");
        setSession(session);
      }
    });

    // Cleanup
    return () => {
      if (data) data.subscription.unsubscribe();
    };
  }, []);

  // Daily login points - award XP if user's last sign in was on a different date
  useEffect(() => {
    const user = session?.user;
    if (!user || dailyLoginProcessed.current) return;

    const checkDailyLoginPoints = async () => {
      const lastSignInAt = user.last_sign_in_at;
      if (lastSignInAt && isDifferentDate(lastSignInAt)) {
        try {
          dailyLoginProcessed.current = true;
          let progress = (await getUserProgress(user.id)) ?? {
            level_progress: 0,
          };
          const updatedProgress = {
            ...progress,
            level_progress: (progress.level_progress || 0) + DAILY_LOGIN_XP,
          };
          await updateUserProgress(user.id, updatedProgress);
          console.log(`Awarded ${DAILY_LOGIN_XP} XP for daily login`);
        } catch (error) {
          console.error("Error awarding daily login XP:", error);
        }
      } else {
        dailyLoginProcessed.current = true;
      }
    };

    checkDailyLoginPoints();
  }, [session]);

  // Sign up
  // Returns a Supabase-shaped response: { data, error }
  const signUpNewUser = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName?.trim() || null,
          },
        },
      });

      if (error) {
        console.error("Error signing up: ", error);
      }

      return { data, error };
    } catch (error) {
      console.error("Unexpected error during sign up:", error);
      return { data: null, error };
    }
  };
  

  // Sign in
  const signInUser = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password,
      });

      if (error) {
        console.error("Sign-in error:", error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Unexpected error during sign-in:", error);
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      };
    }
  };

  // Sign out - checks for active session before signing out
  const signOut = async () => {
    try {
      // Check if there is an active session
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError || !sessionData?.session) {
        console.log("No active session found. Clearing user state.");
        setSession(null);
        dailyLoginProcessed.current = false;
        return;
      }

      // Sign out the user
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setSession(null);
      dailyLoginProcessed.current = false;
    } catch (error) {
      console.error("User failed to sign out:", error);
      setSession(null);
      dailyLoginProcessed.current = false;
    }
  };

  // Reset Password
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error("Error resetting password:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Unexpected error during password reset:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  // Google OAuth Sign In
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        console.error('Google sign-in error:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      console.error('Unexpected error during Google sign-in:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const value = {
    session,
    user: session?.user,
    isLoading,
    signUpNewUser,
    signInUser,
    signOut,
    resetPassword,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-300 font-medium">Loading...</div>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

// Export with both naming conventions for compatibility
export const UseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};

// Alias for components that use lowercase useAuth
export const useAuth = UseAuth;

// Alias for components that use AuthProvider naming
export const AuthProvider = AuthContextProvider;