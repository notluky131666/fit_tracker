import React from 'react';
import { useQuery } from '@tanstack/react-query';
import MetricSummaries from '@/components/MetricSummaries';
import RecentActivity from '@/components/RecentActivity';
import WeeklyProgressChart from '@/components/charts/WeeklyProgressChart';
import { MetricSummary, ChartData, RecentActivity as RecentActivityType } from '@/types';
import { subDays, format } from 'date-fns';

const Dashboard: React.FC = () => {
  // Fetch recent activities
  const {
    data: recentActivities,
    isLoading: isLoadingActivities,
  } = useQuery<RecentActivityType[]>({
    queryKey: ['/api/activity/recent'],
  });

  // Fetch calorie data for dashboard metrics
  const {
    data: caloriesData,
    isLoading: isLoadingCalories,
  } = useQuery({
    queryKey: ['/api/calories'],
  });

  // Fetch weight data for dashboard metrics
  const {
    data: weightsData,
    isLoading: isLoadingWeights,
  } = useQuery({
    queryKey: ['/api/weights'],
  });

  // Fetch workout data for dashboard metrics
  const {
    data: workoutsData,
    isLoading: isLoadingWorkouts,
  } = useQuery({
    queryKey: ['/api/workouts'],
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
    const lastSevenDays = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return format(date, 'EEE');
    });

    // Placeholder data - in a real app this would use actual data
    const caloriesValues = [2240, 2180, 2340, 2420, 2100, 2550, 2340];
    const weightValues = [186.4, 186.1, 185.8, 185.5, 185.7, 185.2, 185.0];

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
