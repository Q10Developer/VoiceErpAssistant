import React from "react";
import { Mic, Square, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceContext } from "@/context/VoiceContext";

// A new streamlined component that just handles voice control buttons
const VoiceControls: React.FC = () => {
  const { 
    voiceState, 
    startListening, 
    stopListening, 
    recognizedText, 
    isListening,
    processCommand
  } = useVoiceContext();

  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm">
      <h2 className="font-semibold text-lg mb-4 text-center">Voice Controls</h2>
      
      {/* Debug display */}
      <div className="mb-4 p-2 bg-gray-50 rounded text-xs">
        <p>Status: {isListening ? "Recording" : "Not Recording"}</p>
        <p>Mode: {voiceState}</p>
      </div>
      
      {/* Fixed button row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Button 
          className="bg-blue-500 hover:bg-blue-600 text-white"
          onClick={startListening}
          disabled={isListening}
        >
          <Mic className="mr-2 h-4 w-4" />
          Record
        </Button>
        
        <Button 
          className="bg-red-500 hover:bg-red-600 text-white"
          onClick={stopListening}
          disabled={!isListening}
        >
          <Square className="mr-2 h-4 w-4" />
          Stop
        </Button>
        
        <Button 
          className="bg-green-500 hover:bg-green-600 text-white"
          onClick={() => {
            stopListening();
            if (recognizedText) {
              processCommand(recognizedText);
            }
          }}
          disabled={!isListening || !recognizedText}
        >
          <Check className="mr-2 h-4 w-4" />
          Process
        </Button>
      </div>
      
      {/* Text display */}
      {recognizedText && (
        <div className="mt-4 p-2 bg-gray-50 rounded">
          <p className="font-semibold text-sm">Recognized Text:</p>
          <p className="text-gray-700">{recognizedText}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceControls;