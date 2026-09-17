import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { UseAuth } from "../../context/AuthContext";
import { getUser } from "../../controllers/UserController";
import { getGoal, getIntensity } from "../../controllers/LocalTablesController";

export const useGenerateProgramPrompt = ({ userPreferences } = {}) => {
  const { user } = UseAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [prompt, setPrompt] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user) return;
      try {
        const fetchedUserInfo = await getUser(user);
        setUserInfo(fetchedUserInfo);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    fetchUserInfo();
  }, [user]);

  useEffect(() => {
    const generatePrompt = async () => {
      try {
        if (!userInfo) return;

        // Create a working copy to avoid mutating the original
        const workingUserInfo = { ...userInfo };
        
        // Initialize settings if needed
        if (!workingUserInfo.settings) {
          workingUserInfo.settings = {};
        }

        if (userPreferences && Object.keys(userPreferences).length > 0) {
          // User came from onboarding with preferences
          const goal = userPreferences.goal_id ? await getGoal(userPreferences.goal_id) : null;
          const intensity = userPreferences.intensity_id ? await getIntensity(userPreferences.intensity_id) : null;
          workingUserInfo.gender = userPreferences.gender || workingUserInfo.gender || 'unspecified';
          workingUserInfo.settings.goal = goal?.name || 'Lose Weight';
          workingUserInfo.settings.intensity = intensity?.name || 'Moderate';
          workingUserInfo.schedule = userPreferences.schedule || ['Monday', 'Wednesday', 'Friday'];
        } else {
          // No preferences passed, use defaults from user profile or fallbacks
          workingUserInfo.gender = workingUserInfo.gender || 'unspecified';
          workingUserInfo.settings.goal = workingUserInfo.settings?.goal?.name || workingUserInfo.settings?.goal || 'Lose Weight';
          workingUserInfo.settings.intensity = workingUserInfo.settings?.intensity?.name || workingUserInfo.settings?.intensity || 'Moderate';
          workingUserInfo.schedule = Array.isArray(workingUserInfo.schedule) && workingUserInfo.schedule.length > 0
            ? workingUserInfo.schedule
            : ['Monday', 'Wednesday', 'Friday'];
        }

        const formattedDate = format(new Date(), 'yyyy-MM-dd');
        const generatedPrompt = `
          You will now create a personalized fitness program for the user. The structure of a fitness program is as follows:
          - **Program**: Contains routines.
          - **Routine**: Each routine is a set of exercises.
          - **Exercise**: A specific movement that includes repetitions and sets.

          ### Database Schema
          The program should adhere to the following database schema:
          - **Program**
          - **Program_Routine** (Many to Many relationship between Program and Routine)
          - **Routine**
          - **Routine_Exercise** (Many to Many relationship between Routine and Exercise)
          - **Exercise** (Data is already prepared in the table)

          ### User Profile
          Please use the following details from the user's fitness questionnaire to create a workout plan:
          - Gender: ${workingUserInfo.gender}
          - Primary Fitness Goal: ${workingUserInfo.settings.goal}
          - Preferred Exercise Intensity: ${workingUserInfo.settings.intensity}
          - Available Workout Days: ${workingUserInfo.schedule?.join(', ') || 'Monday, Wednesday, Friday'}

          ### Output Requirements
          Generate the output in the following JavaScript object format.
          Return ONLY valid JSON (no markdown, no backticks, no commentary).

          \`\`\`
          {
            "program": {
              "id": "<uuid>",
              "duration": <number>,             // In milliseconds
              "name": "<string>",
              "description": "<string>"
              "goal_id": "<number>",            // Fixed value 1
            },
            "program_routine": [
              {
                "program_id": "<uuid>",         // **Primary Key**
                "routine_id": "<uuid}",         // **Primary Key**
                "scheduled_date": "<date>",
                "completed": "FALSE"            // This is fixed value
              },{},{}...                        // You can have multiple data if required
            ],
            "routine": [
              {
                "id": "<uuid>",
                "program_id": "<uuid>",
                "name": "<string>",
                "description": "<string>"
                "duration": <number>,           // In milliseconds
                "preset": "FALSE"               // This is fixed value
                ”estimated_calories”: <number>, // You can calculate this based on the exercises
                "completed": "FALSE"            // This is fixed value
              },{},{}...                        // You can have multiple routines if required
            ], 
            "routine_exercise": [
              {
                "routine_id": "<uuid>",
                "exercise_id": "<uuid>",
                "sets": <number>,
                "reps": <number>,
                "order": <number>,
                "rest_time": <number>           // In milliseconds
              }, {}, {}...                      // You can have multiple data if required
            ] 
          }
          \`\`\`


          ### Predefined Exercises
          Use only the following exercises to create the routines. Do not use any exercise IDs other than the ones provided below:
          - UUID: 013d2168-a5bb-448d-8a03-7456055a3e68 (Exercise: Push Ups)
          - UUID: fb7180ab-f3e2-4a5d-b731-a2c0fc5de9fa (Exercise: Squats)
          - UUID: 0cc22f75-7d4d-4d50-9cdd-4ae3c731c517 (Exercise: Jumping Jacks)
          - UUID: 7c12ed44-7dac-4b42-90c3-aa9a02dd251d (Exercise: Plank)
          - UUID: 739c22c6-4dc7-434f-8434-7b851e6a37e6 (Exercise: Lunges)
          - UUID: d2f2a53c-d882-4068-ad47-984e7742584e (Exercise: Pull Ups)
          - UUID: 5adc2648-8c70-413b-ab66-fbb2f250104f (Exercise: Bicep Curls)
          - UUID: dacd227d-ccca-4cf4-a1d4-d7ec84259ce7 (Exercise: Bicycle Crunches)
          - UUID: 25e807c9-1a7b-440b-ab02-17b1b99d1430 (Exercise: Sit Ups)
          - UUID: 63eb2273-c7bd-4477-bf92-43a8836eb05e (Exercise: Pike Walk)
          - UUID: 1f102694-0d1d-417f-b987-7b0901791df1 (Exercise: Mountain Pose (Tadasana))
          - UUID: adfe4fb5-ff55-4264-9fc5-11ec2a029f45 (Exercise: Warrior I Pose)
          - UUID: 098bc494-cb6b-48f2-898a-63fa2ad6c1fb (Exercise: Warrior II Pose)
          - UUID: 2cce3fbd-e7ac-429a-8b76-3c8c2fa097cc (Exercise: Tree Pose (Vrikshasana))
          - UUID: 9b31ece0-e0ac-4c62-af23-65eca4b1bf4e (Exercise: Chair Pose (Utkatasana))
          - UUID: add14005-3df6-4676-beac-37c85043c13e (Exercise: Eagle Pose)
          - UUID: 264138a6-48a7-4a87-a786-34323274a5d2 (Exercise: Garland Pose)
          - UUID: 1d525b26-817e-458e-ab00-9009deaa3fc5 (Exercise: Half Moon Pose)
          - UUID: 831dba61-737d-4193-8c80-536c52d57156 (Exercise: Big Toe Pose)
          - UUID: 29a009f5-5b0f-40a4-847d-7fc11f3cbaa0 (Exercise: Gate Pose)
          - UUID: ed20ba04-27bd-4c72-bc0d-074c17a01c70 (Exercise: Revolved Triangle Pose)
          - UUID: 2c1ea41f-d45d-4dda-aeec-5c9921048e62 (Exercise: Dancer Pose)

          ### Additional Notes
          - **Today's Date**: ${formattedDate}.
          - **Routine Scheduling**: Schedule routines only on the days specified by the user as available for workouts (e.g., Monday, Wednesday, Friday). Do not assign routines on any other days, and ensure that no routines are scheduled for dates in the past.
          - **First Routine Schedule**: The first routine should be scheduled on ${formattedDate} for demo purposes.
          - **Program Duration**: The program should span 2 weeks from today's date.
          - **Return Format**: Exclude any backticks when you return the object.
          - **UUID format should be xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx, and it must be a valid UUID containing only hexadecimal characters (0-9 and a-f).**
          `;
        setPrompt(generatedPrompt);
      } catch (error) {
        console.error("Error generating prompt:", error);
      }
    };
    generatePrompt();
  }, [userInfo, userPreferences]);

  return prompt;
};