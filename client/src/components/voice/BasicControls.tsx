import React, { useState, useEffect } from "react";
import { Mic, Square, Check, Server, RefreshCw, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceContext } from "@/context/VoiceContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

// A comprehensive control panel with command input and result display
const BasicControls = () => {
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { 
    processCommand, 
    voiceState, 
    resultText,
    commandHistory = []
  } = useVoiceContext();
  
  const { toast } = useToast();
  
  // Update local result when resultText changes
  useEffect(() => {
    if (resultText) {
      setResult(resultText);
      setIsProcessing(false);
    }
  }, [resultText]);

  // Update local state based on voiceState
  useEffect(() => {
    if (voiceState === "processing") {
      setIsProcessing(true);
    } else if (voiceState === "result") {
      setIsProcessing(false);
    }
  }, [voiceState]);
  
  const startRecording = () => {
    setIsRecording(true);
    setResult("");
    toast({
      title: "Recording Started",
      description: "Type your command in the text field below",
    });
  };
  
  const stopRecording = () => {
    setIsRecording(false);
    toast({
      title: "Recording Stopped",
      description: "You can edit your command before processing",
    });
  };
  
  const handleProcessCommand = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Empty Command",
        description: "Please enter a command to process",
        variant: "destructive"
      });
      return;
    }
    
    setIsRecording(false);
    setIsProcessing(true);
    setResult("");
    
    try {
      await processCommand(inputText.trim());
      // Result will be updated via the useEffect that monitors resultText
      setInputText("");
    } catch (error) {
      setIsProcessing(false);
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: "Error Processing Command",
        description: `${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
      <div className="bg-gray-50 p-4 border-b">
        <h2 className="font-semibold text-lg text-center">Voice Assistant Control Panel</h2>
        
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
                  handleProcessCommand();
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
            onClick={handleProcessCommand}
            disabled={!inputText.trim() || isProcessing}
          >
            {isProcessing ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Process
          </Button>
        </div>
        
        {/* Result display */}
        {(result || isProcessing) && (
          <Card className="mt-4 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Command Result</h3>
                {isProcessing && (
                  <RefreshCw className="h-4 w-4 animate-spin text-yellow-500" />
                )}
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
        
        {/* Most recent command */}
        {commandHistory.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded border text-xs">
            <p className="font-medium mb-1">Last Command:</p>
            <p>"{commandHistory[0]?.command}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BasicControls;