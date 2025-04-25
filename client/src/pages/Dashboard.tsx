// import VoiceCommandCard from "@/components/voice/VoiceCommandCard";
import CommandHistory from "@/components/voice/CommandHistory";
import QuickCommands from "@/components/voice/QuickCommands";
import VoiceSettings from "@/components/voice/VoiceSettings";
import HelpPanel from "@/components/voice/HelpPanel";
import BasicControls from "@/components/voice/BasicControls";

const Dashboard = () => {
  return (
    <>
      <h1 className="text-2xl font-medium text-neutral-800 mb-6">Voice Assistant Dashboard</h1>
      
      {/* Basic Controls Panel */}
      <div className="mb-6">
        <BasicControls />
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <QuickCommands />
        <VoiceSettings />
        <HelpPanel />
      </div>
    </>
  );
};

export default Dashboard;
