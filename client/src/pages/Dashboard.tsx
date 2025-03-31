import React from 'react';
import { useQuery } from '@tanstack/react-query';
import MetricSummaries from '@/components/MetricSummaries';
import RecentActivity from '@/components/RecentActivity';
import WeeklyProgressChart from '@/components/charts/WeeklyProgressChart';
import { MetricSummary, ChartData, RecentActivity as RecentActivityType } from '@/types';
import { subDays, format } from 'date-fns';
import { useSupabaseData } from '@/hooks/useSupabaseData';

const Dashboard: React.FC = () => {
  const { 
    getRecentActivity,
    getCalorieEntries,
    getWeightEntries,
    getWorkoutEntries
  } = useSupabaseData();

  // Fetch recent activities
  const {
    data: recentActivities,
    isLoading: isLoadingActivities,
  } = useQuery<RecentActivityType[]>({
    queryKey: ['recent-activity'],
    queryFn: () => getRecentActivity()
  });

  // Fetch calorie data for dashboard metrics
  const {
    data: caloriesData,
    isLoading: isLoadingCalories,
  } = useQuery({
    queryKey: ['calories'],
    queryFn: getCalorieEntries
  });

  // Fetch weight data for dashboard metrics
  const {
    data: weightsData,
    isLoading: isLoadingWeights,
  } = useQuery({
    queryKey: ['weights'],
    queryFn: getWeightEntries
  });

  // Fetch workout data for dashboard metrics
  const {
    data: workoutsData,
    isLoading: isLoadingWorkouts,
  } = useQuery({
    queryKey: ['workouts'],
    queryFn: getWorkoutEntries
  });

  // Generate data for metrics summaries
  const getMetrics = (): MetricSummary[] => {
    const dailyCaloriesGoal = 2500;
    const weightGoal = 175;
    const weeklyWorkoutsGoal = 5;

    // Calorie metric
    const latestCalories = caloriesData?.[0]?.totalCalories || 0;
    const caloriesPercentage = Math.min(Math.round((latestCalories / dailyCaloriesGoal) * 100), 100);

    // Weight metric
    const currentWeight = weightsData?.[0]?.weight || 0;
    const startWeight = 190; // This would typically be calculated or stored
    const weightProgress = Math.round(((startWeight - currentWeight) / (startWeight - weightGoal)) * 100);

    // Workout metric
    const now = new Date();
    const weekStart = subDays(now, 7);
    const weeklyWorkouts = workoutsData?.filter(
      (workout: any) => new Date(workout.date) >= weekStart
    )?.length || 0;
    const workoutPercentage = Math.min(Math.round((weeklyWorkouts / weeklyWorkoutsGoal) * 100), 100);

    return [
      {
        title: 'Daily Calories',
        value: latestCalories || '-',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-xl">
            <path d="M11 12H3v9h18v-9h-8" />
            <path d="M8 12V7c0-2.2 1.8-4 4-4s4 1.8 4 4v5" />
          </svg>
        ),
        progress: caloriesPercentage,
        goal: `${dailyCaloriesGoal}`,
        achieved: `${caloriesPercentage}% achieved`,
        color: 'bg-primary/10 text-primary'
      },
      {
        title: 'Current Weight',
        value: currentWeight,
        unit: 'lbs',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-xl">
            <path d="M6 18h12" />
            <path d="M6 14h12" />
            <path d="M6 10h12" />
            <path d="M6 6h12" />
          </svg>
        ),
        progress: weightProgress,
        goal: `${weightGoal} lbs`,
        changeValue: currentWeight > 0 ? `-${(startWeight - currentWeight).toFixed(1)} lbs total` : '',
        color: 'bg-amber-100 text-amber-500'
      },
      {
        title: 'Weekly Workouts',
        value: weeklyWorkouts,
        unit: 'sessions',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-xl">
            <path d="M4 15v3c0 1.1.9 2 2 2h3" />
            <path d="M15 20h3c1.1 0 2-.9 2-2v-3" />
            <path d="M20 9V6c0-1.1-.9-2-2-2h-3" />
            <path d="M9 4H6c-1.1 0-2 .9-2 2v3" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ),
        progress: workoutPercentage,
        goal: `${weeklyWorkoutsGoal} sessions`,
        achieved: `${workoutPercentage}% achieved`,
        color: 'bg-green-100 text-green-600'
      }
    ];
  };

  // Generate chart data for the weekly progress
  const getWeeklyChartData = (): ChartData => {
    const now = new Date();
    const lastSevenDays = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(now, 6 - i);
      return format(date, 'EEE');
    });

    // Process actual data from Supabase
    const sevenDaysAgo = subDays(now, 6);
    
    // Map for calories by day
    const caloriesByDay = new Map();
    const weightsByDay = new Map();

    // Initialize with empty values for all 7 days
    for (let i = 0; i < 7; i++) {
      const date = subDays(now, 6 - i);
      const dayKey = format(date, 'EEE');
      caloriesByDay.set(dayKey, null);
      weightsByDay.set(dayKey, null);
    }

    // Fill in actual calorie values where available
    caloriesData?.forEach(entry => {
      const entryDate = new Date(entry.date);
      if (entryDate >= sevenDaysAgo && entryDate <= now) {
        const dayKey = format(entryDate, 'EEE');
        caloriesByDay.set(dayKey, entry.totalCalories);
      }
    });

    // Fill in actual weight values where available
    weightsData?.forEach(entry => {
      const entryDate = new Date(entry.date);
      if (entryDate >= sevenDaysAgo && entryDate <= now) {
        const dayKey = format(entryDate, 'EEE');
        weightsByDay.set(dayKey, entry.weight);
      }
    });

    // Get the values in the correct order
    const caloriesValues = lastSevenDays.map(day => caloriesByDay.get(day) || 0);
    const weightValues = lastSevenDays.map(day => weightsByDay.get(day) || 0);

    return {
      labels: lastSevenDays,
      datasets: [
        {
          label: 'Calories (hundreds)',
          data: caloriesValues.map(c => c / 100),
          borderColor: 'hsl(235 81% 48%)',
          backgroundColor: 'hsla(235, 81%, 48%, 0.1)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Weight (lbs)',
          data: weightValues,
          borderColor: 'hsl(40, 96%, 53%)',
          backgroundColor: 'hsla(40, 96%, 53%, 0.1)',
          fill: true,
          tension: 0.3,
          yAxisID: 'y1'
        }
      ]
    };
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <MetricSummaries metrics={getMetrics()} />
      
      <RecentActivity 
        activities={recentActivities || []} 
        isLoading={isLoadingActivities} 
      />
      
      <WeeklyProgressChart 
        title="Weekly Progress" 
        chartData={getWeeklyChartData()} 
      />
    </div>
  );
};

export default Dashboard;
