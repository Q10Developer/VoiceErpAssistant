import axios from "axios";
import { apiRequest } from "./queryClient";

interface ErpConnection {
  id?: number;
  userId: number;
  url: string;
  apiKey: string;
  apiSecret: string;
  isActive: boolean;
  lastConnected?: Date;
}

interface ErpResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// We no longer use mock data - all requests will go to the actual ERPNext instance

// ERP API service
export const erpNextApi = {
  // Get inventory information for a product
  async getInventory(connection: ErpConnection, productName: string): Promise<ErpResponse<any[]>> {
    try {
      // Make actual API call to ERPNext through our proxy endpoint
      const response = await apiRequest("POST", "/api/erp/query", {
        userId: connection.userId,
        connectionId: connection.id,
        method: "get_list",
        doctype: "Bin",
        filters: [["item_name", "like", `%${productName}%`]],
        fields: ["item_code", "item_name", "actual_qty", "warehouse"]
      });
      
      const data = await response.json();
      
      return {
        success: true,
        data: data.items || []
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
        data: []
      };
    }
  },
  
  // Create invoice for a customer
  async createInvoice(connection: ErpConnection, customerName: string): Promise<ErpResponse<any>> {
    try {
      // Make actual API call to ERPNext through our proxy endpoint
      const response = await apiRequest("POST", "/api/erp/create", {
        userId: connection.userId,
        connectionId: connection.id,
        doctype: "Sales Invoice",
        doc: {
          customer: customerName,
          is_pos: 0,
          items: [
            {
              item_code: "Standard Product", // This should be replaced with actual item code
              qty: 1
            }
          ]
        }
      });
      
      const data = await response.json();
      
      return {
        success: data.success || false,
        message: data.message,
        data: data.doc || {}
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
        data: {}
      };
    }
  },
  
  // Get list of open orders
  async getOpenOrders(connection: ErpConnection): Promise<ErpResponse<any[]>> {
    try {
      // Make actual API call to ERPNext through our proxy endpoint
      const response = await apiRequest("POST", "/api/erp/query", {
        userId: connection.userId,
        connectionId: connection.id,
        method: "get_list",
        doctype: "Sales Order",
        filters: [["status", "not in", "Completed,Cancelled,Closed"]],
        fields: ["name", "customer", "grand_total", "status", "transaction_date"]
      });
      
      const data = await response.json();
      
      return {
        success: true,
        data: data.items || []
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
        data: []
      };
    }
  },
  
  // Test connection to ERPNext
  async testConnection(url: string, apiKey: string, apiSecret: string): Promise<ErpResponse<any>> {
    try {
      // In a real implementation, this would test connection to ERPNext API
      // For demonstration purposes, we will simulate success if all parameters are provided
      
      // Call our backend proxy to test the connection
      const response = await apiRequest("POST", "/api/connection/test", {
        url,
        apiKey,
        apiSecret
      });
      
      const result = await response.json();
      
      return {
        success: result.success,
        message: result.message || result.user,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
        data: null
      };
    }
  }
};
