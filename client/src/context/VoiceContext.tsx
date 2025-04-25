import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import useSpeechSynthesis from "@/hooks/useSpeechSynthesis";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { handleVoiceCommand } from "@/lib/erpCommands";
import { useErpContext } from "./ErpContext";

export type VoiceState = "inactive" | "listening" | "processing" | "result";

export type CommandStatus = "success" | "error" | "pending";

export interface Command {
  id: number;
  command: string;
  response?: string;
  status: CommandStatus;
  timestamp: Date;
}

interface VoiceSettings {
  id: number;
  userId: number;
  wakeWord: string;
  sensitivity: number;
  voiceResponse: boolean;
  continuousListening: boolean;
  voiceLanguage: string;
}

interface VoiceContextType {
  voiceState: VoiceState;
  recognizedText: string;
  resultText: string;
  isListening: boolean;
  commandHistory: Command[];
  voiceSettings: VoiceSettings | null;
  startListening: () => void;
  stopListening: () => void;
  processCommand: (command: string) => Promise<void>;
  updateVoiceSettings: (settings: Partial<VoiceSettings>) => Promise<void>;
  isLoading: boolean;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider = ({ children }: { children: ReactNode }) => {
  const [voiceState, setVoiceState] = useState<VoiceState>("inactive");
  const [recognizedText, setRecognizedText] = useState("");
  const [resultText, setResultText] = useState("");
  const { toast } = useToast();
  const { erpConnection } = useErpContext();
  
  // Default user ID - would come from auth in a real app
  const userId = 1;

  // Get voice settings
  const { 
    data: voiceSettings, 
    isLoading: isLoadingSettings,
    refetch: refetchSettings
  } = useQuery({
    queryKey: [`/api/settings/${userId}`],
    enabled: !!userId
  });

  // Get command history
  const { 
    data: commandHistory = [], 
    isLoading: isLoadingHistory,
    refetch: refetchHistory
  } = useQuery({
    queryKey: [`/api/commands/${userId}`],
    enabled: !!userId
  });

  // Add command to history
  const addCommandMutation = useMutation({
    mutationFn: async (data: { userId: number, command: string, response?: string, status: CommandStatus }) => {
      return apiRequest("POST", "/api/commands", data);
    },
    onSuccess: () => {
      refetchHistory();
    }
  });

  // Update voice settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<VoiceSettings>) => {
      return apiRequest("PATCH", `/api/settings/${userId}`, settings);
    },
    onSuccess: () => {
      refetchSettings();
      toast({
        title: "Settings updated",
        description: "Your voice assistant settings have been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Settings update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Speech recognition
  const { 
    isListening, 
    startListening: startSpeechRecognition, 
    stopListening: stopSpeechRecognition,
    transcript,
    resetTranscript
  } = useSpeechRecognition({
    language: voiceSettings?.voiceLanguage || "en-US",
    continuous: true,
    onResult: (result) => {
      setRecognizedText(result);
    },
    onEnd: () => {
      if (voiceState === "listening") {
        const finalText = transcript;
        if (finalText && finalText.trim() !== "") {
          setVoiceState("processing");
          processCommand(finalText);
        } else {
          setVoiceState("inactive");
        }
      }
    },
    onError: (error) => {
      toast({
        title: "Speech recognition error",
        description: error.message,
        variant: "destructive"
      });
      setVoiceState("inactive");
    }
  });

  // Speech synthesis
  const { speak } = useSpeechSynthesis();

  // Start listening
  const startListening = () => {
    resetTranscript();
    setRecognizedText("");
    setResultText("");
    setVoiceState("listening");
    startSpeechRecognition();
  };

  // Stop listening
  const stopListening = () => {
    stopSpeechRecognition();
    setVoiceState("inactive");
  };

  // Process voice command
  const processCommand = async (command: string) => {
    try {
      setVoiceState("processing");
      
      // Add command to history with pending status
      addCommandMutation.mutate({
        userId,
        command,
        status: "pending"
      });

      // Check connection and properly format it
      console.log("Original ERP connection from context:", erpConnection);
      
      let formattedConnection = null;
      if (erpConnection) {
        formattedConnection = {
          id: erpConnection.id,
          userId: erpConnection.userId,
          url: erpConnection.url,
          apiKey: erpConnection.apiKey,
          apiSecret: erpConnection.apiSecret,
          isActive: erpConnection.isActive,
          lastConnected: erpConnection.lastConnected
        };
        console.log("Formatted connection for command processor:", formattedConnection);
      }

      // Process the command
      const result = await handleVoiceCommand(command, formattedConnection);
      console.log("Command result:", result);
      
      setResultText(result);
      setVoiceState("result");
      
      // Speak the result if voice response is enabled
      if (voiceSettings?.voiceResponse) {
        speak(result);
      }
      
      // Update command in history with result
      addCommandMutation.mutate({
        userId,
        command,
        response: result,
        status: "success"
      });

      // Reset after 5 seconds
      setTimeout(() => {
        if (voiceSettings?.continuousListening) {
          startListening();
        } else {
          setVoiceState("inactive");
        }
      }, 5000);
    } catch (error) {
      const errorMessage = (error as Error).message;
      setResultText(`Error: ${errorMessage}`);
      setVoiceState("result");
      
      // Speak the error if voice response is enabled
      if (voiceSettings?.voiceResponse) {
        speak(`Error: ${errorMessage}`);
      }
      
      // Add error to command history
      addCommandMutation.mutate({
        userId,
        command,
        response: `Error: ${errorMessage}`,
        status: "error"
      });
      
      // Reset after 5 seconds
      setTimeout(() => {
        setVoiceState("inactive");
      }, 5000);
    }
  };

  // Update voice settings
  const updateVoiceSettings = async (settings: Partial<VoiceSettings>) => {
    await updateSettingsMutation.mutateAsync(settings);
  };

  // Check for wake word in continuous listening mode
  useEffect(() => {
    if (voiceSettings?.continuousListening && 
        isListening && 
        voiceState === "inactive" &&
        recognizedText.toLowerCase().includes(voiceSettings.wakeWord.toLowerCase())) {
      // Reset transcript and start active listening
      resetTranscript();
      setRecognizedText("");
      setVoiceState("listening");
    }
  }, [recognizedText, voiceSettings, isListening, voiceState, resetTranscript]);

  return (
    <VoiceContext.Provider
      value={{
        voiceState,
        recognizedText,
        resultText,
        isListening,
        commandHistory: commandHistory as Command[],
        voiceSettings,
        startListening,
        stopListening,
        processCommand,
        updateVoiceSettings,
        isLoading: isLoadingSettings || isLoadingHistory
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoiceContext = () => {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error("useVoiceContext must be used within a VoiceProvider");
  }
  return context;
};
