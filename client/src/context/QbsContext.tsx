import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface QbsConnection {
  id?: number;
  userId: number;
  url: string;
  apiKey: string;
  apiSecret: string;
  isActive: boolean;
  lastConnected?: Date;
}

interface TestConnectionResult {
  success: boolean;
  message?: string;
  user?: string;
  error?: any;
}

interface QbsContextType {
  qbsConnection: QbsConnection | null;
  isConnected: boolean;
  testConnection: (url: string, apiKey: string, apiSecret: string) => Promise<TestConnectionResult>;
  saveConnection: (url: string, apiKey: string, apiSecret: string) => Promise<void>;
  isLoading: boolean;
}

const QbsContext = createContext<QbsContextType | undefined>(undefined);

export function QbsProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // Default user ID - would come from auth in a real app
  const userId = 1;

  // Get QBS connection
  const { 
    data: qbsConnection, 
    isLoading,
    refetch 
  } = useQuery({
    queryKey: [`/api/connection/${userId}`],
    enabled: !!userId
  });

  // Update connected state when connection data changes
  useEffect(() => {
    if (qbsConnection && typeof qbsConnection === 'object' && 'isActive' in qbsConnection) {
      setIsConnected(Boolean(qbsConnection.isActive));
    } else {
      setIsConnected(false);
    }
  }, [qbsConnection]);

  // Test QBS connection
  const testConnectionMutation = useMutation({
    mutationFn: async (data: { url: string; apiKey: string; apiSecret: string }) => {
      const res = await apiRequest("POST", "/api/connection/test", data);
      return res.json() as Promise<TestConnectionResult>;
    }
  });

  // Save QBS connection
  const saveConnectionMutation = useMutation({
    mutationFn: async (data: { 
      userId: number; 
      url: string; 
      apiKey: string; 
      apiSecret: string;
      isActive: boolean;
    }) => {
      return apiRequest("POST", "/api/connection", data);
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Connection saved",
        description: "Your QBS connection has been saved.",
      });
      setIsConnected(true);
    },
    onError: (error) => {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive"
      });
      setIsConnected(false);
    }
  });

  // Test connection to QBS
  const testConnection = async (url: string, apiKey: string, apiSecret: string) => {
    try {
      return await testConnectionMutation.mutateAsync({ url, apiKey, apiSecret });
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message
      };
    }
  };

  // Save connection to QBS
  const saveConnection = async (url: string, apiKey: string, apiSecret: string) => {
    await saveConnectionMutation.mutateAsync({
      userId,
      url,
      apiKey,
      apiSecret,
      isActive: true
    });
  };

  return (
    <QbsContext.Provider
      value={{
        qbsConnection: qbsConnection as QbsConnection || null,
        isConnected,
        testConnection,
        saveConnection,
        isLoading
      }}
    >
      {children}
    </QbsContext.Provider>
  );
}

export function useQbsContext() {
  const context = useContext(QbsContext);
  if (context === undefined) {
    throw new Error("useQbsContext must be used within a QbsProvider");
  }
  return context;
}

// For backward compatibility
export const ErpProvider = QbsProvider;
export const useErpContext = useQbsContext;