import { useMemo } from "react";

const VoiceWaveform = () => {
  // Generate an array of bars for the waveform
  const bars = useMemo(() => Array.from({ length: 7 }), []);
  
  return (
    <div className="wave">
      {bars.map((_, index) => (
        <div key={index} className="wave-bar bg-primary"></div>
      ))}
    </div>
  );
};

export default VoiceWaveform;
