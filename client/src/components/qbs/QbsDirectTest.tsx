import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Package, ClipboardList, Plus, MessageSquare } from "lucide-react";
import { qbsApi } from '@/lib/qbsApi';
import { handleVoiceCommand } from '@/lib/qbsCommands';

// Interface for the test result
interface TestResult {
  command: string;
  success: boolean;
  data: any;
  message?: string;
  error?: any;
}

const QbsDirectTest = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [connection, setConnection] = useState<any>(null);

  // Load the connection data first
  React.useEffect(() => {
    async function loadConnection() {
      try {
        const response = await fetch('/api/connection/1');
        if (response.ok) {
          const data = await response.json();
          setConnection(data);
        } else {
          setResults(prev => [
            { 
              command: 'Load Connection', 
              success: false, 
              data: null, 
              message: 'Failed to load QBS connection. Please go to Settings and configure your connection.'
            },
            ...prev
          ]);
        }
      } catch (error) {
        setResults(prev => [
          { 
            command: 'Load Connection', 
            success: false, 
            data: null, 
            message: 'Error loading connection',
            error
          },
          ...prev
        ]);
      }
    }
    
    loadConnection();
  }, []);

  const testInventory = async () => {
    if (!connection) return;
    
    setLoading(true);
    try {
      const result = await qbsApi.getInventory(connection, "Plate");
      setResults(prev => [
        { 
          command: 'Check Inventory for "Plate"', 
          success: result.success, 
          data: result.data, 
          message: result.message
        },
        ...prev
      ]);
    } catch (error) {
      setResults(prev => [
        { 
          command: 'Check Inventory for "Plate"', 
          success: false, 
          data: null, 
          message: 'Test failed with error',
          error
        },
        ...prev
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const testOrders = async () => {
    if (!connection) return;
    
    setLoading(true);
    try {
      const result = await qbsApi.getOpenOrders(connection);
      setResults(prev => [
        { 
          command: 'Show Open Orders', 
          success: result.success, 
          data: result.data, 
          message: result.message
        },
        ...prev
      ]);
    } catch (error) {
      setResults(prev => [
        { 
          command: 'Show Open Orders', 
          success: false, 
          data: null, 
          message: 'Test failed with error',
          error
        },
        ...prev
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const testCreateInvoice = async () => {
    if (!connection) return;
    
    setLoading(true);
    try {
      const result = await qbsApi.createInvoice(connection, "Administrator");
      setResults(prev => [
        { 
          command: 'Create Invoice for "Administrator"', 
          success: result.success, 
          data: result.data, 
          message: result.message
        },
        ...prev
      ]);
    } catch (error) {
      setResults(prev => [
        { 
          command: 'Create Invoice for "Administrator"', 
          success: false, 
          data: null, 
          message: 'Test failed with error',
          error
        },
        ...prev
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const testUserList = async () => {
    if (!connection) return;
    
    setLoading(true);
    try {
      // Make direct API call to fetch user list
      const response = await fetch('/api/qbs/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: connection.userId,
          connectionId: connection.id,
          method: 'get_list',
          doctype: 'User',
          filters: [],
          fields: ['name', 'full_name', 'email', 'enabled']
        })
      });
      
      const result = await response.json();
      
      setResults(prev => [
        { 
          command: 'Get User List', 
          success: result.success, 
          data: result.data, 
          message: result.message
        },
        ...prev
      ]);
    } catch (error) {
      setResults(prev => [
        { 
          command: 'Get User List', 
          success: false, 
          data: null, 
          message: 'Test failed with error',
          error
        },
        ...prev
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  // Test direct voice command processing
  const testVoiceCommand = async () => {
    if (!connection) return;
    
    setLoading(true);
    try {
      // Log connection to see its format
      console.log("Connection being passed to voice command handler:", connection);
      
      // Test processing a voice command directly
      const command = "check inventory for product Plate";
      
      // Create a proper connection object with the required structure
      const formattedConnection = {
        id: connection.id,
        userId: connection.userId,
        url: connection.url,
        apiKey: connection.apiKey,
        apiSecret: connection.apiSecret,
        isActive: connection.isActive,
        lastConnected: connection.lastConnected
      };
      
      console.log("Formatted connection:", formattedConnection);
      
      const result = await handleVoiceCommand(command, formattedConnection);
      console.log("Voice command result:", result);
      
      setResults(prev => [
        { 
          command: `Voice Command: "${command}"`, 
          success: true, 
          data: { 
            connection: connection,
            formattedConnection: formattedConnection,
            response: result 
          }, 
          message: result
        },
        ...prev
      ]);
    } catch (error) {
      console.error("Error testing voice command:", error);
      setResults(prev => [
        { 
          command: 'Voice Command Test', 
          success: false, 
          data: null, 
          message: 'Test failed with error',
          error
        },
        ...prev
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          QBS Direct API Test
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!connection ? (
          <div className="text-amber-600 mb-4">
            Loading connection data or no connection configured...
          </div>
        ) : (
          <div className="text-green-600 mb-4">
            Connected to {connection.url}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          <Button 
            onClick={testUserList} 
            disabled={loading || !connection}
            className="flex items-center"
            variant="outline"
          >
            <Database className="mr-2 h-4 w-4" />
            Test User List API
          </Button>
          
          <Button 
            onClick={testInventory} 
            disabled={loading || !connection}
            className="flex items-center"
            variant="outline"
          >
            <Package className="mr-2 h-4 w-4" />
            Test Inventory API
          </Button>
          
          <Button 
            onClick={testOrders} 
            disabled={loading || !connection}
            className="flex items-center"
            variant="outline"
          >
            <ClipboardList className="mr-2 h-4 w-4" />
            Test Orders API
          </Button>
          
          <Button 
            onClick={testCreateInvoice} 
            disabled={loading || !connection}
            className="flex items-center"
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Test Create Invoice API
          </Button>
          
          <Button 
            onClick={testVoiceCommand} 
            disabled={loading || !connection}
            className="flex items-center"
            variant="default"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Test Voice Command Handler
          </Button>
        </div>

        {results.length > 0 && (
          <div className="border rounded-md p-4 max-h-[400px] overflow-auto">
            <h3 className="font-medium mb-2">API Test Results</h3>
            
            {results.map((result, index) => (
              <div key={index} className="mb-4 border-b pb-2 last:border-0">
                <h4 className={`font-medium ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                  {result.command} - {result.success ? 'Success' : 'Failed'}
                </h4>
                
                {result.message && (
                  <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                )}
                
                {result.success && result.data && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-500">Response Data:</p>
                    <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto max-h-[200px]">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
                
                {!result.success && result.error && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-red-500">Error:</p>
                    <pre className="text-xs bg-red-50 p-2 rounded mt-1 overflow-auto max-h-[200px]">
                      {JSON.stringify(result.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QbsDirectTest;