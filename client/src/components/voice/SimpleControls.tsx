import React, { useState } from "react";
import { Mic, Square, Check, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";

// A completely standalone control panel that doesn't depend on any context
const SimpleControls = () => {
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Simple recording simulation - no real speech recognition
  const startRecording = () => {
    setIsRecording(true);
    setResult("");
  };
  
  const stopRecording = () => {
    setIsRecording(false);
  };
  
  // Simple direct API call without using contexts
  const processCommand = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    setResult("");
    
    try {
      // First save the command to history
      await axios.post('/api/commands', {
        userId: 1,  // Fixed user ID
        command: inputText,
        status: "pending"
      });
      
      // First, check if it's an ERP command
      const command = inputText.toLowerCase();
      if (command.includes('inventory') || command.includes('check') || 
          command.includes('order') || command.includes('invoice') || command.includes('user list')) {
        
        // Get the connection information
        const connectionResponse = await axios.get('/api/connection/1');
        const connection = connectionResponse.data;
        console.log("Direct connection data:", connection);
        
        if (connection && connection.url) {
          // Handle inventory check
          if (command.includes('inventory') || command.includes('check')) {
            // Extract product name - very basic implementation
            let productName = "Plate"; // Default if none specified
            const productMatch = command.match(/for (\w+)/i);
            if (productMatch && productMatch[1]) {
              productName = productMatch[1];
            }
            
            // Make direct inventory API call
            const itemResponse = await axios.post('/api/erp/query', {
              userId: connection.userId,
              connectionId: connection.id,
              method: 'get_list',
              doctype: 'Item',
              filters: [["item_name", "like", `%${productName}%`]],
              fields: ["name", "item_name", "stock_uom"]
            });
            
            if (itemResponse.data.success && itemResponse.data.data && itemResponse.data.data.length > 0) {
              const item = itemResponse.data.data[0];
              
              // Now get inventory information for this item
              const binResponse = await axios.post('/api/erp/query', {
                userId: connection.userId,
                connectionId: connection.id,
                method: 'get_list',
                doctype: 'Bin',
                filters: [["item_code", "=", item.name]],
                fields: ["warehouse", "actual_qty", "item_code"]
              });
              
              if (binResponse.data.success) {
                const bins = binResponse.data.data || [];
                if (bins.length > 0) {
                  let totalQty = 0;
                  bins.forEach((bin: any) => {
                    totalQty += (bin.actual_qty || 0);
                  });
                  
                  setResult(`Product ${item.item_name} has ${totalQty} units in stock.`);
                } else {
                  setResult(`Product ${item.item_name} found but no inventory information available.`);
                }
              } else {
                setResult(`Error retrieving inventory for ${productName}: ${binResponse.data.message || 'Unknown error'}`);
              }
            } else {
              setResult(`No products found matching "${productName}".`);
            }
          } 
          // Handle orders
          else if (command.includes('order')) {
            const ordersResponse = await axios.post('/api/erp/query', {
              userId: connection.userId,
              connectionId: connection.id,
              method: 'get_list',
              doctype: 'Sales Order',
              filters: [["docstatus", "=", "1"], ["status", "not in", "Completed,Cancelled,Closed"]],
              fields: ["name", "customer", "grand_total", "status", "transaction_date"]
            });
            
            if (ordersResponse.data.success && ordersResponse.data.data) {
              const orders = ordersResponse.data.data;
              if (orders.length > 0) {
                setResult(`Found ${orders.length} open orders. The most recent is ${orders[0].name} for customer ${orders[0].customer}.`);
              } else {
                setResult("No open orders found.");
              }
            } else {
              setResult(`Error retrieving orders: ${ordersResponse.data.message || 'Unknown error'}`);
            }
          }
          // Handle user list command
          else if (command.includes('user list')) {
            try {
              console.log("Processing user list command");
              const usersResponse = await axios.post('/api/erp/query', {
                userId: connection.userId,
                connectionId: connection.id,
                method: 'get_list',
                doctype: 'User',
                filters: [],
                fields: ['name', 'full_name', 'email', 'enabled']
              });
              
              console.log("User list response:", usersResponse.data);
              
              if (usersResponse.data.success && usersResponse.data.data) {
                const users = usersResponse.data.data;
                if (users.length > 0) {
                  const userList = users.map((user: any) => 
                    `${user.full_name || user.name} (${user.email || 'No email'})`
                  ).join(', ');
                  
                  setResult(`Found ${users.length} users: ${userList}`);
                } else {
                  setResult("No users found.");
                }
              } else {
                setResult(`Error retrieving user list: ${usersResponse.data.message || 'Unknown error'}`);
              }
            } catch (error) {
              console.error("Error processing user list command:", error);
              setResult(`Error retrieving user list: ${(error as Error).message}`);
            }
          }
          // Default response
          else {
            setResult(`Processing ERP command: "${inputText}"`);
          }
        } else {
          setResult("No valid ERPNext connection found. Please configure your connection in settings.");
        }
      } 
      // Non-ERP command
      else {
        setResult(`Processed command: "${inputText}"`);
      }
      
      // Save the command result
      await axios.post('/api/commands', {
        userId: 1,
        command: inputText,
        response: result,
        status: "success"
      });
      
      setIsProcessing(false);
    } catch (error) {
      console.error("Error processing command:", error);
      setResult(`Error processing command: ${(error as Error).message}`);
      setIsProcessing(false);
      
      // Save the error
      await axios.post('/api/commands', {
        userId: 1,
        command: inputText,
        response: `Error: ${(error as Error).message}`,
        status: "error"
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 border-b">
        <h2 className="font-semibold text-xl text-center text-white">ERPNext Voice Assistant</h2>
        
        <div className="flex items-center justify-center mt-2">
          <span className={`inline-block w-4 h-4 rounded-full mr-2 ${
            isProcessing ? 'bg-yellow-300 animate-pulse' : 
            isRecording ? 'bg-red-400 animate-pulse' : 
            'bg-green-300'
          }`}></span>
          <span className="text-sm font-medium text-white">
            {isProcessing ? "Processing..." : 
             isRecording ? "Listening..." : 
             "Ready for command"}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        {/* Command suggestions */}
        <div className="mb-5">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Try these commands:</h3>
          <div className="flex flex-wrap gap-2">
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
              user list
            </span>
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
              check inventory for Plate
            </span>
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
              show orders
            </span>
          </div>
        </div>
      
        {/* Command input field */}
        <div className="mb-5">
          <div className="flex items-center border-2 border-blue-200 rounded-lg overflow-hidden shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
            <span className="bg-blue-50 p-3 border-r border-blue-200">
              <Server className="h-5 w-5 text-blue-500" />
            </span>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your command or click on microphone..."
              className="w-full p-3 focus:outline-none bg-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputText.trim()) {
                  processCommand();
                }
              }}
            />
          </div>
        </div>
        
        {/* Voice control buttons */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-lg shadow-md transition-all hover:shadow-lg"
            onClick={startRecording}
            disabled={isRecording || isProcessing}
          >
            <Mic className="mr-2 h-5 w-5" />
            Start Listening
          </Button>
          
          <Button 
            className="bg-red-500 hover:bg-red-600 text-white py-6 rounded-lg shadow-md transition-all hover:shadow-lg"
            onClick={stopRecording}
            disabled={!isRecording || isProcessing}
          >
            <Square className="mr-2 h-5 w-5" />
            Stop Listening
          </Button>
          
          <Button 
            className="bg-green-500 hover:bg-green-600 text-white py-6 rounded-lg shadow-md transition-all hover:shadow-lg"
            onClick={processCommand}
            disabled={!inputText.trim() || isProcessing}
          >
            <Check className="mr-2 h-5 w-5" />
            Process Command
          </Button>
        </div>
        
        {/* Result display with animation */}
        <div className={`mt-5 transition-all duration-300 ${result || isProcessing ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
          <Card className="overflow-hidden border-2 border-blue-100 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-blue-800">Response</h3>
                {isProcessing && (
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                )}
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 text-gray-700 min-h-[100px] flex items-center justify-center">
                {isProcessing ? (
                  <span className="text-blue-500 font-medium">Processing your command...</span>
                ) : (
                  <div className="w-full">
                    <p className="font-medium text-indigo-900 mb-2">Command Result:</p>
                    <p>{result}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SimpleControls;