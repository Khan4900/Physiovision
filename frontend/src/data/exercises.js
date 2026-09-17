import bicepcurlsImg from "../assets/bicepcurls.jpg";
import jumpingjacksImg from "../assets/jumpingjacks.jpg";
import pullupsImg from "../assets/pullups.jpg";
import lungesImg from "../assets/lunges.jpg";
import squatImg from "../assets/squat.jpg";
import plankImg from "../assets/plank.jpg";
import situpsImg from "../assets/situps.jpg";
import pikewalkImg from "../assets/pikewalk.jpg";
import pushupImg from "../assets/pushup.jpg";
import bicycleCrunchesImg from "../assets/bicyclecrunches.jpg";
import tadasanaImg from "../assets/poses/tadasana.png";
import warriorIIImg from "../assets/poses/warrior-II.jpg";
import vrikshasanaImg from "../assets/poses/vrikshasana.jpg";
import warriorIImg from "../assets/poses/warrior-I.png";
import eagleImg from "../assets/poses/eagle.png";
import garlandImg from "../assets/poses/garland.png";
import halfmoonImg from "../assets/poses/half-moon.png";
import bigtoeImg from "../assets/poses/bigtoepose.jpg";
import gateImg from "../assets/poses/gate.png";
import parivrttatrikonasanaImg from "../assets/poses/parivrtta-trikonasana.jpg";
import danceImg from "../assets/poses/dance.png";
import utkatasanaImg from "../assets/poses/utkatasana.jpg";

// ==========================================
// UNIFIED EXERCISE DATA
// ==========================================

export const EXERCISES = [
  {
    id: 1,
    title: "Push Ups",
    type: "Strength",
    duration: 10,
    difficulty: "Advanced",
    imageUrl: pushupImg,
    modelName: "pushups",
    video_url: "https://www.youtube.com/embed/IODxDxX7oi4",
    description: "Push ups are a bodyweight exercise that targets the chest, arms, and shoulders. They build upper body strength and increase muscular endurance.",
    muscleGroups: ["Chest", "Shoulders", "Triceps", "Core"],
    goals: ["Strength", "Endurance"],
    types: ["Bodyweight", "Compound"],
    tips: [
      "Keep your body in a straight line from head to heels",
      "Lower your chest until it nearly touches the floor",
      "Push through your palms to return to starting position",
      "Engage your core throughout the movement",
    ],
    modelAvailable: true,
    rotatedModel: true,
    scaledModel: true,
    zRotationMul: 0.33,
    scaleMul: 0.3,
    modelLink: "https://sketchfab.com/models/6c7bc2c57c8648f3a70488155b326a16/embed?autostart=1&dnt=1",
    refLink: "https://classpass.com/movements/push-up",
  },
  {
    id: 2,
    title: "Squats",
    type: "Strength",
    duration: 10,
    difficulty: "Beginner",
    imageUrl: squatImg,
    modelName: "squats",
    video_url: "https://www.youtube.com/embed/YaXPRqUwItQ",
    description: "Squats are a fundamental exercise that strengthens the legs and glutes, while improving mobility and balance. They promote overall fitness and athletic performance.",
    muscleGroups: ["Quadriceps", "Glutes", "Hamstrings", "Core"],
    goals: ["Strength", "Mobility"],
    types: ["Bodyweight", "Compound"],
    tips: [
      "Stand with feet shoulder-width apart",
      "Keep your chest up and core engaged",
      "Lower down as if sitting in a chair",
      "Push through your heels to stand back up",
    ],
    modelAvailable: true,
    rotatedModel: false,
    scaledModel: false,
    zRotationMul: 0,
    scaleMul: 0.3,
    modelLink: "https://sketchfab.com/models/a3eebd6b06fb4ad5b6462dd28ee8dde6/embed?autostart=1&dnt=1",
    refLink: "https://classpass.com/movements/squat",
  },
  {
    id: 3,
    title: "Jumping Jacks",
    type: "Cardio",
    duration: 10,
    difficulty: "Beginner",
    imageUrl: jumpingjacksImg,
    modelName: "jumpingjacks",
    video_url: "https://www.youtube.com/embed/iSSAk4XCsRA",
    description: "Jumping Jacks are cardio exercise that engages the entire body, boosting heart rate and burning calories. They promote coordination during workout.",
    muscleGroups: ["Full Body", "Legs", "Shoulders"],
    goals: ["Cardio", "Endurance"],
    types: ["Cardio", "Full Body"],
    tips: [
      "Stand upright with legs together, arms at sides",
      "Jump and spread legs shoulder-width apart while raising arms overhead",
      "Jump back to starting position",
      "Maintain a steady rhythm throughout",
    ],
    modelAvailable: true,
    rotatedModel: false,
    scaledModel: false,
    zRotationMul: 0,
    scaleMul: 0.3,
    modelLink: "https://sketchfab.com/models/4fcbfb3ef1124df8afd57204f9a516ac/embed?autostart=1&dnt=1",
    refLink: "https://www.nytimes.com/guides/well/activity/how-to-do-a-jumping-jack",
  },
  {
    id: 4,
    title: "Plank",
    type: "Strength",
    duration: 30,
    difficulty: "Intermediate",
    imageUrl: plankImg,
    modelName: "plank",
    video_url: "https://www.youtube.com/embed/ASdvN_XEl_c",
    description: "Plank is a core strengthening exercise that engages abs, back, and shoulders. They improve core stability, posture, and overall strength and balance.",
    muscleGroups: ["Core", "Shoulders", "Back"],
    goals: ["Strength", "Stability"],
    types: ["Bodyweight", "Isometric"],
    tips: [
      "Keep your body in a straight line from head to heels",
      "Place palms shoulder-width apart with shoulders over wrists",
      "Engage your core and glutes throughout",
      "Breathe steadily and hold as long as possible",
    ],
    modelAvailable: true,
    rotatedModel: true,
    scaledModel: true,
    zRotationMul: 0.33,
    scaleMul: 0.3,
    modelLink: "https://sketchfab.com/models/1643f24070c34e6ca82b59a5145b949a/embed?autostart=1&dnt=1",
    refLink: "https://classpass.com/movements/plank-jack",
  },
  {
    id: 5,
    title: "Lunges",
    type: "Strength",
    duration: 10,
    difficulty: "Intermediate",
    imageUrl: lungesImg,
    modelName: "lunges",
    video_url: "https://www.youtube.com/embed/QOVaHwm-Q6U",
    description: "Lunges are an effective lower body exercise that targets the legs and glutes. They enhance your lower body muscle tone and overall functional fitness.",
    muscleGroups: ["Quadriceps", "Glutes", "Hamstrings", "Core"],
    goals: ["Strength", "Balance"],
    types: ["Bodyweight", "Compound"],
    tips: [
      "Stand straight with feet shoulder-width apart",
      "Step forward and lower hips until both knees are at 90 degrees",
      "Keep your back heel off the floor",
      "Alternate legs smoothly and maintain balance",
    ],
    modelAvailable: true,
    rotatedModel: true,
    scaledModel: true,
    zRotationMul: 0.33,
    scaleMul: 0.003,
    modelLink: "https://sketchfab.com/models/93b25198122b4417a5da3d8428fae423/embed?autostart=1&dnt=1",
    refLink: "https://classpass.com/movements/lunge",
  },
  {
    id: 6,
    title: "Pull Ups",
    type: "Strength",
    duration: 10,
    difficulty: "Advanced",
    imageUrl: pullupsImg,
    modelName: "pullups",
    video_url: "https://www.youtube.com/embed/eGo4IYlbE5g",
    description: "Pull-ups are a challenging upper body exercise that targets back, arms, and shoulders. They build strength, grip, and upper body stability for overall development.",
    muscleGroups: ["Back", "Biceps", "Shoulders", "Core"],
    goals: ["Strength", "Endurance"],
    types: ["Bodyweight", "Compound"],
    tips: [
      "Grip the bar with an overhand grip shoulder-width apart",
      "Pull yourself up until chin is above the bar",
      "Lower yourself with control until elbows are straight",
      "Keep your core engaged throughout the movement",
    ],
    modelAvailable: true,
    rotatedModel: false,
    scaledModel: true,
    zRotationMul: 0,
    scaleMul: 0.003,
    modelLink: "https://sketchfab.com/models/feffc536b46442bfbe0fd3dfb99861c0/embed?autostart=1&dnt=1",
    refLink: "https://www.verywellfit.com/pullup-bar-exercises-for-upper-body-strength-3120735",
  },
  {
    id: 7,
    title: "Bicep Curls",
    type: "Strength",
    duration: 10,
    difficulty: "Beginner",
    imageUrl: bicepcurlsImg,
    modelName: "bicepcurls",
    video_url: "https://www.youtube.com/embed/ykJmrZ5v0Oo",
    description: "Bicep curls are a weightlifting exercise that target the biceps muscle. They increase muscle strength, and improve overall upper body aesthetics.",
    muscleGroups: ["Biceps", "Forearms"],
    goals: ["Strength", "Muscle Tone"],
    types: ["Weights", "Isolation"],
    tips: [
      "Start with dumbbells at your sides, elbows close to body",
      "Curl weights up to shoulders by bending elbows",
      "Keep elbows stationary throughout the movement",
      "Lower with control and squeeze at the top",
    ],
    modelAvailable: true,
    rotatedModel: false,
    scaledModel: true,
    zRotationMul: 0,
    scaleMul: 0.003,
    modelLink: "https://sketchfab.com/models/4e958ee159fe46128b044b6e63d0ec69/embed?autostart=1&dnt=1",
    refLink: "https://classpass.com/movements/bicep-curl",
  },
  {
    id: 8,
    title: "Bicycle Crunches",
    type: "Strength",
    duration: 10,
    difficulty: "Intermediate",
    imageUrl: bicycleCrunchesImg,
    modelName: "bicyclecrunches",
    video_url: "https://www.youtube.com/embed/9FGilxCbdz8",
    description: "Bicycle crunches target the abs, obliques, and hip flexors, strengthening the core and improving stability. They are effective for toning the midsection.",
    muscleGroups: ["Abs", "Obliques", "Hip Flexors"],
    goals: ["Strength", "Core Stability"],
    types: ["Bodyweight", "Core"],
    tips: [
      "Lie on your back with hands behind head and lower back pressed down",
      "Bring opposite elbow to opposite knee in a twisting motion",
      "Keep your movements controlled and rhythmic",
      "Breathe steadily throughout the exercise",
    ],
    modelAvailable: true,
    rotatedModel: true,
    scaledModel: false,
    zRotationMul: 0.33,
    scaleMul: 0.3,
    modelLink: "https://sketchfab.com/models/c24d18ab0e194c629eb5df4ded145b15/embed?autostart=1&dnt=1",
    refLink: "https://classpass.com/movements/bicycle",
  },
  {
    id: 9,
    title: "Sit Ups",
    type: "Strength",
    duration: 10,
    difficulty: "Beginner",
    imageUrl: situpsImg,
    modelName: "situps",
    video_url: "https://www.youtube.com/embed/1fbU_MkV7NE",
    description: "Sit-ups engage the abs, obliques, and hip flexors, strengthening the core and improving stability. They are very effective for achieving a well-defined midsection.",
    muscleGroups: ["Abs", "Hip Flexors", "Core"],
    goals: ["Strength", "Endurance"],
    types: ["Bodyweight", "Core"],
    tips: [
      "Lie with bent knees and feet flat on the floor",
      "Place hands behind ears, not behind head",
      "Lift upper body to sitting position without straining neck",
      "Exhale as you lift, lower back down with control",
    ],
    modelAvailable: true,
    rotatedModel: true,
    scaledModel: true,
    zRotationMul: 0.33,
    scaleMul: 0.003,
    modelLink: "https://sketchfab.com/models/d39138e42be949b2b1f124a555f22239/embed?autostart=1&dnt=1",
    refLink: "https://classpass.com/movements/sit-up",
  },
  {
    id: 10,
    title: "Pike Walk",
    type: "Strength",
    duration: 10,
    difficulty: "Intermediate",
    imageUrl: pikewalkImg,
    modelName: "pikewalk",
    video_url: "https://www.youtube.com/embed/iT8hLbjCbGc",
    description: "Pike walk is a challenging plank variation that targets the core, abs, back, and shoulders. It improves stability, posture, and overall strength.",
    muscleGroups: ["Core", "Shoulders", "Hamstrings", "Back"],
    goals: ["Strength", "Flexibility", "Mobility"],
    types: ["Bodyweight", "Dynamic"],
    tips: [
      "Start in standing position with feet shoulder-width apart",
      "Bend at waist and place hands on floor, keep legs straight",
      "Walk hands forward as far as you can",
      "Walk hands back to feet and repeat without standing",
    ],
    modelAvailable: true,
    rotatedModel: true,
    scaledModel: true,
    zRotationMul: 0.33,
    scaleMul: 0.3,
    modelLink: "https://sketchfab.com/models/78bb64dbb876415fa50f8544a2afa7d8/embed?autostart=1&dnt=1",
    refLink: "https://www.exercise.com/exercises/pike-walk",
  },
  {
    id: 11,
    title: "Mountain Pose (Tadasana)",
    type: "Yoga",
    duration: 30,
    difficulty: "Beginner",
    imageUrl: tadasanaImg,
    modelName: "tadasana",
    video_url: "https://www.youtube.com/embed/bEZq7vmP00w",
    description: "Mountain Pose is a foundational standing yoga posture that improves posture, balance, and calm focus.",
    muscleGroups: ["Legs", "Core", "Back"],
    goals: ["Balance", "Posture", "Focus"],
    types: ["Yoga", "Standing"],
    tips: [
      "Stand with feet hip-width apart",
      "Distribute weight evenly across both feet",
      "Engage your thighs and lift your kneecaps",
      "Draw your shoulders back and down",
    ],
  },
  {
    id: 12,
    title: "Warrior I Pose",
    type: "Yoga",
    duration: 45,
    difficulty: "Beginner",
    imageUrl: warriorIImg,
    modelName: "warrior1",
    video_url: "https://www.youtube.com/embed/YDJu4w8d6nE",
    description: "Warrior I is a foundational standing pose that strengthens the legs and opens the hips and chest.",
    muscleGroups: ["Legs", "Hips", "Shoulders", "Back"],
    goals: ["Strength", "Balance", "Focus"],
    types: ["Yoga", "Standing"],
    tips: [
      "Keep your hips square to the front",
      "Reach your arms overhead",
      "Bend your front knee to 90 degrees",
      "Press through your back heel",
    ],
  },
  {
    id: 13,
    title: "Warrior II Pose",
    type: "Yoga",
    duration: 45,
    difficulty: "Beginner",
    imageUrl: warriorIIImg,
    modelName: "warrior2",
    video_url: "https://www.youtube.com/embed/buVfAekQd_I",
    description: "Warrior II is a powerful standing pose that builds strength and stamina while opening the hips and chest.",
    muscleGroups: ["Legs", "Hips", "Shoulders", "Core"],
    goals: ["Strength", "Flexibility", "Focus"],
    types: ["Yoga", "Standing"],
    tips: [
      "Keep your front knee aligned over your ankle",
      "Press firmly through the outer edge of your back foot",
      "Keep your arms parallel to the floor",
      "Gaze over your front fingertips",
    ],
  },
  {
    id: 14,
    title: "Tree Pose (Vrikshasana)",
    type: "Yoga",
    duration: 60,
    difficulty: "Beginner",
    imageUrl: vrikshasanaImg,
    modelName: "vrikshasana",
    video_url: "https://www.youtube.com/embed/vI9Y9_LsG5k",
    description: "Tree Pose is a balancing yoga posture that improves focus, strengthens legs, and enhances overall stability.",
    muscleGroups: ["Legs", "Core", "Ankles"],
    goals: ["Balance", "Focus", "Stability"],
    types: ["Yoga", "Standing"],
    tips: [
      "Find a focal point to help with balance",
      "Press your standing foot firmly into the ground",
      "Place your raised foot on your inner thigh or calf (avoid the knee)",
      "Bring your palms together at your heart or overhead",
    ],
  },
  {
    id: 15,
    title: "Chair Pose (Utkatasana)",
    type: "Yoga",
    duration: 45,
    difficulty: "Beginner",
    imageUrl: utkatasanaImg,
    modelName: "utkatasana",
    video_url: "https://www.youtube.com/embed/kp_RYI3LmOo",
    description: "Chair Pose is a standing yoga posture that strengthens the legs, core, and improves balance while building heat in the body.",
    muscleGroups: ["Quadriceps", "Glutes", "Core", "Ankles"],
    goals: ["Flexibility", "Balance", "Strength"],
    types: ["Yoga", "Standing"],
    tips: [
      "Keep your weight in your heels",
      "Reach arms overhead with palms facing each other",
      "Draw your navel toward your spine",
      "Keep your knees aligned with your toes",
    ],
  },
  {
    id: 16,
    title: "Eagle Pose",
    type: "Yoga",
    duration: 60,
    difficulty: "Intermediate",
    imageUrl: eagleImg,
    modelName: "eagle",
    video_url: "https://www.youtube.com/embed/gZz0jJyP0rk",
    description: "Eagle Pose is a balancing posture that improves concentration and strengthens the legs, ankles, and core.",
    muscleGroups: ["Legs", "Core", "Shoulders", "Ankles"],
    goals: ["Balance", "Focus", "Flexibility"],
    types: ["Yoga", "Standing"],
    tips: [
      "Wrap one leg around the other",
      "Cross your arms at the elbows",
      "Sink your hips down and back",
      "Keep your gaze steady",
    ],
  },
  {
    id: 17,
    title: "Garland Pose",
    type: "Yoga",
    duration: 45,
    difficulty: "Beginner",
    imageUrl: garlandImg,
    modelName: "garland",
    video_url: "https://www.youtube.com/embed/ey7WlOZHVYI",
    description: "Garland Pose is a deep squat that opens the hips and stretches the ankles, groin, and back.",
    muscleGroups: ["Hips", "Ankles", "Back", "Core"],
    goals: ["Flexibility", "Mobility"],
    types: ["Yoga", "Squat"],
    tips: [
      "Keep your feet flat on the ground",
      "Bring your palms together at your heart",
      "Use your elbows to press your knees apart",
      "Lengthen your spine",
    ],
  },
  {
    id: 18,
    title: "Half Moon Pose",
    type: "Yoga",
    duration: 45,
    difficulty: "Intermediate",
    imageUrl: halfmoonImg,
    modelName: "halfmoon",
    video_url: "https://www.youtube.com/embed/qvHfm5zb2ik",
    description: "Half Moon Pose is a balancing posture that strengthens the legs and core while improving coordination.",
    muscleGroups: ["Legs", "Core", "Hips", "Ankles"],
    goals: ["Balance", "Strength", "Coordination"],
    types: ["Yoga", "Balancing"],
    tips: [
      "Keep your supporting leg strong",
      "Stack your hips and shoulders",
      "Extend through your raised leg",
      "Use a block if needed",
    ],
  },
  {
    id: 19,
    title: "Big Toe Pose",
    type: "Yoga",
    duration: 45,
    difficulty: "Intermediate",
    imageUrl: bigtoeImg,
    modelName: "bigtoe",
    video_url: "https://www.youtube.com/embed/Bsq3F3X7HzE",
    description: "Big Toe Pose is a forward bend that stretches the hamstrings and calves while improving balance.",
    muscleGroups: ["Hamstrings", "Calves", "Back"],
    goals: ["Flexibility", "Balance"],
    types: ["Yoga", "Forward Bend"],
    tips: [
      "Keep your legs straight",
      "Engage your thighs",
      "Lengthen your spine",
      "Breathe deeply",
    ],
  },
  {
    id: 20,
    title: "Gate Pose",
    type: "Yoga",
    duration: 45,
    difficulty: "Beginner",
    imageUrl: gateImg,
    modelName: "gate",
    video_url: "https://www.youtube.com/embed/5LkTIwZoazI",
    description: "Gate Pose is a kneeling side stretch that opens the side body and stretches the hamstrings.",
    muscleGroups: ["Obliques", "Hamstrings", "Shoulders"],
    goals: ["Flexibility", "Stretch"],
    types: ["Yoga", "Side Stretch"],
    tips: [
      "Keep your extended leg straight",
      "Reach your arm overhead",
      "Keep your hips facing forward",
      "Breathe into the stretch",
    ],
  },
  {
    id: 21,
    title: "Revolved Triangle Pose",
    type: "Yoga",
    duration: 45,
    difficulty: "Intermediate",
    imageUrl: parivrttatrikonasanaImg,
    modelName: "revolvedtriangle",
    video_url: "https://www.youtube.com/embed/5d1RqEzP2LU",
    description: "Revolved Triangle is a twisting pose that improves balance, stretches the hamstrings, and detoxifies the body.",
    muscleGroups: ["Hamstrings", "Hips", "Back", "Core"],
    goals: ["Flexibility", "Balance", "Detox"],
    types: ["Yoga", "Twist"],
    tips: [
      "Keep your hips level",
      "Twist from your torso",
      "Keep both legs straight",
      "Use a block for support if needed",
    ],
  },
  {
    id: 22,
    title: "Dancer Pose",
    type: "Yoga",
    duration: 30,
    difficulty: "Advanced",
    imageUrl: danceImg,
    modelName: "dancer",
    video_url: "https://www.youtube.com/embed/rV6CQjdU2fM",
    description: "Dancer Pose is an advanced balancing backbend that opens the chest and shoulders while strengthening the legs.",
    muscleGroups: ["Legs", "Back", "Shoulders", "Core"],
    goals: ["Balance", "Flexibility", "Strength"],
    types: ["Yoga", "Backbend"],
    tips: [
      "Keep your standing leg strong",
      "Reach back to grab your foot",
      "Lift your chest and extend forward",
      "Find a focal point for balance",
    ],
  },
];

// Approximate mapping of exercise type to muscle groups (ids correspond to Learn page muscle groups)
export const TYPE_TO_MUSCLES = {
  Strength: [1, 2, 5], // Chest, Back, Arms
  Cardio: [3], // Legs
  Yoga: [3, 4, 5], // Legs, Shoulders, Arms
};

// Mapping from type/difficulty to goal ids (matching Learn page dummy goals)
export const GOAL_MAP = (type, difficulty) => {
  const goals = [];
  if (type === "Strength") goals.push(1); // Strength
  if (type === "Cardio") goals.push(2); // Endurance
  if (type === "Yoga") goals.push(3, 4); // Flexibility, Mobility
  if (difficulty === "Advanced") goals.push(1); // Add strength goal for advanced
  return goals;
};

// Pre-augmented dataset tailored for Learn page filters
export const LEARN_EXERCISES = EXERCISES.map((ex) => ({
  id: ex.id,
  name: ex.title,
  muscleGroupIds: TYPE_TO_MUSCLES[ex.type] || [0],
  goalIds: GOAL_MAP(ex.type, ex.difficulty),
  thumbnail: ex.imageUrl,
  duration: ex.duration,
  difficulty: ex.difficulty,
  hasMuscleGroup: (mgId) => (TYPE_TO_MUSCLES[ex.type] || []).includes(mgId),
  hasGoal: (gId) => GOAL_MAP(ex.type, ex.difficulty).includes(gId),
}));

// ==========================================
// WORKOUT DATA FOR AR/LANDING PAGE
// ==========================================

// Generate workout data dynamically from EXERCISES for backwards compatibility
const workoutData = {
  title: "Workouts",
  description:
    "Our platform offers a diverse range of workouts, from fundamental exercises like squats and push-ups. With AR and AI technology, our virtual trainer guides and tracks your progress, helping you to improve your performance and achieve your fitness goals with precision and efficiency.",
  exploreText: "Let's Do It",
  servicesList: EXERCISES.filter(ex => ex.modelAvailable).slice(0, 11).map((ex, idx) => ({
    id: idx + 1,
    title: ex.title,
    desc: ex.description,
    poster: ex.imageUrl,
    route: `/workouts/${ex.modelName}`,
  })),
  exerciseData: EXERCISES.filter(ex => ex.modelAvailable).reduce((acc, ex) => {
    acc[ex.modelName] = {
      name: ex.title,
      modelAvailable: ex.modelAvailable,
      rotatedModel: ex.rotatedModel,
      scaledModel: ex.scaledModel,
      zRotationMul: ex.zRotationMul,
      scaleMul: ex.scaleMul,
      modelLink: ex.modelLink,
      difficulty: ex.difficulty === "Advanced" ? "hard" : ex.difficulty === "Intermediate" ? "medium" : "easy",
      refLink: ex.refLink,
      tips: ex.tips || [],
    };
    return acc;
  }, {}),
};

export default workoutData;

// ==========================================
// HELPER FUNCTIONS AND EXPORTS
// ==========================================

// Export exercise details as object keyed by ID for LearnExercise page
export const EXERCISE_DETAILS = EXERCISES.reduce((acc, exercise) => {
  acc[exercise.id] = {
    id: exercise.id,
    name: exercise.title,
    modelName: exercise.modelName,
    video_url: exercise.video_url,
    description: exercise.description,
    duration: typeof exercise.duration === 'number' ? `${exercise.duration} minutes` : exercise.duration,
    difficulty: exercise.difficulty,
    muscleGroups: exercise.muscleGroups || [],
    goals: exercise.goals || [],
    types: exercise.types || [],
    tips: exercise.tips || [],
    imageUrl: exercise.imageUrl,
  };
  return acc;
}, {});

// Helper function to get exercise by ID
export const getExerciseById = (id) => {
  return EXERCISE_DETAILS[id] || null;
};

// Helper function to get exercise by model name
export const getExerciseByModelName = (modelName) => {
  return EXERCISES.find(ex => ex.modelName === modelName) || null;
};
