import React, { useState } from "react";
import { Mic, Square, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceContext } from "@/context/VoiceContext";
import { useToast } from "@/hooks/use-toast";

// An enhanced version of the basic controls that interacts with VoiceContext
const BasicControls = () => {
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  
  const { processCommand } = useVoiceContext();
  const { toast } = useToast();
  
  const startRecording = () => {
    setIsRecording(true);
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
  
  const handleProcessCommand = () => {
    setIsRecording(false);
    if (inputText.trim()) {
      processCommand(inputText.trim());
      toast({
        title: "Command Processed",
        description: `Processing: "${inputText}"`,
      });
      setInputText("");
    } else {
      toast({
        title: "Empty Command",
        description: "Please enter a command to process",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm">
      <h2 className="font-semibold text-lg mb-4 text-center">Voice Controls</h2>
      
      <div className="mb-4 border-b pb-4">
        <div className="text-center">
          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></span>
          <span className="text-sm font-medium">
            {isRecording ? "Recording Active" : "Ready"}
          </span>
        </div>
      </div>
      
      {/* Command input field */}
      <div className="mb-4">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your command here..."
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
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
          onClick={handleProcessCommand}
          disabled={!inputText.trim()}
        >
          <Check className="mr-2 h-4 w-4" />
          Process
        </Button>
      </div>
      
      {/* Help text */}
      <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-500">
        <p>Since speech recognition is causing errors, this control panel allows you to manually enter commands.</p>
        <p className="mt-1">Try commands like "check inventory" or "create invoice for customer"</p>
      </div>
    </div>
  );
};

export default BasicControls;