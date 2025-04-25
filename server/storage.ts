import { 
  users, 
  commandHistory, 
  voiceSettings, 
  quickCommands, 
  erpConnections,
  type User, 
  type InsertUser,
  type CommandHistory,
  type InsertCommandHistory,
  type VoiceSettings,
  type InsertVoiceSettings,
  type QuickCommand,
  type InsertQuickCommand,
  type ErpConnection,
  type InsertErpConnection
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Storage interface for all CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Command history operations
  getCommandHistory(userId: number, limit?: number): Promise<CommandHistory[]>;
  createCommandHistory(command: InsertCommandHistory): Promise<CommandHistory>;
  
  // Voice settings operations
  getVoiceSettings(userId: number): Promise<VoiceSettings | undefined>;
  createVoiceSettings(settings: InsertVoiceSettings): Promise<VoiceSettings>;
  updateVoiceSettings(userId: number, settings: Partial<InsertVoiceSettings>): Promise<VoiceSettings | undefined>;
  
  // Quick commands operations
  getQuickCommands(userId: number): Promise<QuickCommand[]>;
  createQuickCommand(command: InsertQuickCommand): Promise<QuickCommand>;
  updateQuickCommand(id: number, command: Partial<InsertQuickCommand>): Promise<QuickCommand | undefined>;
  deleteQuickCommand(id: number): Promise<boolean>;
  
  // ERP connection operations
  getErpConnection(userId: number): Promise<ErpConnection | undefined>;
  createErpConnection(connection: InsertErpConnection): Promise<ErpConnection>;
  updateErpConnection(userId: number, connection: Partial<InsertErpConnection>): Promise<ErpConnection | undefined>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private commandHistory: Map<number, CommandHistory>;
  private voiceSettings: Map<number, VoiceSettings>;
  private quickCommands: Map<number, QuickCommand>;
  private erpConnections: Map<number, ErpConnection>;
  
  private userId: number = 1;
  private commandId: number = 1;
  private settingsId: number = 1;
  private quickCommandId: number = 1;
  private connectionId: number = 1;

  constructor() {
    this.users = new Map();
    this.commandHistory = new Map();
    this.voiceSettings = new Map();
    this.quickCommands = new Map();
    this.erpConnections = new Map();
    
    // Initialize with a demo user
    this.createUser({
      username: "admin",
      password: "admin",
      displayName: "John Doe",
      role: "Administrator"
    });
    
    // Add some sample quick commands for demo user
    this.createQuickCommand({
      userId: 1,
      commandText: "Check inventory status",
      icon: "inventory",
      sortOrder: 1
    });
    
    this.createQuickCommand({
      userId: 1,
      commandText: "Create new invoice",
      icon: "receipt",
      sortOrder: 2
    });
    
    this.createQuickCommand({
      userId: 1,
      commandText: "Show open orders",
      icon: "shopping_cart",
      sortOrder: 3
    });
    
    this.createQuickCommand({
      userId: 1,
      commandText: "Sales summary for this month",
      icon: "insights",
      sortOrder: 4
    });
    
    // Create default voice settings for demo user
    this.createVoiceSettings({
      userId: 1,
      wakeWord: "Hey ERP",
      sensitivity: 7,
      voiceResponse: true,
      continuousListening: false,
      voiceLanguage: "en-US"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Command history operations
  async getCommandHistory(userId: number, limit?: number): Promise<CommandHistory[]> {
    const commands = Array.from(this.commandHistory.values())
      .filter(cmd => cmd.userId === userId)
      .sort((a, b) => {
        const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return bTime - aTime; // Sort by most recent first
      });
    
    return limit ? commands.slice(0, limit) : commands;
  }
  
  async createCommandHistory(command: InsertCommandHistory): Promise<CommandHistory> {
    const id = this.commandId++;
    const timestamp = new Date();
    const newCommand: CommandHistory = { ...command, id, timestamp };
    this.commandHistory.set(id, newCommand);
    return newCommand;
  }
  
  // Voice settings operations
  async getVoiceSettings(userId: number): Promise<VoiceSettings | undefined> {
    return Array.from(this.voiceSettings.values()).find(
      (settings) => settings.userId === userId
    );
  }
  
  async createVoiceSettings(settings: InsertVoiceSettings): Promise<VoiceSettings> {
    const id = this.settingsId++;
    const newSettings: VoiceSettings = { ...settings, id };
    this.voiceSettings.set(id, newSettings);
    return newSettings;
  }
  
  async updateVoiceSettings(userId: number, settings: Partial<InsertVoiceSettings>): Promise<VoiceSettings | undefined> {
    const existingSettings = await this.getVoiceSettings(userId);
    
    if (!existingSettings) {
      return undefined;
    }
    
    const updatedSettings: VoiceSettings = { ...existingSettings, ...settings };
    this.voiceSettings.set(existingSettings.id, updatedSettings);
    return updatedSettings;
  }
  
  // Quick commands operations
  async getQuickCommands(userId: number): Promise<QuickCommand[]> {
    return Array.from(this.quickCommands.values())
      .filter(cmd => cmd.userId === userId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }
  
  async createQuickCommand(command: InsertQuickCommand): Promise<QuickCommand> {
    const id = this.quickCommandId++;
    const newCommand: QuickCommand = { ...command, id };
    this.quickCommands.set(id, newCommand);
    return newCommand;
  }
  
  async updateQuickCommand(id: number, command: Partial<InsertQuickCommand>): Promise<QuickCommand | undefined> {
    const existingCommand = this.quickCommands.get(id);
    
    if (!existingCommand) {
      return undefined;
    }
    
    const updatedCommand: QuickCommand = { ...existingCommand, ...command };
    this.quickCommands.set(id, updatedCommand);
    return updatedCommand;
  }
  
  async deleteQuickCommand(id: number): Promise<boolean> {
    return this.quickCommands.delete(id);
  }
  
  // ERP connection operations
  async getErpConnection(userId: number): Promise<ErpConnection | undefined> {
    return Array.from(this.erpConnections.values()).find(
      (connection) => connection.userId === userId
    );
  }
  
  async createErpConnection(connection: InsertErpConnection): Promise<ErpConnection> {
    const id = this.connectionId++;
    const lastConnected = new Date();
    const newConnection: ErpConnection = { ...connection, id, lastConnected };
    this.erpConnections.set(id, newConnection);
    return newConnection;
  }
  
  async updateErpConnection(userId: number, connection: Partial<InsertErpConnection>): Promise<ErpConnection | undefined> {
    const existingConnection = await this.getErpConnection(userId);
    
    if (!existingConnection) {
      return undefined;
    }
    
    const updatedConnection: ErpConnection = { 
      ...existingConnection, 
      ...connection,
      lastConnected: new Date()
    };
    this.erpConnections.set(existingConnection.id, updatedConnection);
    return updatedConnection;
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Command history operations
  async getCommandHistory(userId: number, limit?: number): Promise<CommandHistory[]> {
    let query = db.select()
      .from(commandHistory)
      .where(eq(commandHistory.userId, userId))
      .orderBy(desc(commandHistory.timestamp));
    
    if (limit) {
      query = query.limit(limit);
    }
    
    return await query;
  }
  
  async createCommandHistory(command: InsertCommandHistory): Promise<CommandHistory> {
    const [newCommand] = await db.insert(commandHistory)
      .values(command)
      .returning();
    return newCommand;
  }
  
  // Voice settings operations
  async getVoiceSettings(userId: number): Promise<VoiceSettings | undefined> {
    const [settings] = await db.select()
      .from(voiceSettings)
      .where(eq(voiceSettings.userId, userId));
    return settings;
  }
  
  async createVoiceSettings(settings: InsertVoiceSettings): Promise<VoiceSettings> {
    const [newSettings] = await db.insert(voiceSettings)
      .values(settings)
      .returning();
    return newSettings;
  }
  
  async updateVoiceSettings(userId: number, settings: Partial<InsertVoiceSettings>): Promise<VoiceSettings | undefined> {
    const [existingSettings] = await db.select()
      .from(voiceSettings)
      .where(eq(voiceSettings.userId, userId));
    
    if (!existingSettings) {
      return undefined;
    }
    
    const [updatedSettings] = await db.update(voiceSettings)
      .set(settings)
      .where(eq(voiceSettings.userId, userId))
      .returning();
    
    return updatedSettings;
  }
  
  // Quick commands operations
  async getQuickCommands(userId: number): Promise<QuickCommand[]> {
    return await db.select()
      .from(quickCommands)
      .where(eq(quickCommands.userId, userId))
      .orderBy(quickCommands.sortOrder);
  }
  
  async createQuickCommand(command: InsertQuickCommand): Promise<QuickCommand> {
    const [newCommand] = await db.insert(quickCommands)
      .values(command)
      .returning();
    return newCommand;
  }
  
  async updateQuickCommand(id: number, command: Partial<InsertQuickCommand>): Promise<QuickCommand | undefined> {
    const [updatedCommand] = await db.update(quickCommands)
      .set(command)
      .where(eq(quickCommands.id, id))
      .returning();
    
    return updatedCommand;
  }
  
  async deleteQuickCommand(id: number): Promise<boolean> {
    const result = await db.delete(quickCommands)
      .where(eq(quickCommands.id, id));
    
    return result.rowCount > 0;
  }
  
  // ERP connection operations
  async getErpConnection(userId: number): Promise<ErpConnection | undefined> {
    const [connection] = await db.select()
      .from(erpConnections)
      .where(eq(erpConnections.userId, userId));
    return connection;
  }
  
  async createErpConnection(connection: InsertErpConnection): Promise<ErpConnection> {
    const [newConnection] = await db.insert(erpConnections)
      .values({
        ...connection,
        lastConnected: new Date()
      })
      .returning();
    return newConnection;
  }
  
  async updateErpConnection(userId: number, connection: Partial<InsertErpConnection>): Promise<ErpConnection | undefined> {
    const [updatedConnection] = await db.update(erpConnections)
      .set({
        ...connection,
        lastConnected: new Date()
      })
      .where(eq(erpConnections.userId, userId))
      .returning();
    
    return updatedConnection;
  }

  // Initialize database with default data
  async initialize(): Promise<void> {
    // Check if we have a test user
    const testUser = await this.getUserByUsername("admin");
    
    if (!testUser) {
      // Create test user
      const user = await this.createUser({
        username: "admin",
        password: "admin",
        displayName: "John Doe",
        role: "Administrator"
      });
      
      // Create default voice settings
      await this.createVoiceSettings({
        userId: user.id,
        wakeWord: "Hey ERP",
        sensitivity: 7,
        voiceResponse: true,
        continuousListening: false,
        voiceLanguage: "en-US"
      });
      
      // Create default quick commands
      await this.createQuickCommand({
        userId: user.id,
        commandText: "Check inventory status",
        icon: "inventory",
        sortOrder: 1
      });
      
      await this.createQuickCommand({
        userId: user.id,
        commandText: "Create new invoice",
        icon: "receipt",
        sortOrder: 2
      });
      
      await this.createQuickCommand({
        userId: user.id,
        commandText: "Show open orders",
        icon: "shopping_cart",
        sortOrder: 3
      });
      
      await this.createQuickCommand({
        userId: user.id,
        commandText: "Sales summary for this month",
        icon: "insights",
        sortOrder: 4
      });
      
      // We're not creating a default ERP connection here
      // It will be created by the user through the settings page
    }
  }
  
  constructor() {
    // Constructor for database storage - initializes database connection
  }
}

export const storage = new DatabaseStorage();
