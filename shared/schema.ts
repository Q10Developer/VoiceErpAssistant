import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema - basic user information
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  role: text("role").default("user"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  role: true,
});

// Command history schema - stores voice command history
export const commandHistory = pgTable("command_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  command: text("command").notNull(),
  response: text("response"),
  status: text("status").default("success"), // success, error, pending
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata"), // For any extra data like entities extracted
});

export const insertCommandHistorySchema = createInsertSchema(commandHistory).pick({
  userId: true,
  command: true,
  response: true, 
  status: true,
  metadata: true,
});

// Voice settings schema - stores user's voice assistant settings
export const voiceSettings = pgTable("voice_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  wakeWord: text("wake_word").default("Hey ERP"),
  sensitivity: integer("sensitivity").default(7),
  voiceResponse: boolean("voice_response").default(true),
  continuousListening: boolean("continuous_listening").default(false),
  voiceLanguage: text("voice_language").default("en-US"),
});

export const insertVoiceSettingsSchema = createInsertSchema(voiceSettings).pick({
  userId: true,
  wakeWord: true,
  sensitivity: true,
  voiceResponse: true,
  continuousListening: true,
  voiceLanguage: true,
});

// Quick command schema - stores custom quick commands
export const quickCommands = pgTable("quick_commands", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  commandText: text("command_text").notNull(),
  icon: text("icon").default("command"),
  sortOrder: integer("sort_order").default(0),
});

export const insertQuickCommandSchema = createInsertSchema(quickCommands).pick({
  userId: true,
  commandText: true,
  icon: true,
  sortOrder: true,
});

// ERPNext connection schema - stores ERPNext API connection settings
export const erpConnections = pgTable("erp_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  url: text("url").notNull(), 
  apiKey: text("api_key").notNull(),
  apiSecret: text("api_secret").notNull(),
  isActive: boolean("is_active").default(true),
  lastConnected: timestamp("last_connected"),
});

export const insertErpConnectionSchema = createInsertSchema(erpConnections).pick({
  userId: true,
  url: true,
  apiKey: true,
  apiSecret: true,
  isActive: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type CommandHistory = typeof commandHistory.$inferSelect;
export type InsertCommandHistory = z.infer<typeof insertCommandHistorySchema>;

export type VoiceSettings = typeof voiceSettings.$inferSelect;
export type InsertVoiceSettings = z.infer<typeof insertVoiceSettingsSchema>;

export type QuickCommand = typeof quickCommands.$inferSelect;
export type InsertQuickCommand = z.infer<typeof insertQuickCommandSchema>;

export type ErpConnection = typeof erpConnections.$inferSelect;
export type InsertErpConnection = z.infer<typeof insertErpConnectionSchema>;
