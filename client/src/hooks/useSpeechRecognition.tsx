import { useState, useEffect, useCallback, useRef } from "react";

interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string) => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

// Define a type for the SpeechRecognition object
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

// Define the global SpeechRecognition constructor
interface Window {
  SpeechRecognition: new () => SpeechRecognition;
  webkitSpeechRecognition: new () => SpeechRecognition;
}

// Interface for SpeechRecognitionEvent
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
      length: number;
    };
    length: number;
  };
}

// Interface for SpeechRecognitionErrorEvent
interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

const useSpeechRecognition = (options: SpeechRecognitionOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<Error | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const {
    language = "en-US",
    continuous = true,
    interimResults = true,
    onResult,
    onEnd,
    onError
  } = options;
  
  // Initialize the speech recognition
  useEffect(() => {
    // Check if browser supports speech recognition
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      const browserError = new Error(
        "Your browser does not support the Web Speech API. Please try using Chrome or Edge."
      );
      setError(browserError);
      if (onError) onError(browserError);
      return;
    }
    
    // Use the appropriate constructor
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    // Configure recognition
    if (recognitionRef.current) {
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = interimResults;
      recognitionRef.current.lang = language;
      
      // Handle results
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";
        let interimTranscript = "";
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        const fullTranscript = finalTranscript || interimTranscript;
        setTranscript(fullTranscript);
        if (onResult) onResult(fullTranscript);
      };
      
      // Handle errors
      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        const recognitionError = new Error(`Speech recognition error: ${event.error} - ${event.message}`);
        setError(recognitionError);
        if (onError) onError(recognitionError);
        setIsListening(false);
      };
      
      // Handle end of recognition
      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (onEnd) onEnd();
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, continuous, interimResults, onResult, onEnd, onError]);
  
  // Start listening
  const startListening = useCallback(() => {
    if (error && !("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      return;
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setError(null);
      } catch (err) {
        // Handle case where recognition is already started
        console.error("Speech recognition error:", err);
      }
    }
  }, [error]);
  
  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);
  
  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);
  
  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript
  };
};

export default useSpeechRecognition;
