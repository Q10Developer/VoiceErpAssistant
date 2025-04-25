import { createContext, useContext, useState, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ErpConnection {
  id?: number;
  userId: number;
  url: string;
  apiKey: string;
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

export const ErpProvider = ({ children }: { children: ReactNode }) => {
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
    enabled: !!userId,
    onSuccess: (data) => {
      if (data && data.isActive) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    },
    onError: () => {
      setIsConnected(false);
    }
  });

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
        description: "Your ERPNext connection has been saved.",
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

  // Test connection to ERPNext
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

  // Save connection to ERPNext
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
        erpConnection: erpConnection as ErpConnection,
        isConnected,
        testConnection,
        saveConnection,
        isLoading
      }}
    >
      {children}
    </ErpContext.Provider>
  );
};

export const useErpContext = () => {
  const context = useContext(ErpContext);
  if (context === undefined) {
    throw new Error("useErpContext must be used within an ErpProvider");
  }
  return context;
};
