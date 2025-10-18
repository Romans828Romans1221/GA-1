var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  complianceItems: () => complianceItems,
  complianceItemsRelations: () => complianceItemsRelations,
  insertComplianceItemSchema: () => insertComplianceItemSchema,
  insertPropertyAnalysisSchema: () => insertPropertyAnalysisSchema,
  insertTaskSchema: () => insertTaskSchema,
  propertyAnalyses: () => propertyAnalyses,
  propertyAnalysesRelations: () => propertyAnalysesRelations,
  sessions: () => sessions,
  tasks: () => tasks,
  tasksRelations: () => tasksRelations,
  users: () => users
});
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var propertyAnalyses = pgTable("property_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  groundElevation: decimal("ground_elevation", { precision: 10, scale: 2 }),
  estimatedHomePrice: decimal("estimated_home_price", { precision: 12, scale: 2 }),
  propertySquareFootage: integer("property_square_footage"),
  femaFloodZone: varchar("fema_flood_zone", { length: 50 }),
  baseFloodElevation: decimal("base_flood_elevation", { precision: 10, scale: 2 }),
  censusData: jsonb("census_data"),
  createdAt: timestamp("created_at").defaultNow()
});
var propertyAnalysesRelations = relations(propertyAnalyses, ({ one }) => ({
  user: one(users, {
    fields: [propertyAnalyses.userId],
    references: [users.id]
  })
}));
var insertPropertyAnalysisSchema = createInsertSchema(propertyAnalyses).omit({
  id: true,
  userId: true,
  createdAt: true
});
var tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("todo"),
  assignedToId: varchar("assigned_to_id").references(() => users.id, { onDelete: "set null" }),
  propertyAnalysisId: varchar("property_analysis_id").references(() => propertyAnalyses.id, { onDelete: "set null" }),
  createdById: varchar("created_by_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var tasksRelations = relations(tasks, ({ one }) => ({
  assignedTo: one(users, {
    fields: [tasks.assignedToId],
    references: [users.id],
    relationName: "assignedTasks"
  }),
  createdBy: one(users, {
    fields: [tasks.createdById],
    references: [users.id],
    relationName: "createdTasks"
  }),
  propertyAnalysis: one(propertyAnalyses, {
    fields: [tasks.propertyAnalysisId],
    references: [propertyAnalyses.id]
  })
}));
var insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdById: true,
  createdAt: true,
  updatedAt: true
});
var complianceItems = pgTable("compliance_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyAnalysisId: varchar("property_analysis_id").references(() => propertyAnalyses.id, { onDelete: "cascade" }),
  category: varchar("category", { length: 100 }).notNull(),
  itemName: text("item_name").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  notes: text("notes"),
  completedById: varchar("completed_by_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var complianceItemsRelations = relations(complianceItems, ({ one }) => ({
  propertyAnalysis: one(propertyAnalyses, {
    fields: [complianceItems.propertyAnalysisId],
    references: [propertyAnalyses.id]
  }),
  completedBy: one(users, {
    fields: [complianceItems.completedById],
    references: [users.id]
  })
}));
var insertComplianceItemSchema = createInsertSchema(complianceItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc } from "drizzle-orm";
var DatabaseStorage = class {
  // User operations - Required for Replit Auth
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  // Property Analysis operations
  async getPropertyAnalysesByUser(userId) {
    const analyses = await db.select().from(propertyAnalyses).where(eq(propertyAnalyses.userId, userId)).orderBy(desc(propertyAnalyses.createdAt));
    return analyses;
  }
  async createPropertyAnalysis(userId, data) {
    const [analysis] = await db.insert(propertyAnalyses).values({ ...data, userId }).returning();
    return analysis;
  }
  async getPropertyAnalysisById(id) {
    const [analysis] = await db.select().from(propertyAnalyses).where(eq(propertyAnalyses.id, id));
    return analysis;
  }
  async clearUserSessionData(userId) {
    await db.delete(propertyAnalyses).where(eq(propertyAnalyses.userId, userId));
  }
  // Task operations
  async getAllTasks() {
    const allTasks = await db.select().from(tasks).orderBy(desc(tasks.createdAt));
    return allTasks;
  }
  async getTasksByUser(userId) {
    const userTasks = await db.select().from(tasks).where(eq(tasks.createdById, userId)).orderBy(desc(tasks.createdAt));
    return userTasks;
  }
  async createTask(userId, data) {
    const [task] = await db.insert(tasks).values({ ...data, createdById: userId }).returning();
    return task;
  }
  async updateTaskStatus(id, status) {
    const [task] = await db.update(tasks).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(tasks.id, id)).returning();
    return task;
  }
  // Compliance operations
  async getAllComplianceItems() {
    const items = await db.select().from(complianceItems).orderBy(desc(complianceItems.createdAt));
    return items;
  }
  async getComplianceItemsByProperty(propertyId) {
    const items = await db.select().from(complianceItems).where(eq(complianceItems.propertyAnalysisId, propertyId)).orderBy(desc(complianceItems.createdAt));
    return items;
  }
  async createComplianceItem(data) {
    const [item] = await db.insert(complianceItems).values(data).returning();
    return item;
  }
  async updateComplianceItem(id, updates) {
    const [item] = await db.update(complianceItems).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(complianceItems.id, id)).returning();
    return item;
  }
};
var storage = new DatabaseStorage();

// server/replitAuth.ts
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}
var getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1e3 }
);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl
    }
  });
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"]
  });
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  const config = await getOidcConfig();
  const verify = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };
  for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`
      },
      verify
    );
    passport.use(strategy);
  }
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login"
    })(req, res, next);
  });
  app2.get("/api/logout", async (req, res) => {
    const user = req.user;
    if (user?.claims?.sub) {
      try {
        await storage.clearUserSessionData(user.claims.sub);
      } catch (error) {
        console.error("Error clearing session data:", error);
      }
    }
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`
        }).href
      );
    });
  });
}
var isAuthenticated = async (req, res, next) => {
  const user = req.user;
  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now <= user.expires_at) {
    return next();
  }
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  await setupAuth(app2);
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/properties", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const analyses = await storage.getPropertyAnalysesByUser(userId);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching property analyses:", error);
      res.status(500).json({ message: "Failed to fetch property analyses" });
    }
  });
  app2.post("/api/properties", isAuthenticated, async (req, res) => {
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
  app2.get("/api/properties/:id", isAuthenticated, async (req, res) => {
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
  app2.post("/api/properties/analyze", isAuthenticated, async (req, res) => {
    try {
      const { address, latitude, longitude } = req.body;
      if (!address && (!latitude || !longitude)) {
        return res.status(400).json({
          message: "Either address or both latitude and longitude are required"
        });
      }
      const coords = {
        latitude: latitude || 33.749 + (Math.random() - 0.5) * 2,
        longitude: longitude || -84.388 + (Math.random() - 0.5) * 2
      };
      const analysisData = {
        address: address || `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`,
        latitude: coords.latitude.toString(),
        longitude: coords.longitude.toString(),
        groundElevation: (45.5 + Math.random() * 20).toString(),
        estimatedHomePrice: (25e4 + Math.random() * 15e4).toString(),
        propertySquareFootage: 1500 + Math.floor(Math.random() * 1e3),
        femaFloodZone: ["X", "AE", "A", "VE"][Math.floor(Math.random() * 4)],
        baseFloodElevation: (50 + Math.random() * 15).toString(),
        censusData: { population: 25e3 + Math.floor(Math.random() * 5e4) }
      };
      const userId = req.user.claims.sub;
      const analysis = await storage.createPropertyAnalysis(userId, analysisData);
      res.status(201).json(analysis);
    } catch (error) {
      console.error("Error analyzing property:", error);
      res.status(500).json({ message: "Failed to analyze property" });
    }
  });
  app2.get("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      const tasks2 = await storage.getAllTasks();
      res.json(tasks2);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });
  app2.post("/api/tasks", isAuthenticated, async (req, res) => {
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
  app2.patch("/api/tasks/:id/status", isAuthenticated, async (req, res) => {
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
  app2.get("/api/compliance", isAuthenticated, async (req, res) => {
    try {
      const items = await storage.getAllComplianceItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching compliance items:", error);
      res.status(500).json({ message: "Failed to fetch compliance items" });
    }
  });
  app2.get("/api/compliance/property/:propertyId", isAuthenticated, async (req, res) => {
    try {
      const { propertyId } = req.params;
      const items = await storage.getComplianceItemsByProperty(propertyId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching compliance items:", error);
      res.status(500).json({ message: "Failed to fetch compliance items" });
    }
  });
  app2.post("/api/compliance", isAuthenticated, async (req, res) => {
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
  app2.patch("/api/compliance/:id", isAuthenticated, async (req, res) => {
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
