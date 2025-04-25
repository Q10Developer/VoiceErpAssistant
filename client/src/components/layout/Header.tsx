import { Bell, HelpCircle, Menu } from "lucide-react";
import { useErpContext } from "@/context/ErpContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const { isConnected } = useErpContext();
  
  return (
    <header className="bg-white shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className="md:hidden text-neutral-400 hover:bg-neutral-100"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        
        <div className="flex items-center md:hidden">
          <span className="material-icons mr-2 text-primary">voice_over</span>
          <h1 className="text-lg font-medium text-primary">Voice ERP</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Connection status indicator */}
          <div 
            className={cn(
              "hidden md:flex items-center text-sm rounded-full px-2 py-1",
              isConnected ? "text-success bg-success/10" : "text-error bg-error/10"
            )}
          >
            <span className={cn(
              "inline-block w-2 h-2 rounded-full mr-2",
              isConnected ? "bg-success" : "bg-error"
            )} />
            {isConnected ? "Connected to QBS" : "Not connected"}
          </div>
          
          {/* Notification button */}
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:bg-neutral-100">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          
          {/* Help button */}
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:bg-neutral-100">
            <HelpCircle className="h-5 w-5" />
            <span className="sr-only">Help</span>
          </Button>
          
          {/* User avatar - mobile only */}
          <div className="md:hidden w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white">
            <span className="text-sm font-medium">JD</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
