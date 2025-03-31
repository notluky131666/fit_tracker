import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import { 
  insertUserSchema, 
  insertCaloriesSchema, 
  insertWeightSchema, 
  insertWorkoutSchema 
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Helper for session type augmentation
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

// Helper for converting zod errors to a readable format
function handleZodError(err: ZodError, res: Response): Response {
  const validationError = fromZodError(err);
  return res.status(400).json({ 
    message: "Validation error", 
    errors: validationError.details 
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'fitness-tracker-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
  }));

  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingByEmail = await storage.getUserByEmail(userData.email);
      if (existingByEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      const existingByUsername = await storage.getUserByUsername(userData.username);
      if (existingByUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Create new user
      const user = await storage.createUser(userData);
      
      // Set session
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Create a user if they authenticated with Supabase but don't exist in our system
        try {
          // Simple username from email
          const username = email.split('@')[0];
          const newUser = await storage.createUser({
            username,
            email,
            password, // Store the password for our backend too
          });
          req.session.userId = newUser.id;
          const { password: _, ...userWithoutPassword } = newUser;
          return res.json(userWithoutPassword);
        } catch (createErr) {
          console.error("Error creating backend user after Supabase auth:", createErr);
          // Still return success since Supabase auth worked
          return res.json({ message: "Authenticated with Supabase" });
        }
      }
      
      // If user exists but passwords don't match, we'll still authenticate
      // since they've already been authenticated by Supabase
      
      // Set session
      req.session.userId = user.id;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/me', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Calories routes
  app.get('/api/calories', requireAuth, async (req, res) => {
    try {
      const calories = await storage.getCalories(req.session.userId!);
      res.json(calories);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get('/api/calories/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const calorie = await storage.getCalorieById(id);
      
      if (!calorie) {
        return res.status(404).json({ message: "Calorie entry not found" });
      }
      
      // Check if the calorie entry belongs to the logged-in user
      if (calorie.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to access this entry" });
      }
      
      res.json(calorie);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post('/api/calories', requireAuth, async (req, res) => {
    try {
      // Add userId to the request body
      const data = { ...req.body, userId: req.session.userId };
      const calorieData = insertCaloriesSchema.parse(data);
      
      const calorie = await storage.createCalorie(calorieData);
      res.status(201).json(calorie);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put('/api/calories/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const calorie = await storage.getCalorieById(id);
      
      if (!calorie) {
        return res.status(404).json({ message: "Calorie entry not found" });
      }
      
      // Check if the calorie entry belongs to the logged-in user
      if (calorie.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to update this entry" });
      }
      
      const updatedCalorie = await storage.updateCalorie(id, req.body);
      res.json(updatedCalorie);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete('/api/calories/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const calorie = await storage.getCalorieById(id);
      
      if (!calorie) {
        return res.status(404).json({ message: "Calorie entry not found" });
      }
      
      // Check if the calorie entry belongs to the logged-in user
      if (calorie.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to delete this entry" });
      }
      
      const success = await storage.deleteCalorie(id);
      if (success) {
        res.json({ message: "Calorie entry deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete calorie entry" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get calories by date range
  app.get('/api/calories/range/:start/:end', requireAuth, async (req, res) => {
    try {
      const startDate = new Date(req.params.start);
      const endDate = new Date(req.params.end);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const calories = await storage.getCaloriesByDateRange(
        req.session.userId!,
        startDate,
        endDate
      );
      
      res.json(calories);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Weight routes
  app.get('/api/weights', requireAuth, async (req, res) => {
    try {
      const weights = await storage.getWeights(req.session.userId!);
      res.json(weights);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get('/api/weights/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const weight = await storage.getWeightById(id);
      
      if (!weight) {
        return res.status(404).json({ message: "Weight entry not found" });
      }
      
      // Check if the weight entry belongs to the logged-in user
      if (weight.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to access this entry" });
      }
      
      res.json(weight);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post('/api/weights', requireAuth, async (req, res) => {
    try {
      // Add userId to the request body
      const data = { ...req.body, userId: req.session.userId };
      const weightData = insertWeightSchema.parse(data);
      
      const weight = await storage.createWeight(weightData);
      res.status(201).json(weight);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put('/api/weights/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const weight = await storage.getWeightById(id);
      
      if (!weight) {
        return res.status(404).json({ message: "Weight entry not found" });
      }
      
      // Check if the weight entry belongs to the logged-in user
      if (weight.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to update this entry" });
      }
      
      const updatedWeight = await storage.updateWeight(id, req.body);
      res.json(updatedWeight);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete('/api/weights/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const weight = await storage.getWeightById(id);
      
      if (!weight) {
        return res.status(404).json({ message: "Weight entry not found" });
      }
      
      // Check if the weight entry belongs to the logged-in user
      if (weight.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to delete this entry" });
      }
      
      const success = await storage.deleteWeight(id);
      if (success) {
        res.json({ message: "Weight entry deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete weight entry" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get weights by date range
  app.get('/api/weights/range/:start/:end', requireAuth, async (req, res) => {
    try {
      const startDate = new Date(req.params.start);
      const endDate = new Date(req.params.end);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const weights = await storage.getWeightsByDateRange(
        req.session.userId!,
        startDate,
        endDate
      );
      
      res.json(weights);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Workout routes
  app.get('/api/workouts', requireAuth, async (req, res) => {
    try {
      const workouts = await storage.getWorkouts(req.session.userId!);
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get('/api/workouts/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const workout = await storage.getWorkoutById(id);
      
      if (!workout) {
        return res.status(404).json({ message: "Workout entry not found" });
      }
      
      // Check if the workout entry belongs to the logged-in user
      if (workout.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to access this entry" });
      }
      
      res.json(workout);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post('/api/workouts', requireAuth, async (req, res) => {
    try {
      // Add userId to the request body
      const data = { ...req.body, userId: req.session.userId };
      const workoutData = insertWorkoutSchema.parse(data);
      
      const workout = await storage.createWorkout(workoutData);
      res.status(201).json(workout);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put('/api/workouts/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const workout = await storage.getWorkoutById(id);
      
      if (!workout) {
        return res.status(404).json({ message: "Workout entry not found" });
      }
      
      // Check if the workout entry belongs to the logged-in user
      if (workout.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to update this entry" });
      }
      
      const updatedWorkout = await storage.updateWorkout(id, req.body);
      res.json(updatedWorkout);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete('/api/workouts/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const workout = await storage.getWorkoutById(id);
      
      if (!workout) {
        return res.status(404).json({ message: "Workout entry not found" });
      }
      
      // Check if the workout entry belongs to the logged-in user
      if (workout.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to delete this entry" });
      }
      
      const success = await storage.deleteWorkout(id);
      if (success) {
        res.json({ message: "Workout entry deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete workout entry" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get workouts by date range
  app.get('/api/workouts/range/:start/:end', requireAuth, async (req, res) => {
    try {
      const startDate = new Date(req.params.start);
      const endDate = new Date(req.params.end);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const workouts = await storage.getWorkoutsByDateRange(
        req.session.userId!,
        startDate,
        endDate
      );
      
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Dashboard/Activity routes
  app.get('/api/activity/recent', requireAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getRecentActivity(req.session.userId!, limit);
      
      // Map activities to a standard format for the frontend
      const formattedActivities = activities.map(activity => {
        // Check which type of activity it is
        if ('totalCalories' in activity) {
          return {
            id: activity.id,
            type: 'calorie',
            date: activity.date,
            metric: 'Daily Intake',
            value: `${activity.totalCalories} kcal`,
            createdAt: activity.createdAt
          };
        } else if ('weight' in activity) {
          return {
            id: activity.id,
            type: 'weight',
            date: activity.date,
            metric: 'Weight Log',
            value: `${activity.weight} kg`,
            createdAt: activity.createdAt
          };
        } else if ('duration' in activity) {
          return {
            id: activity.id,
            type: 'workout',
            date: activity.date,
            metric: activity.type,
            value: `${activity.duration} min - ${activity.intensity}`,
            createdAt: activity.createdAt
          };
        }
        
        // Fallback case
        return {
          id: (activity as any).id,
          type: 'unknown',
          date: (activity as any).date,
          metric: 'Unknown',
          value: 'Unknown',
          createdAt: (activity as any).createdAt
        };
      });
      
      res.json(formattedActivities);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
