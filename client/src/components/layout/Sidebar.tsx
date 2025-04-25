import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  PanelsTopLeft, 
  History, 
  Settings, 
  Archive, 
  Receipt, 
  UserPlus, 
  ShoppingCart,
  Server
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const [location] = useLocation();
  
  // Close sidebar on mobile when clicking a link
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  };
  
  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setOpen(false)}
        />
      )}
      
      <aside 
        className={cn(
          "bg-primary text-white h-screen shadow-lg z-50",
          "transition-all duration-300 ease-in-out",
          "fixed md:static top-0 bottom-0 left-0 w-64",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-4 flex items-center border-b border-white/20">
          <span className="material-icons mr-2">voice_over</span>
          <h1 className="text-xl font-medium">Voice ERP</h1>
        </div>
        
        <nav className="p-4">
          <h2 className="text-sm uppercase tracking-wider text-white/60 mb-2">Navigation</h2>
          <ul>
            <li className="mb-1">
              <Link 
                href="/" 
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center p-2 rounded text-white/80 hover:text-white hover:bg-white/10",
                  location === "/" && "bg-white/10 text-white font-medium"
                )}
              >
                <PanelsTopLeft className="mr-3 h-5 w-5 text-accent" />
                Dashboard
              </Link>
            </li>
            <li className="mb-1">
              <Link 
                href="/history" 
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center p-2 rounded text-white/80 hover:text-white hover:bg-white/10",
                  location === "/history" && "bg-white/10 text-white font-medium"
                )}
              >
                <History className="mr-3 h-5 w-5" />
                Command History
              </Link>
            </li>
            <li className="mb-1">
              <Link 
                href="/settings" 
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center p-2 rounded text-white/80 hover:text-white hover:bg-white/10",
                  location === "/settings" && "bg-white/10 text-white font-medium"
                )}
              >
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </Link>
            </li>
          </ul>
          
          <h2 className="text-sm uppercase tracking-wider text-white/60 mt-6 mb-2">Shortcuts</h2>
          <ul>
            <li className="mb-1">
              <Link 
                href="/erp-test" 
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center p-2 rounded text-white/80 hover:text-white hover:bg-white/10",
                  location === "/erp-test" && "bg-white/10 text-white font-medium"
                )}
              >
                <Server className="mr-3 h-5 w-5 text-yellow-400" />
                QBS Test Tool
              </Link>
            </li>
            <li className="mb-1">
              <a href="#" className="flex items-center p-2 rounded hover:bg-white/10 text-white/80 hover:text-white">
                <Archive className="mr-3 h-5 w-5" />
                Check Archive
              </a>
            </li>
            <li className="mb-1">
              <a href="#" className="flex items-center p-2 rounded hover:bg-white/10 text-white/80 hover:text-white">
                <Receipt className="mr-3 h-5 w-5" />
                Create Invoice
              </a>
            </li>
            <li className="mb-1">
              <a href="#" className="flex items-center p-2 rounded hover:bg-white/10 text-white/80 hover:text-white">
                <UserPlus className="mr-3 h-5 w-5" />
                Add Customer
              </a>
            </li>
            <li className="mb-1">
              <a href="#" className="flex items-center p-2 rounded hover:bg-white/10 text-white/80 hover:text-white">
                <ShoppingCart className="mr-3 h-5 w-5" />
                Sales Orders
              </a>
            </li>
          </ul>
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 bg-primary border-t border-white/20">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white">
              <span className="text-sm font-medium">JD</span>
            </div>
            <div className="ml-2">
              <div className="text-sm font-medium">John Doe</div>
              <div className="text-xs text-white/60">Administrator</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
