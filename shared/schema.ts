import { pgTable, text, serial, integer, timestamp, decimal, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Calorie schema
export const calories = pgTable("calories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  totalCalories: integer("total_calories").notNull(),
  protein: integer("protein"),
  carbs: integer("carbs"),
  fat: integer("fat"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Weight schema
export const weights = pgTable("weights", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    uniqueUserDate: unique("unique_user_date_idx").on(table.userId, table.date),
  };
});

// Workout schema
export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  type: text("type").notNull(),
  duration: integer("duration").notNull(),
  intensity: text("intensity").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schema validators for insert operations
export const insertUserSchema = createInsertSchema(users).omit({
  id: true, 
  createdAt: true
});

export const insertCaloriesSchema = createInsertSchema(calories).omit({
  id: true,
  createdAt: true
});

export const insertWeightSchema = createInsertSchema(weights).omit({
  id: true,
  createdAt: true
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
  createdAt: true
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Calorie = typeof calories.$inferSelect;
export type InsertCalorie = z.infer<typeof insertCaloriesSchema>;

export type Weight = typeof weights.$inferSelect;
export type InsertWeight = z.infer<typeof insertWeightSchema>;

export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
