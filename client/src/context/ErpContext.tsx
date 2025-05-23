import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ErpConnection {
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

interface ErpContextType {
  erpConnection: ErpConnection | null;
  isConnected: boolean;
  testConnection: (url: string, apiKey: string, apiSecret: string) => Promise<TestConnectionResult>;
  saveConnection: (url: string, apiKey: string, apiSecret: string) => Promise<void>;
  isLoading: boolean;
}

const ErpContext = createContext<ErpContextType | undefined>(undefined);

export function ErpProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // Default user ID - would come from auth in a real app
  const userId = 1;

  // Get ERP connection
  const { 
    data: erpConnection, 
    isLoading,
    refetch 
  } = useQuery({
    queryKey: [`/api/connection/${userId}`],
    enabled: !!userId
  });

  // Update connected state when connection data changes
  useEffect(() => {
    if (erpConnection && typeof erpConnection === 'object' && 'isActive' in erpConnection) {
      setIsConnected(Boolean(erpConnection.isActive));
    } else {
      setIsConnected(false);
    }
  }, [erpConnection]);

  // Test ERP connection
  const testConnectionMutation = useMutation({
    mutationFn: async (data: { url: string; apiKey: string; apiSecret: string }) => {
      const res = await apiRequest("POST", "/api/connection/test", data);
      return res.json() as Promise<TestConnectionResult>;
    }
  });

  // Save ERP connection
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
    <ErpContext.Provider
      value={{
        erpConnection: erpConnection as ErpConnection || null,
        isConnected,
        testConnection,
        saveConnection,
        isLoading
      }}
    >
      {children}
    </ErpContext.Provider>
  );
}

export function useErpContext() {
  const context = useContext(ErpContext);
  if (context === undefined) {
    throw new Error("useErpContext must be used within an ErpProvider");
  }
  return context;
}
