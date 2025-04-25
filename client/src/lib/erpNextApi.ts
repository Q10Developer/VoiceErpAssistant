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

// We no longer use mock data - all requests will go to the actual QBS instance

// ERP API service
export const erpNextApi = {
  // Get inventory information for a product
  async getInventory(connection: ErpConnection, productName: string): Promise<ErpResponse<any[]>> {
    try {
      // First, find the item by name
      console.log("Searching for item with name:", productName);
      const itemResponse = await apiRequest("POST", "/api/erp/query", {
        userId: connection.userId,
        connectionId: connection.id,
        method: "get_list",
        doctype: "Item",
        filters: [["item_name", "like", `%${productName}%`]],
        fields: ["name", "item_name", "stock_uom"]
      });
      
      const itemData = await itemResponse.json();
      console.log("QBS item search response:", itemData);
      
      if (!itemData.data || !Array.isArray(itemData.data) || itemData.data.length === 0) {
        return {
          success: false,
          message: `No items found matching '${productName}'`,
          data: []
        };
      }
      
      // Get the first matching item
      const item = itemData.data[0];
      const itemCode = item.name;
      
      // Now get inventory information for this item
      console.log("Getting inventory for item code:", itemCode);
      const binResponse = await apiRequest("POST", "/api/erp/query", {
        userId: connection.userId,
        connectionId: connection.id,
        method: "get_list",
        doctype: "Bin",
        filters: [["item_code", "=", itemCode]],
        fields: ["warehouse", "actual_qty", "item_code"]
      });
      
      const binData = await binResponse.json();
      console.log("QBS bin data response:", binData);
      
      // Combine item and bin data
      const result = binData.data && binData.data.length > 0 ? 
        binData.data.map((bin: any) => ({
          ...bin,
          item_name: item.item_name,
          stock_uom: item.stock_uom
        })) : 
        [{
          item_code: itemCode,
          item_name: item.item_name,
          actual_qty: 0,
          warehouse: "All Warehouses",
          stock_uom: item.stock_uom
        }];
        
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error("QBS inventory error:", error);
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
      // First, verify customer exists
      console.log("Checking if customer exists:", customerName);
      const customerResponse = await apiRequest("POST", "/api/erp/query", {
        userId: connection.userId,
        connectionId: connection.id,
        method: "get_list",
        doctype: "Customer",
        filters: [["name", "like", `%${customerName}%`]],
        fields: ["name", "customer_name"]
      });
      
      const customerData = await customerResponse.json();
      console.log("QBS customer search response:", customerData);
      
      if (!customerData.data || !Array.isArray(customerData.data) || customerData.data.length === 0) {
        return {
          success: false,
          message: `No customer found matching '${customerName}'`,
          data: {}
        };
      }
      
      // Get customer ID
      const customer = customerData.data[0];
      const customerId = customer.name;
      
      // Find an item to add to the invoice
      console.log("Looking for an item to add to invoice");
      const itemResponse = await apiRequest("POST", "/api/erp/query", {
        userId: connection.userId,
        connectionId: connection.id,
        method: "get_list",
        doctype: "Item",
        filters: [],
        fields: ["name", "item_name"]
      });
      
      const itemData = await itemResponse.json();
      if (!itemData.data || !Array.isArray(itemData.data) || itemData.data.length === 0) {
        return {
          success: false,
          message: "No items found to add to invoice",
          data: {}
        };
      }
      
      // Pick the first item as a sample
      const item = itemData.data[0];
      
      // Now create the invoice
      console.log("Creating invoice for customer:", customerId);
      const response = await apiRequest("POST", "/api/erp/create", {
        userId: connection.userId,
        connectionId: connection.id,
        doctype: "Sales Invoice",
        doc: {
          customer: customerId,
          is_pos: 0,
          items: [
            {
              item_code: item.name,
              qty: 1
            }
          ]
        }
      });
      
      const data = await response.json();
      console.log("QBS create invoice response:", data);
      
      if (!data.success) {
        return {
          success: false,
          message: data.message || "Failed to create invoice",
          data: {}
        };
      }
      
      return {
        success: true,
        message: `Sales invoice created for customer ${customer.customer_name || customerId}`,
        data: data.doc || {}
      };
    } catch (error) {
      console.error("QBS create invoice error:", error);
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
      console.log("Getting open sales orders");
      // Make actual API call to QBS through our proxy endpoint
      const response = await apiRequest("POST", "/api/erp/query", {
        userId: connection.userId,
        connectionId: connection.id,
        method: "get_list",
        doctype: "Sales Order",
        filters: [["docstatus", "=", "1"], ["status", "not in", "Completed,Cancelled,Closed"]],
        fields: ["name", "customer", "grand_total", "status", "transaction_date"]
      });
      
      const data = await response.json();
      console.log("QBS open orders response:", data);
      
      if (!data.data || !Array.isArray(data.data)) {
        return {
          success: false,
          message: "No sales orders found or invalid response format",
          data: []
        };
      }
      
      // Process the data to ensure it's in the right format
      const orders = data.data.map((order: any) => ({
        name: order.name || "Unknown",
        customer: order.customer || "Unknown Customer",
        grand_total: order.grand_total || 0,
        status: order.status || "Open",
        transaction_date: order.transaction_date || new Date().toISOString().split('T')[0]
      }));
      
      return {
        success: true,
        message: `Found ${orders.length} open order(s)`,
        data: orders
      };
    } catch (error) {
      console.error("QBS open orders error:", error);
      return {
        success: false,
        message: (error as Error).message,
        data: []
      };
    }
  },
  
  // Test connection to QBS
  async testConnection(url: string, apiKey: string, apiSecret: string): Promise<ErpResponse<any>> {
    try {
      // In a real implementation, this would test connection to QBS API
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
