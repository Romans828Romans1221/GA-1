import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPropertyAnalysisSchema, insertTaskSchema, insertComplianceItemSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - must be setup first
  await setupAuth(app);

  // Auth routes - get current user
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Property Analysis Routes
  
  // Get all property analyses for current user
  app.get('/api/properties', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analyses = await storage.getPropertyAnalysesByUser(userId);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching property analyses:", error);
      res.status(500).json({ message: "Failed to fetch property analyses" });
    }
  });

  // Create new property analysis
  app.post('/api/properties', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertPropertyAnalysisSchema.parse(req.body);
      const analysis = await storage.createPropertyAnalysis(userId, validated);
      res.status(201).json(analysis);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating property analysis:", error);
      res.status(500).json({ message: "Failed to create property analysis" });
    }
  });

  // Get single property analysis
  app.get('/api/properties/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const analysis = await storage.getPropertyAnalysisById(id);
      
      if (!analysis) {
        return res.status(404).json({ message: "Property analysis not found" });
      }
      
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching property analysis:", error);
      res.status(500).json({ message: "Failed to fetch property analysis" });
    }
  });

  // Analyze property with FEMA data (geocoding + FEMA API integration)
  app.post('/api/properties/analyze', isAuthenticated, async (req: any, res) => {
    try {
      const { address, latitude, longitude } = req.body;

      if (!address && (!latitude || !longitude)) {
        return res.status(400).json({ 
          message: "Either address or both latitude and longitude are required" 
        });
      }

      // For MVP, return simulated data
      // In production, this would call:
      // 1. Geocoding API to convert address to lat/lng
      // 2. FEMA NFHL API for flood zone data
      // 3. Elevation API for ground elevation
      // 4. Census API for population data
      
      const coords = {
        latitude: latitude || (33.7490 + (Math.random() - 0.5) * 2),
        longitude: longitude || (-84.3880 + (Math.random() - 0.5) * 2),
      };

      const analysisData = {
        address: address || `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`,
        latitude: coords.latitude.toString(),
        longitude: coords.longitude.toString(),
        groundElevation: (45.5 + Math.random() * 20).toString(),
        estimatedHomePrice: (250000 + Math.random() * 150000).toString(),
        propertySquareFootage: 1500 + Math.floor(Math.random() * 1000),
        femaFloodZone: ["X", "AE", "A", "VE"][Math.floor(Math.random() * 4)],
        baseFloodElevation: (50 + Math.random() * 15).toString(),
        censusData: { population: 25000 + Math.floor(Math.random() * 50000) },
      };

      const userId = req.user.claims.sub;
      const analysis = await storage.createPropertyAnalysis(userId, analysisData);
      
      res.status(201).json(analysis);
    } catch (error) {
      console.error("Error analyzing property:", error);
      res.status(500).json({ message: "Failed to analyze property" });
    }
  });

  // Task Routes
  
  // Get all tasks
  app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Create new task
  app.post('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(userId, validated);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  // Update task status
  app.patch('/api/tasks/:id/status', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !["todo", "in_progress", "done"].includes(status)) {
        return res.status(400).json({ 
          message: "Invalid status. Must be 'todo', 'in_progress', or 'done'" 
        });
      }

      const task = await storage.updateTaskStatus(id, status);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error updating task status:", error);
      res.status(500).json({ message: "Failed to update task status" });
    }
  });

  // Compliance Routes
  
  // Get all compliance items
  app.get('/api/compliance', isAuthenticated, async (req, res) => {
    try {
      const items = await storage.getAllComplianceItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching compliance items:", error);
      res.status(500).json({ message: "Failed to fetch compliance items" });
    }
  });

  // Get compliance items for a property
  app.get('/api/compliance/property/:propertyId', isAuthenticated, async (req, res) => {
    try {
      const { propertyId } = req.params;
      const items = await storage.getComplianceItemsByProperty(propertyId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching compliance items:", error);
      res.status(500).json({ message: "Failed to fetch compliance items" });
    }
  });

  // Create compliance item
  app.post('/api/compliance', isAuthenticated, async (req, res) => {
    try {
      const validated = insertComplianceItemSchema.parse(req.body);
      const item = await storage.createComplianceItem(validated);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating compliance item:", error);
      res.status(500).json({ message: "Failed to create compliance item" });
    }
  });

  // Update compliance item
  app.patch('/api/compliance/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const item = await storage.updateComplianceItem(id, updates);
      
      if (!item) {
        return res.status(404).json({ message: "Compliance item not found" });
      }
      
      res.json(item);
    } catch (error) {
      console.error("Error updating compliance item:", error);
      res.status(500).json({ message: "Failed to update compliance item" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
