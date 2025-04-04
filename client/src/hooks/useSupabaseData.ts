import { useQueryClient } from '@tanstack/react-query';
import { useSupabase } from './useSupabase';
import * as supabaseService from '@/services/supabaseService';
import { CalorieEntry, WeightEntry, WorkoutEntry, RecentActivity } from '@/types';
import { supabase } from '@/lib/supabase';

export function useSupabaseData() {
  const { user } = useSupabase();
  const queryClient = useQueryClient();
  
  // Calories related functions
  const getCalorieEntries = async (): Promise<CalorieEntry[]> => {
    // Get current user from Supabase directly
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser?.id) {
      console.error('User not authenticated when trying to get calorie entries');
      return [];
    }
    
    return await supabaseService.getCalorieEntries(currentUser.id);
  };
  
  const createCalorieEntry = async (data: Omit<CalorieEntry, 'id' | 'userId' | 'createdAt'>): Promise<CalorieEntry> => {
    try {
      // Get current user from Supabase directly to ensure we have the most up-to-date session
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser?.id) {
        console.error('User not authenticated when trying to create calorie entry');
        throw new Error('User not authenticated');
      }
      
      // Ensure all data is properly formatted
      const formattedData = {
        ...data,
        date: data.date instanceof Date ? data.date : new Date(data.date),
        totalCalories: Number(data.totalCalories),
        protein: data.protein !== undefined ? Number(data.protein) : undefined,
        carbs: data.carbs !== undefined ? Number(data.carbs) : undefined,
        fat: data.fat !== undefined ? Number(data.fat) : undefined,
      };
      
      console.log('Creating calorie entry with data:', formattedData);
      
      const newEntry = await supabaseService.createCalorieEntry(currentUser.id, formattedData);
      queryClient.invalidateQueries({ queryKey: ['calories'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
      return newEntry;
    } catch (error) {
      console.error('Error creating calorie entry:', error);
      throw error;
    }
  };
  
  const updateCalorieEntry = async (id: number, data: Partial<Omit<CalorieEntry, 'id' | 'userId' | 'createdAt'>>): Promise<CalorieEntry> => {
    // Get current user from Supabase directly
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser?.id) {
      console.error('User not authenticated when trying to update calorie entry');
      throw new Error('User not authenticated');
    }
    
    const updatedEntry = await supabaseService.updateCalorieEntry(id, data);
    queryClient.invalidateQueries({ queryKey: ['calories'] });
    queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
    return updatedEntry;
  };
  
  const deleteCalorieEntry = async (id: number): Promise<boolean> => {
    // Get current user from Supabase directly
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser?.id) {
      console.error('User not authenticated when trying to delete calorie entry');
      throw new Error('User not authenticated');
    }
    
    const success = await supabaseService.deleteCalorieEntry(id);
    queryClient.invalidateQueries({ queryKey: ['calories'] });
    queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
    return success;
  };
  
  // Weight related functions
  const getWeightEntries = async (): Promise<WeightEntry[]> => {
    // Get current user from Supabase directly
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser?.id) {
      console.error('User not authenticated when trying to get weight entries');
      return [];
    }
    
    return await supabaseService.getWeightEntries(currentUser.id);
  };
  
  const createWeightEntry = async (data: Omit<WeightEntry, 'id' | 'userId' | 'createdAt'>): Promise<WeightEntry> => {
    try {
      // Get current user from Supabase directly to ensure we have the most up-to-date session
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser?.id) {
        console.error('User not authenticated when trying to create weight entry');
        throw new Error('User not authenticated');
      }
      
      // Ensure all data is properly formatted
      const formattedData = {
        ...data,
        date: data.date instanceof Date ? data.date : new Date(data.date),
        weight: Number(data.weight),
        notes: data.notes || undefined
      };
      
      console.log('Creating weight entry with data:', formattedData);
      
      const newEntry = await supabaseService.createWeightEntry(currentUser.id, formattedData);
      queryClient.invalidateQueries({ queryKey: ['weights'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
      return newEntry;
    } catch (error) {
      console.error('Error creating weight entry:', error);
      throw error;
    }
  };
  
  const updateWeightEntry = async (id: number, data: Partial<Omit<WeightEntry, 'id' | 'userId' | 'createdAt'>>): Promise<WeightEntry> => {
    // Get current user from Supabase directly
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser?.id) {
      console.error('User not authenticated when trying to update weight entry');
      throw new Error('User not authenticated');
    }
    
    const updatedEntry = await supabaseService.updateWeightEntry(id, data);
    queryClient.invalidateQueries({ queryKey: ['weights'] });
    queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
    return updatedEntry;
  };
  
  const deleteWeightEntry = async (id: number): Promise<boolean> => {
    // Get current user from Supabase directly
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser?.id) {
      console.error('User not authenticated when trying to delete weight entry');
      throw new Error('User not authenticated');
    }
    
    const success = await supabaseService.deleteWeightEntry(id);
    queryClient.invalidateQueries({ queryKey: ['weights'] });
    queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
    return success;
  };
  
  // Workout related functions
  const getWorkoutEntries = async (): Promise<WorkoutEntry[]> => {
    // Get current user from Supabase directly
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser?.id) {
      console.error('User not authenticated when trying to get workout entries');
      return [];
    }
    
    return await supabaseService.getWorkoutEntries(currentUser.id);
  };
  
  const createWorkoutEntry = async (data: Omit<WorkoutEntry, 'id' | 'userId' | 'createdAt'>): Promise<WorkoutEntry> => {
    try {
      // Get current user from Supabase directly to ensure we have the most up-to-date session
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser?.id) {
        console.error('User not authenticated when trying to create workout');
        throw new Error('User not authenticated');
      }
      
      // Ensure all data is properly formatted
      const formattedData = {
        ...data,
        date: data.date instanceof Date ? data.date : new Date(data.date),
        duration: Number(data.duration),
        type: data.type || 'other',
        intensity: data.intensity || 'medium',
        notes: data.notes || undefined
      };
      
      console.log('Creating workout entry with data:', formattedData);
      
      const newEntry = await supabaseService.createWorkoutEntry(currentUser.id, formattedData);
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
      return newEntry;
    } catch (error) {
      console.error('Error creating workout entry:', error);
      throw error;
    }
  };
  
  const updateWorkoutEntry = async (id: number, data: Partial<Omit<WorkoutEntry, 'id' | 'userId' | 'createdAt'>>): Promise<WorkoutEntry> => {
    // Get current user from Supabase directly
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser?.id) {
      console.error('User not authenticated when trying to update workout');
      throw new Error('User not authenticated');
    }
    
    const updatedEntry = await supabaseService.updateWorkoutEntry(id, data);
    queryClient.invalidateQueries({ queryKey: ['workouts'] });
    queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
    return updatedEntry;
  };
  
  const deleteWorkoutEntry = async (id: number): Promise<boolean> => {
    // Get current user from Supabase directly
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser?.id) {
      console.error('User not authenticated when trying to delete workout');
      throw new Error('User not authenticated');
    }
    
    const success = await supabaseService.deleteWorkoutEntry(id);
    queryClient.invalidateQueries({ queryKey: ['workouts'] });
    queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
    return success;
  };
  
  // Recent activity
  const getRecentActivity = async (limit?: number): Promise<RecentActivity[]> => {
    // Get current user from Supabase directly
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser?.id) {
      console.error('User not authenticated when trying to get recent activity');
      return [];
    }
    
    return await supabaseService.getRecentActivity(currentUser.id, limit);
  };
  
  return {
    getCalorieEntries,
    createCalorieEntry,
    updateCalorieEntry,
    deleteCalorieEntry,
    
    getWeightEntries,
    createWeightEntry,
    updateWeightEntry,
    deleteWeightEntry,
    
    getWorkoutEntries,
    createWorkoutEntry,
    updateWorkoutEntry,
    deleteWorkoutEntry,
    
    getRecentActivity
  };
}