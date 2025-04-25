import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useVoiceContext } from "@/context/VoiceContext";

const VoiceSettings = () => {
  const { voiceSettings, updateVoiceSettings, isLoading } = useVoiceContext();
  
  const [wakeWord, setWakeWord] = useState(voiceSettings?.wakeWord || "Hey ERP");
  const [sensitivity, setSensitivity] = useState<number[]>([voiceSettings?.sensitivity || 7]);
  const [voiceResponse, setVoiceResponse] = useState(voiceSettings?.voiceResponse || true);
  const [continuousListening, setContinuousListening] = useState(voiceSettings?.continuousListening || false);
  
  // Update local state when settings are loaded
  useEffect(() => {
    if (voiceSettings) {
      setWakeWord(voiceSettings.wakeWord);
      setSensitivity([voiceSettings.sensitivity]);
      setVoiceResponse(voiceSettings.voiceResponse);
      setContinuousListening(voiceSettings.continuousListening);
    }
  }, [voiceSettings]);

  const handleSaveWakeWord = () => {
    if (!wakeWord.trim()) return;
    updateVoiceSettings({ wakeWord });
  };

  const handleSensitivityChange = (value: number[]) => {
    setSensitivity(value);
    updateVoiceSettings({ sensitivity: value[0] });
  };

  const handleVoiceResponseChange = (checked: boolean) => {
    setVoiceResponse(checked);
    updateVoiceSettings({ voiceResponse: checked });
  };

  const handleContinuousListeningChange = (checked: boolean) => {
    setContinuousListening(checked);
    updateVoiceSettings({ continuousListening: checked });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium text-neutral-800">Voice Settings</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Wake Word */}
          <div>
            <Label className="block text-sm font-medium text-neutral-700 mb-1">Wake Word/Phrase</Label>
            <div className="flex">
              <Input 
                type="text" 
                value={wakeWord} 
                onChange={(e) => setWakeWord(e.target.value)}
                className="flex-1 block w-full rounded-l-lg text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button 
                onClick={handleSaveWakeWord} 
                className="bg-primary text-white rounded-r-lg"
              >
                Save
              </Button>
            </div>
            <p className="mt-1 text-xs text-neutral-500">Choose a phrase that's easy to remember but not easily triggered accidentally.</p>
          </div>
          
          {/* Voice Recognition Sensitivity */}
          <div>
            <Label className="block text-sm font-medium text-neutral-700 mb-1">Voice Recognition Sensitivity</Label>
            <Slider 
              value={sensitivity} 
              onValueChange={handleSensitivityChange}
              min={1} 
              max={10} 
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>Less sensitive</span>
              <span>More sensitive</span>
            </div>
          </div>
          
          {/* Voice Response */}
          <div>
            <div className="flex items-center justify-between">
              <Label className="block text-sm font-medium text-neutral-700">Voice Response</Label>
              <Switch 
                checked={voiceResponse} 
                onCheckedChange={handleVoiceResponseChange} 
              />
            </div>
            <p className="mt-1 text-xs text-neutral-500">Enable voice responses to commands</p>
          </div>
          
          {/* Continuous Listening */}
          <div>
            <div className="flex items-center justify-between">
              <Label className="block text-sm font-medium text-neutral-700">Continuous Listening</Label>
              <Switch 
                checked={continuousListening} 
                onCheckedChange={handleContinuousListeningChange} 
              />
            </div>
            <p className="mt-1 text-xs text-neutral-500">Always listen for the wake word (uses more battery)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceSettings;
