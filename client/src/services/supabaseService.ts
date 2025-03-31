import { supabase } from '@/lib/supabase';
import { CalorieEntry, WeightEntry, WorkoutEntry, RecentActivity } from '@/types';

// User related functions
export const createUserProfile = async (userId: string, username: string, email: string, fullName?: string) => {
  return await supabase
    .from('users')
    .insert([
      { 
        id: userId, 
        username, 
        email, 
        full_name: fullName,
        created_at: new Date().toISOString()
      }
    ]);
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

// Calories related functions
export const getCalorieEntries = async (userId: string) => {
  const { data, error } = await supabase
    .from('calories')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  
  if (error) throw error;
  
  return data.map(entry => ({
    id: entry.id,
    userId: entry.user_id,
    date: new Date(entry.date),
    totalCalories: entry.total_calories,
    protein: entry.protein,
    carbs: entry.carbs,
    fat: entry.fat,
    notes: entry.notes,
    createdAt: new Date(entry.created_at)
  })) as CalorieEntry[];
};

export const createCalorieEntry = async (userId: string, entryData: Omit<CalorieEntry, 'id' | 'userId' | 'createdAt'>) => {
  try {
    console.log('Supabase createCalorieEntry - userId:', userId);
    console.log('Supabase createCalorieEntry - entryData:', JSON.stringify(entryData, null, 2));
    
    // Ensure proper data formatting
    const formattedCalories = Number(entryData.totalCalories);
    if (isNaN(formattedCalories)) {
      throw new Error(`Invalid calories value: ${entryData.totalCalories}`);
    }
    
    const insertData = { 
      user_id: userId, 
      date: entryData.date instanceof Date ? entryData.date.toISOString() : new Date(entryData.date).toISOString(),
      total_calories: formattedCalories,
      protein: entryData.protein !== undefined ? Number(entryData.protein) : null,
      carbs: entryData.carbs !== undefined ? Number(entryData.carbs) : null,
      fat: entryData.fat !== undefined ? Number(entryData.fat) : null,
      notes: entryData.notes || null,
      created_at: new Date().toISOString()
    };
    
    console.log('Supabase insertData:', JSON.stringify(insertData, null, 2));
    
    const { data, error } = await supabase
      .from('calories')
      .insert([insertData])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }
    
    if (!data) {
      console.error('No data returned from Supabase after insert');
      throw new Error('No data returned from database after insert');
    }
    
    console.log('Supabase createCalorieEntry - success response:', JSON.stringify(data, null, 2));
    
    return {
      id: data.id,
      userId: data.user_id,
      date: new Date(data.date),
      totalCalories: data.total_calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      notes: data.notes,
      createdAt: new Date(data.created_at)
    } as CalorieEntry;
  } catch (error) {
    console.error('Error in createCalorieEntry:', error);
    // Rethrow the error with more context
    if (error instanceof Error) {
      throw new Error(`Failed to create calorie entry: ${error.message}`);
    } else {
      throw new Error('Failed to create calorie entry: Unknown error');
    }
  }
};

export const updateCalorieEntry = async (entryId: number, entryData: Partial<Omit<CalorieEntry, 'id' | 'userId' | 'createdAt'>>) => {
  const updates: any = {};
  
  if (entryData.date) updates.date = entryData.date.toISOString();
  if (entryData.totalCalories !== undefined) updates.total_calories = entryData.totalCalories;
  if (entryData.protein !== undefined) updates.protein = entryData.protein;
  if (entryData.carbs !== undefined) updates.carbs = entryData.carbs;
  if (entryData.fat !== undefined) updates.fat = entryData.fat;
  if (entryData.notes !== undefined) updates.notes = entryData.notes;
  
  const { data, error } = await supabase
    .from('calories')
    .update(updates)
    .eq('id', entryId)
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    userId: data.user_id,
    date: new Date(data.date),
    totalCalories: data.total_calories,
    protein: data.protein,
    carbs: data.carbs,
    fat: data.fat,
    notes: data.notes,
    createdAt: new Date(data.created_at)
  } as CalorieEntry;
};

export const deleteCalorieEntry = async (entryId: number) => {
  const { error } = await supabase
    .from('calories')
    .delete()
    .eq('id', entryId);
  
  if (error) throw error;
  return true;
};

// Weight related functions
export const getWeightEntries = async (userId: string) => {
  const { data, error } = await supabase
    .from('weights')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  
  if (error) throw error;
  
  return data.map(entry => ({
    id: entry.id,
    userId: entry.user_id,
    date: new Date(entry.date),
    weight: entry.weight,
    notes: entry.notes,
    createdAt: new Date(entry.created_at)
  })) as WeightEntry[];
};

export const createWeightEntry = async (userId: string, entryData: Omit<WeightEntry, 'id' | 'userId' | 'createdAt'>) => {
  try {
    console.log('Supabase createWeightEntry - userId:', userId);
    console.log('Supabase createWeightEntry - entryData:', JSON.stringify(entryData, null, 2));
    
    // Ensure proper data formatting
    const formattedWeight = Number(entryData.weight);
    if (isNaN(formattedWeight)) {
      throw new Error(`Invalid weight value: ${entryData.weight}`);
    }
    
    const insertData = { 
      user_id: userId, 
      date: entryData.date instanceof Date ? entryData.date.toISOString() : new Date(entryData.date).toISOString(),
      weight: formattedWeight,
      notes: entryData.notes || null,
      created_at: new Date().toISOString()
    };
    
    console.log('Supabase insertData:', JSON.stringify(insertData, null, 2));
    
    const { data, error } = await supabase
      .from('weights')
      .insert([insertData])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }
    
    if (!data) {
      console.error('No data returned from Supabase after insert');
      throw new Error('No data returned from database after insert');
    }
    
    console.log('Supabase createWeightEntry - success response:', JSON.stringify(data, null, 2));
    
    return {
      id: data.id,
      userId: data.user_id,
      date: new Date(data.date),
      weight: data.weight,
      notes: data.notes,
      createdAt: new Date(data.created_at)
    } as WeightEntry;
  } catch (error) {
    console.error('Error in createWeightEntry:', error);
    // Rethrow the error with more context
    if (error instanceof Error) {
      throw new Error(`Failed to create weight entry: ${error.message}`);
    } else {
      throw new Error('Failed to create weight entry: Unknown error');
    }
  }
};

export const updateWeightEntry = async (entryId: number, entryData: Partial<Omit<WeightEntry, 'id' | 'userId' | 'createdAt'>>) => {
  const updates: any = {};
  
  if (entryData.date) updates.date = entryData.date.toISOString();
  if (entryData.weight !== undefined) updates.weight = entryData.weight;
  if (entryData.notes !== undefined) updates.notes = entryData.notes;
  
  const { data, error } = await supabase
    .from('weights')
    .update(updates)
    .eq('id', entryId)
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    userId: data.user_id,
    date: new Date(data.date),
    weight: data.weight,
    notes: data.notes,
    createdAt: new Date(data.created_at)
  } as WeightEntry;
};

export const deleteWeightEntry = async (entryId: number) => {
  const { error } = await supabase
    .from('weights')
    .delete()
    .eq('id', entryId);
  
  if (error) throw error;
  return true;
};

// Workout related functions
export const getWorkoutEntries = async (userId: string) => {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  
  if (error) throw error;
  
  return data.map(entry => ({
    id: entry.id,
    userId: entry.user_id,
    date: new Date(entry.date),
    type: entry.type,
    duration: entry.duration,
    intensity: entry.intensity,
    notes: entry.notes,
    createdAt: new Date(entry.created_at)
  })) as WorkoutEntry[];
};

export const createWorkoutEntry = async (userId: string, entryData: Omit<WorkoutEntry, 'id' | 'userId' | 'createdAt'>) => {
  try {
    console.log('Supabase createWorkoutEntry - userId:', userId);
    console.log('Supabase createWorkoutEntry - entryData:', JSON.stringify(entryData, null, 2));
    
    // Ensure proper data formatting
    const formattedDuration = Number(entryData.duration);
    if (isNaN(formattedDuration)) {
      throw new Error(`Invalid duration value: ${entryData.duration}`);
    }
    
    const insertData = { 
      user_id: userId, 
      date: entryData.date instanceof Date ? entryData.date.toISOString() : new Date(entryData.date).toISOString(),
      type: entryData.type || 'other',
      duration: formattedDuration,
      intensity: entryData.intensity || 'medium',
      notes: entryData.notes || null,
      created_at: new Date().toISOString()
    };
    
    console.log('Supabase insertData:', JSON.stringify(insertData, null, 2));
    
    const { data, error } = await supabase
      .from('workouts')
      .insert([insertData])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }
    
    if (!data) {
      console.error('No data returned from Supabase after insert');
      throw new Error('No data returned from database after insert');
    }
    
    console.log('Supabase createWorkoutEntry - success response:', JSON.stringify(data, null, 2));
    
    return {
      id: data.id,
      userId: data.user_id,
      date: new Date(data.date),
      type: data.type,
      duration: data.duration,
      intensity: data.intensity,
      notes: data.notes,
      createdAt: new Date(data.created_at)
    } as WorkoutEntry;
  } catch (error) {
    console.error('Error in createWorkoutEntry:', error);
    // Rethrow the error with more context
    if (error instanceof Error) {
      throw new Error(`Failed to create workout entry: ${error.message}`);
    } else {
      throw new Error('Failed to create workout entry: Unknown error');
    }
  }
};

export const updateWorkoutEntry = async (entryId: number, entryData: Partial<Omit<WorkoutEntry, 'id' | 'userId' | 'createdAt'>>) => {
  const updates: any = {};
  
  if (entryData.date) updates.date = entryData.date.toISOString();
  if (entryData.type !== undefined) updates.type = entryData.type;
  if (entryData.duration !== undefined) updates.duration = entryData.duration;
  if (entryData.intensity !== undefined) updates.intensity = entryData.intensity;
  if (entryData.notes !== undefined) updates.notes = entryData.notes;
  
  const { data, error } = await supabase
    .from('workouts')
    .update(updates)
    .eq('id', entryId)
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    userId: data.user_id,
    date: new Date(data.date),
    type: data.type,
    duration: data.duration,
    intensity: data.intensity,
    notes: data.notes,
    createdAt: new Date(data.created_at)
  } as WorkoutEntry;
};

export const deleteWorkoutEntry = async (entryId: number) => {
  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', entryId);
  
  if (error) throw error;
  return true;
};

// Recent activity
export const getRecentActivity = async (userId: string, limit: number = 10): Promise<RecentActivity[]> => {
  // Get recent calories
  const { data: caloriesData, error: caloriesError } = await supabase
    .from('calories')
    .select('id, date, total_calories, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (caloriesError) throw caloriesError;
  
  // Get recent weights
  const { data: weightsData, error: weightsError } = await supabase
    .from('weights')
    .select('id, date, weight, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (weightsError) throw weightsError;
  
  // Get recent workouts
  const { data: workoutsData, error: workoutsError } = await supabase
    .from('workouts')
    .select('id, date, type, duration, intensity, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (workoutsError) throw workoutsError;
  
  // Combine and format activities
  const calorieActivities = caloriesData.map(entry => ({
    id: entry.id,
    type: 'calorie' as const,
    date: new Date(entry.date),
    metric: 'Calories',
    value: `${entry.total_calories} cal`,
    createdAt: new Date(entry.created_at)
  }));
  
  const weightActivities = weightsData.map(entry => ({
    id: entry.id,
    type: 'weight' as const,
    date: new Date(entry.date),
    metric: 'Weight',
    value: `${entry.weight} kg`,
    createdAt: new Date(entry.created_at)
  }));
  
  const workoutActivities = workoutsData.map(entry => {
    // Map workout type to a readable label
    const typeLabels: Record<string, string> = {
      upper: 'Upper Body',
      lower: 'Lower Body',
      full: 'Full Body',
      cardio: 'Cardio',
      hiit: 'HIIT',
      other: 'Other'
    };
    
    return {
      id: entry.id,
      type: 'workout' as const,
      date: new Date(entry.date),
      metric: typeLabels[entry.type] || entry.type,
      value: `${entry.duration} min`,
      createdAt: new Date(entry.created_at)
    };
  });
  
  // Combine all activities and sort by creation date
  const allActivities = [...calorieActivities, ...weightActivities, ...workoutActivities]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
  
  return allActivities;
};