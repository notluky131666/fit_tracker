import { ChartData, CalorieEntry, WeightEntry, WorkoutEntry } from '@/types';
import { format, subDays, subMonths, subYears, startOfWeek, endOfWeek } from 'date-fns';

/**
 * Generates a linear gradient for chart backgrounds
 */
export const createGradient = (
  ctx: CanvasRenderingContext2D, 
  color1: string, 
  color2: string
): CanvasGradient => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
};

/**
 * Generates data for week-based charts with proper day labeling
 */
export const generateWeeklyLabels = (): string[] => {
  const today = new Date();
  const dayLabels = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    dayLabels.push(format(date, 'EEE'));
  }
  
  return dayLabels;
};

/**
 * Generates monthly labels for charts
 */
export const generateMonthlyLabels = (): string[] => {
  const today = new Date();
  const monthLabels = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(today, i);
    monthLabels.push(format(date, 'MMM'));
  }
  
  return monthLabels;
};

/**
 * Calculates the weekly average for a specific metric
 */
export const calculateWeeklyAverage = <T extends CalorieEntry | WeightEntry | WorkoutEntry>(
  data: T[], 
  key: keyof T
): number => {
  if (!data.length) return 0;
  
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  
  const weekData = data.filter(
    item => {
      const itemDate = new Date(item.date);
      return itemDate >= weekStart && itemDate <= weekEnd;
    }
  );
  
  if (!weekData.length) return 0;
  
  const sum = weekData.reduce((acc, item) => {
    const value = item[key];
    return acc + (typeof value === 'number' ? value : 0);
  }, 0);
  
  return sum / weekData.length;
};

/**
 * Maps workout type codes to readable labels
 */
export const getWorkoutTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    upper: 'Upper Body',
    lower: 'Lower Body',
    full: 'Full Body',
    cardio: 'Cardio',
    hiit: 'HIIT',
    other: 'Other'
  };
  
  return typeMap[type] || type;
};

/**
 * Generate chart color theme based on variant
 */
export const getChartColorTheme = (): {
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
} => {
  return {
    primary: 'hsl(235 81% 48%)',
    secondary: 'hsl(160 84% 39%)',
    tertiary: 'hsl(40 96% 53%)',
    quaternary: 'hsl(340 82% 52%)'
  };
};
