import axios from "axios";
import { apiRequest } from "./queryClient";

interface ErpConnection {
  url: string;
  apiKey: string;
}

interface ErpResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// Mock responses for development without actual ERPNext instance
const mockResponses = {
  inventory: [
    { item_code: "XYZ", item_name: "Product XYZ", actual_qty: 42, warehouse: "Stores" },
    { item_code: "ABC", item_name: "Product ABC", actual_qty: 15, warehouse: "Stores" }
  ],
  invoice: { name: "SINV-2023-00001", customer: "ABC Corp", grand_total: 1250.00 },
  openOrders: [
    { name: "SO-2023-00005", customer: "ABC Corp", grand_total: 1250.00, status: "To Deliver" },
    { name: "SO-2023-00004", customer: "XYZ Ltd", grand_total: 899.50, status: "To Deliver and Bill" }
  ]
};

// ERP API service
export const erpNextApi = {
  // Get inventory information for a product
  async getInventory(connection: ErpConnection, productName: string): Promise<ErpResponse<any[]>> {
    try {
      // In a real implementation, we would make an actual API call to ERPNext
      // For now, we'll use our proxy endpoint with mock data
      const response = await apiRequest("POST", "/api/erp/query", {
        userId: 1,
        method: "get_list",
        doctype: "Bin",
        filters: [["item_name", "like", `%${productName}%`]],
        fields: ["item_code", "item_name", "actual_qty", "warehouse"]
      });
      
      // This would be replaced with actual API call in production
      // Using mock data for demonstration
      const mockData = mockResponses.inventory.filter(item => 
        item.item_name.toLowerCase().includes(productName.toLowerCase())
      );
      
      return {
        success: true,
        data: mockData
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
      // In a real implementation, this would create an invoice via ERPNext API
      // For now, we'll simulate success and return mock data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        data: {
          ...mockResponses.invoice,
          customer: customerName
        }
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
      // In a real implementation, we would fetch open orders from ERPNext
      // For now, we'll use mock data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        success: true,
        data: mockResponses.openOrders
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
