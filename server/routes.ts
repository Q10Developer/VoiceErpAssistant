import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCommandHistorySchema, 
  insertVoiceSettingsSchema, 
  insertQuickCommandSchema,
  insertErpConnectionSchema
} from "@shared/schema";
import axios from "axios";

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiPrefix = "/api";

  // Command History Routes
  app.get(`${apiPrefix}/commands/:userId`, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const commands = await storage.getCommandHistory(userId, limit);
      res.json(commands);
    } catch (error) {
      res.status(500).json({ message: "Failed to get command history", error: (error as Error).message });
    }
  });

  app.post(`${apiPrefix}/commands`, async (req, res) => {
    try {
      const commandData = insertCommandHistorySchema.parse(req.body);
      const newCommand = await storage.createCommandHistory(commandData);
      res.status(201).json(newCommand);
    } catch (error) {
      res.status(400).json({ message: "Invalid command data", error: (error as Error).message });
    }
  });

  // Voice Settings Routes
  app.get(`${apiPrefix}/settings/:userId`, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const settings = await storage.getVoiceSettings(userId);
      
      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to get voice settings", error: (error as Error).message });
    }
  });

  app.post(`${apiPrefix}/settings`, async (req, res) => {
    try {
      const settingsData = insertVoiceSettingsSchema.parse(req.body);
      
      // Check if settings already exist for this user
      const existingSettings = await storage.getVoiceSettings(settingsData.userId);
      
      if (existingSettings) {
        // Update existing settings
        const updatedSettings = await storage.updateVoiceSettings(settingsData.userId, settingsData);
        return res.json(updatedSettings);
      }
      
      // Create new settings
      const newSettings = await storage.createVoiceSettings(settingsData);
      res.status(201).json(newSettings);
    } catch (error) {
      res.status(400).json({ message: "Invalid settings data", error: (error as Error).message });
    }
  });

  app.patch(`${apiPrefix}/settings/:userId`, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const updateData = req.body;
      const updatedSettings = await storage.updateVoiceSettings(userId, updateData);
      
      if (!updatedSettings) {
        return res.status(404).json({ message: "Settings not found" });
      }
      
      res.json(updatedSettings);
    } catch (error) {
      res.status(400).json({ message: "Invalid settings data", error: (error as Error).message });
    }
  });

  // Quick Commands Routes
  app.get(`${apiPrefix}/quickcommands/:userId`, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const commands = await storage.getQuickCommands(userId);
      res.json(commands);
    } catch (error) {
      res.status(500).json({ message: "Failed to get quick commands", error: (error as Error).message });
    }
  });

  app.post(`${apiPrefix}/quickcommands`, async (req, res) => {
    try {
      const commandData = insertQuickCommandSchema.parse(req.body);
      const newCommand = await storage.createQuickCommand(commandData);
      res.status(201).json(newCommand);
    } catch (error) {
      res.status(400).json({ message: "Invalid quick command data", error: (error as Error).message });
    }
  });

  app.patch(`${apiPrefix}/quickcommands/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid command ID" });
      }
      
      const updateData = req.body;
      const updatedCommand = await storage.updateQuickCommand(id, updateData);
      
      if (!updatedCommand) {
        return res.status(404).json({ message: "Quick command not found" });
      }
      
      res.json(updatedCommand);
    } catch (error) {
      res.status(400).json({ message: "Invalid quick command data", error: (error as Error).message });
    }
  });

  app.delete(`${apiPrefix}/quickcommands/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid command ID" });
      }
      
      const deleted = await storage.deleteQuickCommand(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Quick command not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete quick command", error: (error as Error).message });
    }
  });

  // ERP Connection Routes
  app.get(`${apiPrefix}/connection/:userId`, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const connection = await storage.getErpConnection(userId);
      
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      
      // Don't return the API secret in the response
      const { apiSecret, ...connectionWithoutSecret } = connection;
      
      res.json(connectionWithoutSecret);
    } catch (error) {
      res.status(500).json({ message: "Failed to get ERP connection", error: (error as Error).message });
    }
  });

  app.post(`${apiPrefix}/connection`, async (req, res) => {
    try {
      const connectionData = insertErpConnectionSchema.parse(req.body);
      
      // Check if connection already exists for this user
      const existingConnection = await storage.getErpConnection(connectionData.userId);
      
      if (existingConnection) {
        // Update existing connection
        const updatedConnection = await storage.updateErpConnection(connectionData.userId, connectionData);
        
        if (!updatedConnection) {
          return res.status(404).json({ message: "Connection not found" });
        }
        
        // Don't return the API secret in the response
        const { apiSecret, ...connectionWithoutSecret } = updatedConnection;
        
        return res.json(connectionWithoutSecret);
      }
      
      // Create new connection
      const newConnection = await storage.createErpConnection(connectionData);
      
      // Don't return the API secret in the response
      const { apiSecret, ...connectionWithoutSecret } = newConnection;
      
      res.status(201).json(connectionWithoutSecret);
    } catch (error) {
      res.status(400).json({ message: "Invalid connection data", error: (error as Error).message });
    }
  });

  // Test connection to ERPNext
  app.post(`${apiPrefix}/connection/test`, async (req, res) => {
    try {
      const { url, apiKey, apiSecret } = req.body;
      
      if (!url || !apiKey || !apiSecret) {
        return res.status(400).json({ message: "URL, API key, and API secret are required" });
      }
      
      try {
        // Test connection to ERPNext API
        const response = await axios.get(`${url}/api/method/frappe.auth.get_logged_user`, {
          headers: {
            'Authorization': `token ${apiKey}:${apiSecret}`
          }
        });
        
        if (response.data && response.data.message) {
          return res.json({ success: true, user: response.data.message });
        }
        
        res.status(400).json({ success: false, message: "Invalid response from ERPNext API" });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          return res.status(400).json({ 
            success: false, 
            message: "Failed to connect to ERPNext API", 
            error: error.response?.data || error.message 
          });
        }
        
        res.status(400).json({ 
          success: false, 
          message: "Failed to connect to ERPNext API", 
          error: (error as Error).message 
        });
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid connection data", error: (error as Error).message });
    }
  });

  // ERPNext API proxy route for queries
  app.post(`${apiPrefix}/erp/query`, async (req, res) => {
    try {
      const { userId, connectionId, method, doctype, name, filters, fields } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const connection = connectionId 
        ? await storage.getErpConnection(parseInt(userId)) 
        : await storage.getErpConnection(parseInt(userId));
      
      if (!connection) {
        return res.status(404).json({ message: "ERP connection not found" });
      }
      
      const { url, apiKey, apiSecret } = connection;
      
      try {
        let response;
        
        // Default to get_list if method is not specified
        const apiMethod = method || 'get_list';
        
        switch (apiMethod) {
          case 'get_doc':
            if (!doctype || !name) {
              return res.status(400).json({ message: "Doctype and name are required for get_doc" });
            }
            
            response = await axios.get(`${url}/api/resource/${doctype}/${name}`, {
              headers: {
                'Authorization': `token ${apiKey}:${apiSecret}`
              }
            });
            break;
            
          case 'get_list':
            if (!doctype) {
              return res.status(400).json({ message: "Doctype is required for get_list" });
            }
            
            response = await axios.get(`${url}/api/resource/${doctype}`, {
              params: {
                filters: filters ? JSON.stringify(filters) : undefined,
                fields: fields ? JSON.stringify(fields) : undefined
              },
              headers: {
                'Authorization': `token ${apiKey}:${apiSecret}`
              }
            });
            break;
            
          default:
            return res.status(400).json({ message: "Invalid method" });
        }
        
        res.json(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          return res.status(error.response?.status || 500).json({ 
            message: "ERPNext API error", 
            error: error.response?.data || error.message 
          });
        }
        
        res.status(500).json({ 
          message: "ERPNext API error", 
          error: (error as Error).message 
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to query ERPNext API", error: (error as Error).message });
    }
  });
  
  // ERPNext API proxy route for creating documents
  app.post(`${apiPrefix}/erp/create`, async (req, res) => {
    try {
      const { userId, connectionId, doctype, doc } = req.body;
      
      if (!userId || !doctype || !doc) {
        return res.status(400).json({ message: "User ID, doctype, and document data are required" });
      }
      
      const connection = connectionId 
        ? await storage.getErpConnection(parseInt(userId)) 
        : await storage.getErpConnection(parseInt(userId));
      
      if (!connection) {
        return res.status(404).json({ message: "ERP connection not found" });
      }
      
      const { url, apiKey, apiSecret } = connection;
      
      try {
        // Create document in ERPNext
        const response = await axios.post(`${url}/api/resource/${doctype}`, doc, {
          headers: {
            'Authorization': `token ${apiKey}:${apiSecret}`,
            'Content-Type': 'application/json'
          }
        });
        
        res.json({
          success: true,
          message: `${doctype} created successfully`,
          doc: response.data.data
        });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          return res.status(error.response?.status || 500).json({ 
            success: false,
            message: "ERPNext API error", 
            error: error.response?.data || error.message 
          });
        }
        
        res.status(500).json({ 
          success: false,
          message: "ERPNext API error", 
          error: (error as Error).message 
        });
      }
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Failed to create document in ERPNext", 
        error: (error as Error).message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
