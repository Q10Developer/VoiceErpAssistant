import { formatDistanceToNow, format } from "date-fns";
import { CheckCircle, AlertCircle, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useVoiceContext } from "@/context/VoiceContext";
import { useState } from "react";

const CommandHistoryPage = () => {
  const { commandHistory } = useVoiceContext();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter commands based on search term
  const filteredCommands = commandHistory.filter(
    command => command.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (command.response && command.response.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <>
      <h1 className="text-2xl font-medium text-neutral-800 mb-6">Command History</h1>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <CardTitle className="text-lg font-medium text-neutral-800">All Voice Commands</CardTitle>
            
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                className="pl-8 w-full md:w-64"
                placeholder="Search commands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredCommands.length === 0 ? (
            <div className="text-center py-12">
              {searchTerm ? (
                <p className="text-neutral-600">No commands found matching "{searchTerm}"</p>
              ) : (
                <p className="text-neutral-600">No command history yet. Try speaking to your voice assistant!</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCommands.map((command) => (
                <div key={command.id} className="p-4 border border-neutral-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-neutral-800 text-lg">{command.command}</p>
                      <div className="flex items-center text-xs text-neutral-400 mt-1">
                        <span>{format(new Date(command.timestamp), "PPpp")}</span>
                        <span className="mx-2">•</span>
                        <span>{formatDistanceToNow(new Date(command.timestamp), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <span className="flex-shrink-0">
                      {command.status === "success" ? (
                        <CheckCircle className="h-6 w-6 text-success" />
                      ) : (
                        <AlertCircle className="h-6 w-6 text-error" />
                      )}
                    </span>
                  </div>
                  
                  <div className={`mt-3 p-3 rounded-md ${command.status === "success" ? "bg-success/10" : "bg-error/10"}`}>
                    <p className="text-sm">
                      {command.response || "No response recorded"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default CommandHistoryPage;
