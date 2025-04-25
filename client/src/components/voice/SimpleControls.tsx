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
      
      // Simulate command processing
      setTimeout(() => {
        setResult(`Processed command: "${inputText}"`);
        setIsProcessing(false);
        setInputText("");
      }, 1000);
      
    } catch (error) {
      console.error("Error processing command:", error);
      setResult("Error processing command");
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
      <div className="bg-gray-50 p-4 border-b">
        <h2 className="font-semibold text-lg text-center">Simple Voice Controls</h2>
        
        <div className="flex items-center justify-center mt-2">
          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
            isProcessing ? 'bg-yellow-500 animate-pulse' : 
            isRecording ? 'bg-red-500 animate-pulse' : 
            'bg-gray-300'
          }`}></span>
          <span className="text-sm font-medium">
            {isProcessing ? "Processing..." : 
             isRecording ? "Recording Active" : 
             "Ready"}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        {/* Command input field */}
        <div className="mb-4">
          <div className="flex items-center border rounded-md overflow-hidden">
            <span className="bg-gray-100 p-2 border-r">
              <Server className="h-5 w-5 text-gray-500" />
            </span>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your command here (e.g., 'check inventory')"
              className="w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputText.trim()) {
                  processCommand();
                }
              }}
            />
          </div>
        </div>
        
        {/* Three fixed buttons in a row */}
        <div className="grid grid-cols-3 gap-2">
          <Button 
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={startRecording}
            disabled={isRecording || isProcessing}
          >
            <Mic className="mr-2 h-4 w-4" />
            Start
          </Button>
          
          <Button 
            className="bg-red-500 hover:bg-red-600 text-white"
            onClick={stopRecording}
            disabled={!isRecording || isProcessing}
          >
            <Square className="mr-2 h-4 w-4" />
            Stop
          </Button>
          
          <Button 
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={processCommand}
            disabled={!inputText.trim() || isProcessing}
          >
            <Check className="mr-2 h-4 w-4" />
            Process
          </Button>
        </div>
        
        {/* Result display */}
        {(result || isProcessing) && (
          <Card className="mt-4 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Command Result</h3>
              </div>
              <div className="p-3 bg-gray-50 rounded border text-gray-800 min-h-[80px]">
                {isProcessing ? (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-sm text-gray-500">Processing command...</span>
                  </div>
                ) : (
                  result
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SimpleControls;