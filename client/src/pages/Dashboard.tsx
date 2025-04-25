// import VoiceCommandCard from "@/components/voice/VoiceCommandCard";
import CommandHistory from "@/components/voice/CommandHistory";
import QuickCommands from "@/components/voice/QuickCommands";
import VoiceSettings from "@/components/voice/VoiceSettings";
import HelpPanel from "@/components/voice/HelpPanel";
import BasicControls from "@/components/voice/BasicControls";
import SimpleControls from "@/components/voice/SimpleControls";
import ErpDirectTest from "@/components/erp/ErpDirectTest";
import { Link } from "wouter";
import { AlertTriangle, Server } from "lucide-react";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  return (
    <>
      <h1 className="text-2xl font-medium text-neutral-800 mb-6">Voice Assistant Dashboard</h1>
      
      {/* Basic Controls Panel */}
      <div className="mb-6">
        <BasicControls />
      </div>
      
      {/* Simple standalone controls */}
      <div className="mb-6">
        <SimpleControls />
      </div>
      
      {/* QBS Connection Alert */}
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">QBS Connection Issue Detected</h3>
            <div className="mt-2 text-sm text-amber-700">
              <p>
                There appears to be an issue connecting to your QBS instance. This may be due to an incorrect URL format or incomplete API credentials.
              </p>
            </div>
            <div className="mt-4">
              <Link href="/erp-test">
                <Button className="bg-amber-600 hover:bg-amber-700 flex items-center">
                  <Server className="mr-2 h-4 w-4" />
                  Test & Fix QBS Connection
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Removed VoiceCommandCard to avoid speech recognition errors */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-medium text-neutral-800 mb-4">Voice Command Center</h2>
          <p className="text-neutral-600">
            Use the controls above to manage voice commands. The simplified controls
            allow you to start recording, stop recording, and process commands
            with dedicated buttons.
          </p>
        </div>
        <CommandHistory />
      </div>
      
      {/* ERPNext Direct API Test */}
      <div className="mt-6">
        <ErpDirectTest />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <QuickCommands />
        <VoiceSettings />
        <HelpPanel />
      </div>
    </>
  );
};

export default Dashboard;
