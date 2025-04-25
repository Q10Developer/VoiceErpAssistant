import { formatDistanceToNow } from "date-fns";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useVoiceContext } from "@/context/VoiceContext";
import { Link } from "wouter";

const CommandHistory = () => {
  const { commandHistory } = useVoiceContext();
  
  // Display only the 4 most recent commands on the dashboard
  const recentCommands = commandHistory.slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium text-neutral-800">Recent Commands</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {recentCommands.length === 0 ? (
            <p className="text-center text-neutral-600 py-8">No commands yet. Try speaking to your voice assistant!</p>
          ) : (
            recentCommands.map((command) => (
              <div key={command.id} className="p-3 border border-neutral-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-neutral-800">{command.command}</p>
                    <p className="text-xs text-neutral-400">
                      {formatDistanceToNow(new Date(command.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  <span className="flex-shrink-0">
                    {command.status === "success" ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-error" />
                    )}
                  </span>
                </div>
                <p className="mt-2 text-sm text-neutral-600">{command.response}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-neutral-200 pt-4">
        <Link href="/history">
          <Button variant="ghost" className="w-full text-primary hover:bg-primary/5">
            View Full History
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CommandHistory;
