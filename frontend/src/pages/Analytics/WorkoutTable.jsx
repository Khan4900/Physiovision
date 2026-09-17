import React from 'react';
import { Heart, Zap, Dumbbell, Activity } from 'lucide-react';
import { theme } from '../../theme';

const WorkoutTable = ({ workouts }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'cardio':
        return <Zap style={{ color: theme.colors.primary.blue }} className="w-5 h-5" />;
      case 'strength':
        return <Dumbbell style={{ color: theme.colors.primary.pink }} className="w-5 h-5" />;
      case 'yoga':
        return <Activity style={{ color: theme.colors.primary.green }} className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return theme.colors.primary.green;
    if (score >= 80) return theme.colors.primary.blue;
    return theme.colors.primary.pink;
  };

  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.light}`,
      }}
    >
      <h2 className="text-xl font-semibold mb-6" style={{ color: theme.colors.text.primary }}>
        Recent Workouts
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr style={{ borderBottom: `1px solid ${theme.colors.border.light}` }}>
              <th className="text-left py-4 px-6 font-normal" style={{ color: theme.colors.text.secondary }}>Exercise</th>
              <th className="text-left py-4 px-6 font-normal" style={{ color: theme.colors.text.secondary }}>Duration</th>
              <th className="text-left py-4 px-6 font-normal" style={{ color: theme.colors.text.secondary }}>Calories</th>
              <th className="text-left py-4 px-6 font-normal" style={{ color: theme.colors.text.secondary }}>Heart Rate</th>
              <th className="text-left py-4 px-6 font-normal" style={{ color: theme.colors.text.secondary }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {workouts.map((workout, index) => (
              <tr key={index} className="last:border-0" style={{ borderBottom: `1px solid ${theme.colors.border.light}` }}>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(workout.type)}
                    <span style={{ color: theme.colors.text.primary }}>{workout.exercise}</span>
                  </div>
                </td>
                <td className="py-4 px-6" style={{ color: theme.colors.text.primary }}>{workout.duration} min</td>
                <td className="py-4 px-6" style={{ color: theme.colors.text.primary }}>{workout.calories} kcal</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4" style={{ color: theme.colors.primary.pink }} />
                    <span style={{ color: theme.colors.text.primary }}>{workout.heartRate} bpm</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="font-medium" style={{ color: getScoreColor(workout.score) }}>
                    {workout.score}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkoutTable;
