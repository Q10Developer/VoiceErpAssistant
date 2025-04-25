import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Server, RefreshCw } from "lucide-react";
import axios from "axios";

// A standalone tool to test QBS connection
const QbsTestTool = () => {
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
        apiSecret
      });

      setTestResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const saveConnection = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await axios.post("/api/connection", {
        userId: 1, // Default user ID - would come from auth in a real app
        url,
        apiKey,
        apiSecret,
        isActive: true
      });

      setTestResult({
        success: true,
        message: "Connection saved successfully"
      });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="w-5 h-5" />
          QBS Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">QBS Server URL</label>
            <Input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://qbs.example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">API Key</label>
            <Input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="API Key"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">API Secret</label>
            <Input
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              placeholder="API Secret"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={testConnection}
              disabled={isLoading}
              className="flex-1"
              variant="outline"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
            <Button
              onClick={saveConnection}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                "Save Connection"
              )}
            </Button>
          </div>

          {testResult && (
            <div className={`p-3 rounded ${testResult.success ? "bg-green-100" : "bg-red-100"}`}>
              <p className={`font-medium ${testResult.success ? "text-green-800" : "text-red-800"}`}>
                {testResult.success ? "Connection Successful" : "Connection Failed"}
              </p>
              <p className="text-sm mt-1">
                {testResult.message || (testResult.success ? "Connected to QBS successfully" : "Failed to connect to QBS")}
              </p>
              {testResult.user && (
                <p className="text-sm mt-1">
                  <span className="font-medium">Connected as:</span> {testResult.user}
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 rounded bg-red-100">
              <p className="font-medium text-red-800">Error</p>
              <p className="text-sm mt-1 text-red-800">{error}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QbsTestTool;