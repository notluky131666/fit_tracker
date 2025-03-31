// Type definitions for the application

export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface CalorieEntry {
  id: number;
  userId: number;
  date: Date;
  totalCalories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notes?: string;
  createdAt: Date;
}

export interface WeightEntry {
  id: number;
  userId: number;
  date: Date;
  weight: number;
  notes?: string;
  createdAt: Date;
}

export interface WorkoutEntry {
  id: number;
  userId: number;
  date: Date;
  type: string;
  duration: number;
  intensity: string;
  notes?: string;
  createdAt: Date;
}

export interface RecentActivity {
  id: number;
  type: 'calorie' | 'weight' | 'workout' | 'unknown';
  date: Date;
  metric: string;
  value: string;
  createdAt: Date;
}

export type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface ChartData {
  labels: string[];
  datasets: {
    label?: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string | string[];
    fill?: boolean;
    tension?: number;
    yAxisID?: string;
  }[];
}

export interface CalorieFormData {
  date: Date;
  totalCalories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notes?: string;
}

export interface WeightFormData {
  date: Date;
  weight: number;
  notes?: string;
}

export interface WorkoutFormData {
  date: Date;
  type: string;
  duration: number;
  intensity: string;
  notes?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

export interface MetricSummary {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  progress: number;
  goal: string | number;
  unit?: string;
  achieved?: string;
  changeValue?: string;
  color: string;
}
