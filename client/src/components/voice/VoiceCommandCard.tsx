import { useState, useEffect } from "react";
import { Mic, Check, Settings, Square, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVoiceContext } from "@/context/VoiceContext";
import { useErpContext } from "@/context/ErpContext";
import VoiceWaveform from "./VoiceWaveform";

// This completely redesigned component includes a fixed set of controls
const VoiceCommandCard = () => {
  const { 
    voiceState, 
    startListening, 
    stopListening, 
    recognizedText, 
    resultText,
    isListening,
    processCommand
  } = useVoiceContext();
  
  const { isConnected } = useErpContext();

  // Debugging state
  const [showDebug, setShowDebug] = useState(false);
  
  return (
    <Card className="md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium text-neutral-800">Voice Command</CardTitle>
        <div 
          className={`flex items-center text-sm ${isConnected ? 'text-success' : 'text-error'}`}
        >
          <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-success' : 'bg-error'}`}></span>
          {isConnected ? 'Connected to ERPNext' : 'Not connected to ERPNext'}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Voice command states */}
        <div className="bg-neutral-100 rounded-lg p-4 mb-4">
          {/* Inactive state */}
          {voiceState === "inactive" && (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4">
                <Mic className="h-8 w-8 text-white" />
              </div>
              <p className="text-center text-neutral-600 mb-2">Click the microphone or say "Hey ERP" to start</p>
              <div className="flex flex-wrap justify-center gap-2">
                <p className="text-center text-sm bg-neutral-200 px-2 py-1 rounded-full text-neutral-600">"Check inventory"</p>
                <p className="text-center text-sm bg-neutral-200 px-2 py-1 rounded-full text-neutral-600">"Create invoice"</p>
              </div>
            </div>
          )}
          
          {/* Listening state */}
          {voiceState === "listening" && (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="listening-indicator w-16 h-16 rounded-full bg-error flex items-center justify-center mb-4">
                <Mic className="h-8 w-8 text-white" />
              </div>
              <p className="text-center text-neutral-600 mb-2">Listening...</p>
              
              <VoiceWaveform />
              
              <div className="font-medium text-lg text-center text-neutral-800 mt-2">
                {recognizedText || "Say a command..."}
              </div>
            </div>
          )}
          
          {/* Processing state */}
          {voiceState === "processing" && (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-16 h-16 rounded-full bg-warning flex items-center justify-center mb-4">
                <Settings className="h-8 w-8 text-white animate-spin" />
              </div>
              <p className="text-center text-neutral-600 mb-2">Processing command...</p>
              <div className="font-medium text-lg text-center text-neutral-800">
                "{recognizedText}"
              </div>
            </div>
          )}
          
          {/* Result state */}
          {voiceState === "result" && (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-16 h-16 rounded-full bg-success flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-white" />
              </div>
              <p className="text-center text-neutral-600 mb-2">Command executed successfully</p>
              <div className="font-medium text-lg text-center text-neutral-800">
                {resultText}
              </div>
            </div>
          )}
        </div>

        {/* Debug info - click on the heading to toggle */}
        {showDebug && (
          <div className="bg-gray-100 mb-4 p-2 text-xs">
            <p>isListening: {isListening ? 'true' : 'false'}</p>
            <p>voiceState: {voiceState}</p>
            <p>Text: {recognizedText}</p>
          </div>
        )}
        
        {/* Action buttons - fixed layout with all buttons visible */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <Button 
            size="lg" 
            onClick={startListening}
            disabled={isListening || voiceState === "processing"}
            className="bg-primary hover:bg-primary/90"
            variant="default"
          >
            <span className="mr-2">
              <Mic className="h-5 w-5" />
            </span>
            Start Recording
          </Button>

          <Button 
            size="lg" 
            onClick={() => {
              if (isListening) {
                stopListening();
              }
            }}
            disabled={!isListening}
            className="bg-error hover:bg-error/90"
            variant="destructive"
          >
            <span className="mr-2">
              <XCircle className="h-5 w-5" />
            </span>
            Stop Recording
          </Button>
          
          <Button
            size="lg"
            onClick={() => {
              stopListening();
              if (recognizedText.trim()) {
                processCommand(recognizedText.trim());
              }
            }}
            disabled={!recognizedText.trim() || !isListening}
            className="bg-success hover:bg-success/90"
          >
            <span className="mr-2">
              <Check className="h-5 w-5" />
            </span>
            Process Command
          </Button>
        </div>

        {/* Debug toggle */}
        <div className="text-center">
          <button 
            onClick={() => setShowDebug(!showDebug)} 
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            {showDebug ? "Hide Debug" : "Show Debug"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceCommandCard;
