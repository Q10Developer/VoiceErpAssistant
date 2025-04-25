import React, { useState } from "react";
import { Mic, Square, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

// A basic controls component that doesn't depend on any speech recognition
// Only for demonstrating the 3-button layout
const BasicControls = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasText, setHasText] = useState(false);
  
  const startRecording = () => {
    setIsRecording(true);
    setHasText(true);
  };
  
  const stopRecording = () => {
    setIsRecording(false);
  };
  
  const processCommand = () => {
    setIsRecording(false);
    setHasText(false);
    alert("Command processed!");
  };

  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm">
      <h2 className="font-semibold text-lg mb-4 text-center">Basic Controls</h2>
      
      <div className="mb-4 border-b pb-4">
        <div className="text-center">
          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${isRecording ? 'bg-red-500' : 'bg-gray-300'}`}></span>
          <span className="text-sm font-medium">
            {isRecording ? "Recording" : "Ready"}
          </span>
        </div>
      </div>
      
      {/* Three fixed buttons in a row */}
      <div className="grid grid-cols-3 gap-2">
        <Button 
          className="bg-blue-500 hover:bg-blue-600 text-white"
          onClick={startRecording}
          disabled={isRecording}
        >
          <Mic className="mr-2 h-4 w-4" />
          Start
        </Button>
        
        <Button 
          className="bg-red-500 hover:bg-red-600 text-white"
          onClick={stopRecording}
          disabled={!isRecording}
        >
          <Square className="mr-2 h-4 w-4" />
          Stop
        </Button>
        
        <Button 
          className="bg-green-500 hover:bg-green-600 text-white"
          onClick={processCommand}
          disabled={!hasText}
        >
          <Check className="mr-2 h-4 w-4" />
          Process
        </Button>
      </div>
      
      {hasText && (
        <div className="mt-4 p-2 bg-gray-50 rounded">
          <p className="text-gray-700">This is example recognized text.</p>
        </div>
      )}
    </div>
  );
};

export default BasicControls;