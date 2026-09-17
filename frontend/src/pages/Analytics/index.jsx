import React from 'react';
import { Flame, Clock, Dumbbell, Gauge } from 'lucide-react';
import StatCard from './StatCard';
import PerformanceChart from './PerformanceChart';
import WorkoutTable from './WorkoutTable';
import { theme } from '../../theme';

const Analytics = () => {
  const stats = [
    {
      icon: Flame,
      title: 'Total Calories',
      value: '2,840',
      unit: 'kcal',
      progress: 75,
      color: theme.colors.primary.pink,
    },
    {
      icon: Clock,
      title: 'Time Exercised',
      value: '5.2',
      unit: 'hours',
      progress: 65,
      color: theme.colors.primary.blue,
    },
    {
      icon: Dumbbell,
      title: 'Workouts',
      value: '12',
      unit: 'sessions',
      progress: 80,
      color: theme.colors.primary.green,
    },
    {
      icon: Gauge,
      title: 'Avg. Duration',
      value: '45',
      unit: 'min',
      progress: 70,
      color: theme.colors.primary.blueLight,
    },
  ];

  const performanceData = [
    { day: 'Mon', calories: 450, duration: 45 },
    { day: 'Tue', calories: 380, duration: 40 },
    { day: 'Wed', calories: 520, duration: 55 },
    { day: 'Thu', calories: 420, duration: 45 },
    { day: 'Fri', calories: 580, duration: 60 },
    { day: 'Sat', calories: 350, duration: 35 },
    { day: 'Sun', calories: 480, duration: 50 },
  ];

  const recentWorkouts = [
    {
      exercise: 'High Intensity Cardio',
      type: 'cardio',
      duration: 45,
      calories: 450,
      heartRate: 130,
      score: 92,
    },
    {
      exercise: 'Strength Training',
      type: 'strength',
      duration: 60,
      calories: 380,
      heartRate: 125,
      score: 88,
    },
    {
      exercise: 'Yoga Flow',
      type: 'yoga',
      duration: 30,
      calories: 200,
      heartRate: 110,
      score: 95,
    },
  ];

  return (
    <div className="space-y-7">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: theme.colors.text.primary }}>
            Your Performance
          </h1>
          <p style={{ color: theme.colors.text.secondary }}>
            Track your progress and analyze your exercise performance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="mb-8">
        <PerformanceChart data={performanceData} />
      </div>

      <div>
        <WorkoutTable workouts={recentWorkouts} />
      </div>
    </div>
  );
};

export default Analytics;
