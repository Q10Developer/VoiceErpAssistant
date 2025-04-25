import { useState, useEffect } from "react";
import { Mic, Check, Settings, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVoiceContext } from "@/context/VoiceContext";
import { useErpContext } from "@/context/ErpContext";
import VoiceWaveform from "./VoiceWaveform";

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
  
  const [buttonText, setButtonText] = useState("Start Listening");
  
  useEffect(() => {
    setButtonText(isListening ? "Stop Listening" : "Start Listening");
  }, [isListening]);
  
  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
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
        
        {/* Action buttons */}
        <div className="flex justify-center gap-4">
          <Button 
            size="lg" 
            onClick={handleToggleMic}
            disabled={!isConnected && voiceState === "inactive"}
            className={`px-4 py-2 ${isListening ? 'bg-error hover:bg-error/90' : 'bg-primary hover:bg-primary/90'}`}
            variant={isListening ? "destructive" : "default"}
          >
            <span className="mr-2">
              {isListening ? 
                <Square className="h-5 w-5" />
                : 
                <Mic className="h-5 w-5" />
              }
            </span>
            {buttonText}
          </Button>
          
          {isListening && voiceState === "listening" && (
            <Button
              size="lg"
              onClick={() => {
                stopListening();
                if (recognizedText.trim()) {
                  processCommand(recognizedText.trim());
                }
              }}
              className="px-4 py-2 bg-success hover:bg-success/90"
            >
              <span className="mr-2">
                <Check className="h-5 w-5" />
              </span>
              Process Command
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceCommandCard;
