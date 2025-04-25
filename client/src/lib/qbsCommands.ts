import { queryClient } from "./queryClient";
import { qbsApi } from "./qbsApi";

// For debugging purposes
const DEBUG = true;

function logDebug(message: string, data?: any) {
  if (DEBUG) {
    console.log(`[QBSCommand] ${message}`, data || '');
  }
}

interface ErpConnection {
  id?: number;
  userId: number;
  url: string;
  apiKey: string;
  apiSecret: string;
  isActive: boolean;
  lastConnected?: Date;
}

// Helper function to extract number from string
function extractNumber(text: string): number | null {
  const matches = text.match(/\d+/);
  return matches ? parseInt(matches[0]) : null;
}

// Helper function to extract product name from string
function extractProductName(text: string): string | null {
  // Look for common patterns like "for product X" or "of product X"
  const patterns = [
    /for product\s+([a-zA-Z0-9\s]+)(?:$|\s|\.)/i,
    /of product\s+([a-zA-Z0-9\s]+)(?:$|\s|\.)/i,
    /product\s+([a-zA-Z0-9\s]+)(?:$|\s|\.)/i,
    /for\s+([a-zA-Z0-9\s]+)(?:$|\s|\.)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
}

// Helper function to extract customer name from string
function extractCustomerName(text: string): string | null {
  // Look for common patterns like "for customer X" or "of customer X"
  const patterns = [
    /for customer\s+([a-zA-Z0-9\s]+)(?:$|\s|\.)/i,
    /of customer\s+([a-zA-Z0-9\s]+)(?:$|\s|\.)/i,
    /customer\s+([a-zA-Z0-9\s]+)(?:$|\s|\.)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
}

// Handle check inventory command
async function handleInventoryCheck(command: string, erpConnection: ErpConnection | null): Promise<string> {
  logDebug("Handling inventory check command", { command, erpConnection });
  
  if (!erpConnection) {
    return "You need to connect to QBS first. Please go to Settings and set up your connection.";
  }
  
  const productName = extractProductName(command);
  logDebug("Extracted product name", productName);
  
  if (!productName) {
    return "Please specify a product name for inventory check. For example, 'Check inventory for product XYZ'.";
  }
  
  try {
    logDebug("Calling QBS API for inventory", { productName });
    const response = await qbsApi.getInventory(erpConnection, productName);
    logDebug("QBS inventory response", response);
    
    if (response.success) {
      if (response.data.length === 0) {
        return `No inventory found for product ${productName}.`;
      }
      
      // Format inventory information
      const item = response.data[0];
      logDebug("Item data from inventory", item);
      return `Product ${item.item_name || productName} has ${item.actual_qty || 0} units in stock.`;
    } else {
      return `Error checking inventory: ${response.message}`;
    }
  } catch (error) {
    logDebug("Error in inventory check", error);
    return `Error checking inventory: ${(error as Error).message}`;
  }
}

// Handle create invoice command
async function handleCreateInvoice(command: string, erpConnection: ErpConnection | null): Promise<string> {
  logDebug("Handling create invoice command", { command, erpConnection });
  
  if (!erpConnection) {
    return "You need to connect to QBS first. Please go to Settings and set up your connection.";
  }
  
  const customerName = extractCustomerName(command);
  logDebug("Extracted customer name", customerName);
  
  if (!customerName) {
    return "Please specify a customer name for the invoice. For example, 'Create invoice for customer ABC'.";
  }
  
  try {
    logDebug("Calling QBS API to create invoice", { customerName });
    const response = await qbsApi.createInvoice(erpConnection, customerName);
    logDebug("QBS create invoice response", response);
    
    if (response.success) {
      return `Sales invoice ${response.data.name || 'created'} for customer ${customerName}.`;
    } else {
      return `Error creating invoice: ${response.message}`;
    }
  } catch (error) {
    logDebug("Error in create invoice", error);
    return `Error creating invoice: ${(error as Error).message}`;
  }
}

// Handle show open orders command
async function handleShowOpenOrders(erpConnection: ErpConnection | null): Promise<string> {
  logDebug("Handling show open orders command", { erpConnection });
  
  if (!erpConnection) {
    return "You need to connect to QBS first. Please go to Settings and set up your connection.";
  }
  
  try {
    logDebug("Calling QBS API for open orders");
    const response = await qbsApi.getOpenOrders(erpConnection);
    logDebug("QBS open orders response", response);
    
    if (response.success) {
      if (response.data.length === 0) {
        return "No open orders found.";
      }
      
      // Format open orders information
      logDebug("Open orders data", response.data);
      return `Found ${response.data.length} open orders. ${response.data.length > 0 ? `The most recent is ${response.data[0].name || 'unknown'} for customer ${response.data[0].customer || 'unknown'}.` : ''}`;
    } else {
      return `Error fetching open orders: ${response.message}`;
    }
  } catch (error) {
    logDebug("Error in show open orders", error);
    return `Error fetching open orders: ${(error as Error).message}`;
  }
}

// Handle contact list command
async function handleShowContacts(erpConnection: ErpConnection | null): Promise<string> {
  logDebug("Handling show contacts command", { erpConnection });
  
  if (!erpConnection) {
    return "You need to connect to QBS first. Please go to Settings and set up your connection.";
  }
  
  try {
    logDebug("Simulating call to QBS API for contacts");
    // This would normally call the QBS API, but for this demo we'll return a simulated response
    return "Found 3 recent contacts: John Doe (Customer), Jane Smith (Supplier), and Acme Corp (Customer). Would you like to call any of them?";
  } catch (error) {
    logDebug("Error in show contacts", error);
    return `Error fetching contacts: ${(error as Error).message}`;
  }
}

// Main command handler
export async function handleVoiceCommand(command: string, erpConnection: ErpConnection | null): Promise<string> {
  logDebug("Processing voice command", { command, connection: !!erpConnection });
  const normalizedCommand = command.toLowerCase();
  
  // Check if connected
  if (!erpConnection && !normalizedCommand.includes("help") && !normalizedCommand.includes("settings")) {
    return "You need to connect to QBS first. Please go to Settings and set up your connection.";
  }
  
  // Command: Check inventory
  if (normalizedCommand.includes("check inventory") || normalizedCommand.includes("inventory check") || 
      normalizedCommand.includes("stock level") || (normalizedCommand.includes("how many") && normalizedCommand.includes("stock"))) {
    logDebug("Handling as inventory check command");
    return await handleInventoryCheck(command, erpConnection);
  }
  
  // Command: Create invoice
  if (normalizedCommand.includes("create invoice") || normalizedCommand.includes("make invoice") || 
      normalizedCommand.includes("new invoice") || normalizedCommand.includes("generate invoice")) {
    logDebug("Handling as create invoice command");
    return await handleCreateInvoice(command, erpConnection);
  }
  
  // Command: Show open orders
  if (normalizedCommand.includes("open orders") || normalizedCommand.includes("show orders") || 
      normalizedCommand.includes("pending orders") || normalizedCommand.includes("list orders")) {
    logDebug("Handling as show open orders command");
    return await handleShowOpenOrders(erpConnection);
  }
  
  // Command: Show contacts
  if (normalizedCommand.includes("contacts") || normalizedCommand.includes("contact list") || 
      normalizedCommand.includes("show contacts") || normalizedCommand.includes("list contacts")) {
    logDebug("Handling as show contacts command");
    return await handleShowContacts(erpConnection);
  }
  
  // Navigation commands
  if (normalizedCommand.includes("go to") || normalizedCommand.includes("navigate to") || normalizedCommand.includes("open")) {
    if (normalizedCommand.includes("dashboard") || normalizedCommand.includes("home")) {
      window.location.href = "/";
      return "Navigating to dashboard.";
    } else if (normalizedCommand.includes("history") || normalizedCommand.includes("command history")) {
      window.location.href = "/history";
      return "Navigating to command history.";
    } else if (normalizedCommand.includes("settings") || normalizedCommand.includes("configuration")) {
      window.location.href = "/settings";
      return "Navigating to settings.";
    }
  }
  
  // Help command
  if (normalizedCommand.includes("help") || normalizedCommand.includes("what can you do") || 
      normalizedCommand.includes("available commands")) {
    return "You can ask me to check inventory, create invoices, show contacts, show open orders, and navigate between pages. Try saying 'Check inventory for product XYZ' or 'Create invoice for customer ABC'.";
  }
  
  // Default response for unrecognized commands
  return "I'm sorry, I didn't understand that command. Try saying 'Help' to see available commands.";
}