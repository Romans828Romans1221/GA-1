import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Property Analyses - stores property analysis results
export const propertyAnalyses = pgTable("property_analyses", {
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const propertyAnalysesRelations = relations(propertyAnalyses, ({ one }) => ({
  user: one(users, {
    fields: [propertyAnalyses.userId],
    references: [users.id],
  }),
}));

export const insertPropertyAnalysisSchema = createInsertSchema(propertyAnalyses).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export type InsertPropertyAnalysis = z.infer<typeof insertPropertyAnalysisSchema>;
export type PropertyAnalysis = typeof propertyAnalyses.$inferSelect;

// Tasks - for queue management
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("todo"),
  assignedToId: varchar("assigned_to_id").references(() => users.id, { onDelete: "set null" }),
  propertyAnalysisId: varchar("property_analysis_id").references(() => propertyAnalyses.id, { onDelete: "set null" }),
  createdById: varchar("created_by_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tasksRelations = relations(tasks, ({ one }) => ({
  assignedTo: one(users, {
    fields: [tasks.assignedToId],
    references: [users.id],
    relationName: "assignedTasks",
  }),
  createdBy: one(users, {
    fields: [tasks.createdById],
    references: [users.id],
    relationName: "createdTasks",
  }),
  propertyAnalysis: one(propertyAnalyses, {
    fields: [tasks.propertyAnalysisId],
    references: [propertyAnalyses.id],
  }),
}));

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Compliance Items - for EHP pre-screening and regulatory review
export const complianceItems = pgTable("compliance_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyAnalysisId: varchar("property_analysis_id").references(() => propertyAnalyses.id, { onDelete: "cascade" }),
  category: varchar("category", { length: 100 }).notNull(),
  itemName: text("item_name").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  notes: text("notes"),
  completedById: varchar("completed_by_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const complianceItemsRelations = relations(complianceItems, ({ one }) => ({
  propertyAnalysis: one(propertyAnalyses, {
    fields: [complianceItems.propertyAnalysisId],
    references: [propertyAnalyses.id],
  }),
  completedBy: one(users, {
    fields: [complianceItems.completedById],
    references: [users.id],
  }),
}));

export const insertComplianceItemSchema = createInsertSchema(complianceItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertComplianceItem = z.infer<typeof insertComplianceItemSchema>;
export type ComplianceItem = typeof complianceItems.$inferSelect;
