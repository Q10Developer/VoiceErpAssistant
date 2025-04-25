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

export const storage = new MemStorage();
