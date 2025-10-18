// Database storage implementation - based on blueprint:javascript_database
import {
  users,
  type User,
  type UpsertUser,
  propertyAnalyses,
  type PropertyAnalysis,
  type InsertPropertyAnalysis,
  tasks,
  type Task,
  type InsertTask,
  complianceItems,
  type ComplianceItem,
  type InsertComplianceItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Property Analysis operations
  getPropertyAnalysesByUser(userId: string): Promise<PropertyAnalysis[]>;
  createPropertyAnalysis(userId: string, data: InsertPropertyAnalysis): Promise<PropertyAnalysis>;
  getPropertyAnalysisById(id: string): Promise<PropertyAnalysis | undefined>;
  
  // Task operations
  getAllTasks(): Promise<Task[]>;
  getTasksByUser(userId: string): Promise<Task[]>;
  createTask(userId: string, data: InsertTask): Promise<Task>;
  updateTaskStatus(id: string, status: string): Promise<Task | undefined>;
  
  // Compliance operations
  getAllComplianceItems(): Promise<ComplianceItem[]>;
  getComplianceItemsByProperty(propertyId: string): Promise<ComplianceItem[]>;
  createComplianceItem(data: InsertComplianceItem): Promise<ComplianceItem>;
  updateComplianceItem(id: string, updates: Partial<InsertComplianceItem>): Promise<ComplianceItem | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations - Required for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Property Analysis operations
  async getPropertyAnalysesByUser(userId: string): Promise<PropertyAnalysis[]> {
    const analyses = await db
      .select()
      .from(propertyAnalyses)
      .where(eq(propertyAnalyses.userId, userId))
      .orderBy(desc(propertyAnalyses.createdAt));
    return analyses;
  }

  async createPropertyAnalysis(userId: string, data: InsertPropertyAnalysis): Promise<PropertyAnalysis> {
    const [analysis] = await db
      .insert(propertyAnalyses)
      .values({ ...data, userId })
      .returning();
    return analysis;
  }

  async getPropertyAnalysisById(id: string): Promise<PropertyAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(propertyAnalyses)
      .where(eq(propertyAnalyses.id, id));
    return analysis;
  }

  // Task operations
  async getAllTasks(): Promise<Task[]> {
    const allTasks = await db
      .select()
      .from(tasks)
      .orderBy(desc(tasks.createdAt));
    return allTasks;
  }

  async getTasksByUser(userId: string): Promise<Task[]> {
    const userTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.createdById, userId))
      .orderBy(desc(tasks.createdAt));
    return userTasks;
  }

  async createTask(userId: string, data: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values({ ...data, createdById: userId })
      .returning();
    return task;
  }

  async updateTaskStatus(id: string, status: string): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set({ status, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  // Compliance operations
  async getAllComplianceItems(): Promise<ComplianceItem[]> {
    const items = await db
      .select()
      .from(complianceItems)
      .orderBy(desc(complianceItems.createdAt));
    return items;
  }

  async getComplianceItemsByProperty(propertyId: string): Promise<ComplianceItem[]> {
    const items = await db
      .select()
      .from(complianceItems)
      .where(eq(complianceItems.propertyAnalysisId, propertyId))
      .orderBy(desc(complianceItems.createdAt));
    return items;
  }

  async createComplianceItem(data: InsertComplianceItem): Promise<ComplianceItem> {
    const [item] = await db
      .insert(complianceItems)
      .values(data)
      .returning();
    return item;
  }

  async updateComplianceItem(id: string, updates: Partial<InsertComplianceItem>): Promise<ComplianceItem | undefined> {
    const [item] = await db
      .update(complianceItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(complianceItems.id, id))
      .returning();
    return item;
  }
}

export const storage = new DatabaseStorage();
