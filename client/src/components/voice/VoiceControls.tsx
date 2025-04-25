import React, { useState, useEffect } from "react";
import { Mic, Square, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceContext } from "@/context/VoiceContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

// A more robust voice control component with browser compatibility check
const VoiceControls: React.FC = () => {
  const { 
    voiceState, 
    startListening, 
    stopListening, 
    recognizedText, 
    isListening,
    processCommand
  } = useVoiceContext();
  
  const { toast } = useToast();
  const [browserSupported, setBrowserSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check browser compatibility
  useEffect(() => {
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isEdge = /Edg/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    const speechRecognitionSupported = 
      'SpeechRecognition' in window || 
      'webkitSpeechRecognition' in window;
    
    if (!speechRecognitionSupported) {
      setBrowserSupported(false);
      setErrorMessage(
        "Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari."
      );
    } else {
      setBrowserSupported(true);
      setErrorMessage(null);
    }
  }, []);

  // Function to safely start listening with error handling
  const handleStartListening = () => {
    if (!browserSupported) {
      toast({
        title: "Browser Not Supported",
        description: "Please use Chrome, Edge, or Safari for voice recognition.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      startListening();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      toast({
        title: "Speech Recognition Error",
        description: "Could not start the microphone. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm">
      <h2 className="font-semibold text-lg mb-4 text-center">Voice Controls</h2>
      
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Status display */}
      <div className="mb-4 p-2 bg-gray-50 rounded">
        <div className="flex items-center justify-center mb-2">
          <span 
            className={`inline-block w-3 h-3 rounded-full mr-2 ${
              isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
            }`}
          ></span>
          <span className="text-sm font-medium">
            {isListening ? "Recording" : "Not Recording"}
          </span>
        </div>
        <div className="text-xs text-center text-gray-500">
          Mode: {voiceState}
        </div>
      </div>
      
      {/* Fixed button row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Button 
          className="bg-blue-500 hover:bg-blue-600 text-white"
          onClick={handleStartListening}
          disabled={isListening || !browserSupported}
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