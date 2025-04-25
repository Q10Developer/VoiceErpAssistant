import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Server, RefreshCw } from "lucide-react";
import axios from "axios";

// A standalone tool to test ERPNext connection
const ErpTestTool = () => {
  const [url, setUrl] = useState("https://qbs.q10analytics.com");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    setError(null);

    try {
      const response = await axios.post("/api/connection/test", {
        url,
        apiKey,
        apiSecret,
      });

      setTestResult(response.data);
    } catch (err: any) {
      console.error("Error testing connection:", err);
      setError(err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const saveConnection = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await axios.post("/api/connection", {
        userId: 1, // Fixed user ID for testing
        url: url,
        apiKey: apiKey,
        apiSecret: apiSecret,
        isActive: true,
      });

      setTestResult({ ...testResult, saved: true });
    } catch (err: any) {
      console.error("Error saving connection:", err);
      setError(err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-6 w-6" />
          ERPNext Connection Tester
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2">
            <label htmlFor="url" className="text-sm font-medium">
              ERPNext URL
            </label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-erpnext-instance.com"
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Enter the base URL of your ERPNext instance without /app or trailing slashes
            </p>
          </div>

          <div className="grid gap-2">
            <label htmlFor="apiKey" className="text-sm font-medium">
              API Key
            </label>
            <Input
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="API Key"
              className="w-full"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="apiSecret" className="text-sm font-medium">
              API Secret
            </label>
            <Input
              id="apiSecret"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              placeholder="API Secret"
              className="w-full"
              type="password"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={testConnection} 
              disabled={isLoading || !url || !apiKey || !apiSecret}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
              Test Connection
            </Button>
            
            {testResult?.success && (
              <Button
                onClick={saveConnection}
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600"
              >
                Save Connection
              </Button>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
              <h3 className="font-medium mb-1">Error</h3>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {testResult && (
            <div className="p-4 bg-gray-50 border rounded-md">
              <h3 className="font-medium mb-2">Connection Test Result</h3>
              <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto max-h-[300px]">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="font-medium mb-1">Troubleshooting Tips</h3>
            <ul className="text-sm list-disc pl-5 space-y-1">
              <li>The URL should be the base URL without "/app" at the end</li>
              <li>Make sure both API Key and API Secret are complete and correct</li>
              <li>Check that your ERPNext instance has API access enabled</li>
              <li>Verify that the user associated with the API key has sufficient permissions</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErpTestTool;