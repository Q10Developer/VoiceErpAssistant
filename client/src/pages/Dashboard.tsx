import VoiceCommandCard from "@/components/voice/VoiceCommandCard";
import CommandHistory from "@/components/voice/CommandHistory";
import QuickCommands from "@/components/voice/QuickCommands";
import VoiceSettings from "@/components/voice/VoiceSettings";
import HelpPanel from "@/components/voice/HelpPanel";
import VoiceControls from "@/components/voice/VoiceControls";

const Dashboard = () => {
  return (
    <>
      <h1 className="text-2xl font-medium text-neutral-800 mb-6">Voice Assistant Dashboard</h1>
      
      {/* Voice Controls Panel */}
      <div className="mb-6">
        <VoiceControls />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <VoiceCommandCard />
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
