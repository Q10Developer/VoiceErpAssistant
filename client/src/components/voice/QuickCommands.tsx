import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useVoiceContext } from "@/context/VoiceContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Default icons mapping
const iconMap: Record<string, string> = {
  "inventory": "inventory",
  "receipt": "receipt",
  "shopping_cart": "shopping_cart",
  "insights": "insights",
  "default": "command"
};

const QuickCommands = () => {
  const { processCommand } = useVoiceContext();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCommand, setNewCommand] = useState("");
  const [newIcon, setNewIcon] = useState("command");
  
  // Default user ID - would come from auth in a real app
  const userId = 1;
  
  // Get quick commands
  const { data: quickCommands = [] } = useQuery({
    queryKey: [`/api/quickcommands/${userId}`],
    enabled: !!userId
  });
  
  // Add quick command
  const addCommandMutation = useMutation({
    mutationFn: async (data: { userId: number; commandText: string; icon: string; sortOrder: number }) => {
      return apiRequest("POST", "/api/quickcommands", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/quickcommands/${userId}`] });
      setNewCommand("");
      setNewIcon("command");
      setIsDialogOpen(false);
      toast({
        title: "Command added",
        description: "Your quick command has been added."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add command",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleAddCommand = () => {
    if (!newCommand.trim()) {
      toast({
        title: "Empty command",
        description: "Please enter a command.",
        variant: "destructive"
      });
      return;
    }
    
    addCommandMutation.mutate({
      userId,
      commandText: newCommand,
      icon: newIcon,
      sortOrder: quickCommands.length + 1
    });
  };
  
  // Execute quick command
  const executeQuickCommand = (commandText: string) => {
    processCommand(commandText);
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium text-neutral-800">Quick Commands</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2">
            {quickCommands.length === 0 ? (
              <p className="text-center text-neutral-600 py-4">No quick commands yet. Add some for faster access!</p>
            ) : (
              quickCommands.map((cmd) => (
                <button 
                  key={cmd.id}
                  onClick={() => executeQuickCommand(cmd.commandText)} 
                  className="w-full p-3 border border-neutral-200 rounded-lg text-left hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <div className="flex items-center">
                    <span className="material-icons text-primary mr-3">{cmd.icon || "command"}</span>
                    <span>{cmd.commandText}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full border-primary text-primary hover:bg-primary/5"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Customize Quick Commands
          </Button>
        </CardFooter>
      </Card>

      {/* Add Quick Command Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Quick Command</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="command">Command Text</Label>
              <Input 
                id="command" 
                placeholder="E.g., Check inventory for product XYZ" 
                value={newCommand} 
                onChange={(e) => setNewCommand(e.target.value)} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <div className="grid grid-cols-5 gap-2">
                {Object.keys(iconMap).map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setNewIcon(iconMap[icon])}
                    className={`p-2 rounded-md ${newIcon === iconMap[icon] ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
                  >
                    <span className="material-icons">{iconMap[icon]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCommand}>Add Command</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickCommands;
