import {
  users, User, InsertUser,
  calories, Calorie, InsertCalorie,
  weights, Weight, InsertWeight,
  workouts, Workout, InsertWorkout
} from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Calorie operations
  getCalories(userId: number): Promise<Calorie[]>;
  getCalorieById(id: number): Promise<Calorie | undefined>;
  getCaloriesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Calorie[]>;
  createCalorie(calorie: InsertCalorie): Promise<Calorie>;
  updateCalorie(id: number, calorie: Partial<InsertCalorie>): Promise<Calorie | undefined>;
  deleteCalorie(id: number): Promise<boolean>;
  
  // Weight operations
  getWeights(userId: number): Promise<Weight[]>;
  getWeightById(id: number): Promise<Weight | undefined>;
  getWeightsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Weight[]>;
  createWeight(weight: InsertWeight): Promise<Weight>;
  updateWeight(id: number, weight: Partial<InsertWeight>): Promise<Weight | undefined>;
  deleteWeight(id: number): Promise<boolean>;
  
  // Workout operations
  getWorkouts(userId: number): Promise<Workout[]>;
  getWorkoutById(id: number): Promise<Workout | undefined>;
  getWorkoutsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Workout[]>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  updateWorkout(id: number, workout: Partial<InsertWorkout>): Promise<Workout | undefined>;
  deleteWorkout(id: number): Promise<boolean>;
  
  // Activity operations
  getRecentActivity(userId: number, limit?: number): Promise<(Calorie | Weight | Workout)[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private calorieEntries: Map<number, Calorie>;
  private weightEntries: Map<number, Weight>;
  private workoutEntries: Map<number, Workout>;
  
  private userIdCounter: number;
  private calorieIdCounter: number;
  private weightIdCounter: number;
  private workoutIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.calorieEntries = new Map();
    this.weightEntries = new Map();
    this.workoutEntries = new Map();
    
    this.userIdCounter = 1;
    this.calorieIdCounter = 1;
    this.weightIdCounter = 1;
    this.workoutIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  // Calorie methods
  async getCalories(userId: number): Promise<Calorie[]> {
    return Array.from(this.calorieEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }
  
  async getCalorieById(id: number): Promise<Calorie | undefined> {
    return this.calorieEntries.get(id);
  }
  
  async getCaloriesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Calorie[]> {
    return Array.from(this.calorieEntries.values())
      .filter(entry => 
        entry.userId === userId && 
        entry.date >= startDate && 
        entry.date <= endDate
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  
  async createCalorie(insertCalorie: InsertCalorie): Promise<Calorie> {
    const id = this.calorieIdCounter++;
    const createdAt = new Date();
    const entry: Calorie = { ...insertCalorie, id, createdAt };
    this.calorieEntries.set(id, entry);
    return entry;
  }
  
  async updateCalorie(id: number, calorie: Partial<InsertCalorie>): Promise<Calorie | undefined> {
    const existingEntry = this.calorieEntries.get(id);
    if (!existingEntry) return undefined;
    
    const updatedEntry = { ...existingEntry, ...calorie };
    this.calorieEntries.set(id, updatedEntry);
    return updatedEntry;
  }
  
  async deleteCalorie(id: number): Promise<boolean> {
    return this.calorieEntries.delete(id);
  }

  // Weight methods
  async getWeights(userId: number): Promise<Weight[]> {
    return Array.from(this.weightEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }
  
  async getWeightById(id: number): Promise<Weight | undefined> {
    return this.weightEntries.get(id);
  }
  
  async getWeightsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Weight[]> {
    return Array.from(this.weightEntries.values())
      .filter(entry => 
        entry.userId === userId && 
        entry.date >= startDate && 
        entry.date <= endDate
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  
  async createWeight(insertWeight: InsertWeight): Promise<Weight> {
    const id = this.weightIdCounter++;
    const createdAt = new Date();
    const entry: Weight = { ...insertWeight, id, createdAt };
    
    // Check for duplicate date
    const existingEntry = Array.from(this.weightEntries.values()).find(
      w => w.userId === insertWeight.userId && w.date.toDateString() === insertWeight.date.toDateString()
    );
    
    if (existingEntry) {
      // Update instead of creating new
      return this.updateWeight(existingEntry.id, insertWeight) as Promise<Weight>;
    }
    
    this.weightEntries.set(id, entry);
    return entry;
  }
  
  async updateWeight(id: number, weight: Partial<InsertWeight>): Promise<Weight | undefined> {
    const existingEntry = this.weightEntries.get(id);
    if (!existingEntry) return undefined;
    
    const updatedEntry = { ...existingEntry, ...weight };
    this.weightEntries.set(id, updatedEntry);
    return updatedEntry;
  }
  
  async deleteWeight(id: number): Promise<boolean> {
    return this.weightEntries.delete(id);
  }

  // Workout methods
  async getWorkouts(userId: number): Promise<Workout[]> {
    return Array.from(this.workoutEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }
  
  async getWorkoutById(id: number): Promise<Workout | undefined> {
    return this.workoutEntries.get(id);
  }
  
  async getWorkoutsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Workout[]> {
    return Array.from(this.workoutEntries.values())
      .filter(entry => 
        entry.userId === userId && 
        entry.date >= startDate && 
        entry.date <= endDate
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  
  async createWorkout(insertWorkout: InsertWorkout): Promise<Workout> {
    const id = this.workoutIdCounter++;
    const createdAt = new Date();
    const entry: Workout = { ...insertWorkout, id, createdAt };
    this.workoutEntries.set(id, entry);
    return entry;
  }
  
  async updateWorkout(id: number, workout: Partial<InsertWorkout>): Promise<Workout | undefined> {
    const existingEntry = this.workoutEntries.get(id);
    if (!existingEntry) return undefined;
    
    const updatedEntry = { ...existingEntry, ...workout };
    this.workoutEntries.set(id, updatedEntry);
    return updatedEntry;
  }
  
  async deleteWorkout(id: number): Promise<boolean> {
    return this.workoutEntries.delete(id);
  }
  
  // Activity methods for dashboard
  async getRecentActivity(userId: number, limit: number = 10): Promise<(Calorie | Weight | Workout)[]> {
    const userCalories = Array.from(this.calorieEntries.values())
      .filter(entry => entry.userId === userId);
      
    const userWeights = Array.from(this.weightEntries.values())
      .filter(entry => entry.userId === userId);
      
    const userWorkouts = Array.from(this.workoutEntries.values())
      .filter(entry => entry.userId === userId);
    
    // Combine all activities
    const allActivities = [
      ...userCalories,
      ...userWeights,
      ...userWorkouts
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return allActivities.slice(0, limit);
  }
}

export const storage = new MemStorage();
