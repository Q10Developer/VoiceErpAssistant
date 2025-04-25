import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Check, Info } from "lucide-react";
import { useVoiceContext } from "@/context/VoiceContext";
import { useErpContext } from "@/context/ErpContext";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const { voiceSettings, updateVoiceSettings } = useVoiceContext();
  const { erpConnection, isConnected, testConnection, saveConnection } = useErpContext();
  const { toast } = useToast();
  
  // Voice settings state
  const [wakeWord, setWakeWord] = useState(voiceSettings?.wakeWord || "Hey ERP");
  const [sensitivity, setSensitivity] = useState<number[]>([voiceSettings?.sensitivity || 7]);
  const [voiceResponse, setVoiceResponse] = useState(voiceSettings?.voiceResponse || true);
  const [continuousListening, setContinuousListening] = useState(voiceSettings?.continuousListening || false);
  const [voiceLanguage, setVoiceLanguage] = useState(voiceSettings?.voiceLanguage || "en-US");
  
  // ERP connection state
  const [erpUrl, setErpUrl] = useState(erpConnection?.url || "");
  const [apiKey, setApiKey] = useState(erpConnection?.apiKey || "");
  const [apiSecret, setApiSecret] = useState("");
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Update local state when settings are loaded
  useEffect(() => {
    if (voiceSettings) {
      setWakeWord(voiceSettings.wakeWord);
      setSensitivity([voiceSettings.sensitivity]);
      setVoiceResponse(voiceSettings.voiceResponse);
      setContinuousListening(voiceSettings.continuousListening);
      setVoiceLanguage(voiceSettings.voiceLanguage);
    }
    
    if (erpConnection) {
      setErpUrl(erpConnection.url);
      setApiKey(erpConnection.apiKey);
    }
  }, [voiceSettings, erpConnection]);
  
  // Save voice settings
  const handleSaveVoiceSettings = async () => {
    try {
      await updateVoiceSettings({
        wakeWord,
        sensitivity: sensitivity[0],
        voiceResponse,
        continuousListening,
        voiceLanguage
      });
      
      toast({
        title: "Settings saved",
        description: "Your voice assistant settings have been updated."
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  };
  
  // Test ERPNext connection
  const handleTestConnection = async () => {
    if (!erpUrl || !apiKey || !apiSecret) {
      toast({
        title: "Missing information",
        description: "Please provide URL, API key, and API secret",
        variant: "destructive"
      });
      return;
    }
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await testConnection(erpUrl, apiKey, apiSecret);
      setTestResult(result);
      
      if (result.success) {
        toast({
          title: "Connection successful",
          description: `Connected as ${result.user}`,
        });
      } else {
        toast({
          title: "Connection failed",
          description: result.message || "Could not connect to ERPNext",
          variant: "destructive"
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: (error as Error).message
      });
      
      toast({
        title: "Connection failed",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  // Save ERPNext connection
  const handleSaveConnection = async () => {
    if (!erpUrl || !apiKey || !apiSecret) {
      toast({
        title: "Missing information",
        description: "Please provide URL, API key, and API secret",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      await saveConnection(erpUrl, apiKey, apiSecret);
    } catch (error) {
      toast({
        title: "Error saving connection",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <>
      <h1 className="text-2xl font-medium text-neutral-800 mb-6">Settings</h1>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Voice Assistant Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium text-neutral-800">Voice Assistant Settings</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Wake Word */}
            <div>
              <Label htmlFor="wake-word">Wake Word/Phrase</Label>
              <Input 
                id="wake-word"
                value={wakeWord} 
                onChange={(e) => setWakeWord(e.target.value)}
                className="mt-1"
              />
              <p className="mt-1 text-xs text-neutral-500">
                Choose a phrase that's easy to remember but not easily triggered accidentally.
              </p>
            </div>
            
            {/* Voice Recognition Sensitivity */}
            <div>
              <Label htmlFor="sensitivity">Voice Recognition Sensitivity</Label>
              <Slider 
                id="sensitivity"
                value={sensitivity} 
                onValueChange={setSensitivity}
                min={1} 
                max={10} 
                step={1}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>Less sensitive</span>
                <span>More sensitive</span>
              </div>
            </div>
            
            {/* Voice Language */}
            <div>
              <Label htmlFor="voice-language">Voice Recognition Language</Label>
              <select
                id="voice-language"
                value={voiceLanguage}
                onChange={(e) => setVoiceLanguage(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="fr-FR">French</option>
                <option value="de-DE">German</option>
                <option value="es-ES">Spanish</option>
                <option value="it-IT">Italian</option>
              </select>
            </div>
            
            {/* Voice Response */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="voice-response">Voice Response</Label>
                <p className="text-xs text-neutral-500">
                  Enable voice responses to commands
                </p>
              </div>
              <Switch 
                id="voice-response"
                checked={voiceResponse} 
                onCheckedChange={setVoiceResponse} 
              />
            </div>
            
            {/* Continuous Listening */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="continuous-listening">Continuous Listening</Label>
                <p className="text-xs text-neutral-500">
                  Always listen for the wake word (uses more battery)
                </p>
              </div>
              <Switch 
                id="continuous-listening"
                checked={continuousListening} 
                onCheckedChange={setContinuousListening} 
              />
            </div>
          </CardContent>
          
          <CardFooter>
            <Button onClick={handleSaveVoiceSettings}>Save Voice Settings</Button>
          </CardFooter>
        </Card>
        
        {/* ERPNext Connection Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium text-neutral-800">ERPNext Connection</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {isConnected && (
              <Alert variant="success" className="bg-success/10 border-success text-success">
                <Check className="h-4 w-4" />
                <AlertTitle>Connected to ERPNext</AlertTitle>
                <AlertDescription>
                  Your voice assistant is connected to ERPNext. You can update your connection settings below.
                </AlertDescription>
              </Alert>
            )}
            
            {!isConnected && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Not connected</AlertTitle>
                <AlertDescription>
                  Connect to your ERPNext instance to enable voice commands.
                </AlertDescription>
              </Alert>
            )}
            
            {/* ERPNext URL */}
            <div>
              <Label htmlFor="erp-url">ERPNext URL</Label>
              <Input 
                id="erp-url"
                value={erpUrl} 
                onChange={(e) => setErpUrl(e.target.value)}
                placeholder="https://your-erpnext-instance.com"
                className="mt-1"
              />
              <p className="mt-1 text-xs text-neutral-500">
                The URL of your ERPNext instance (e.g., https://your-erpnext-instance.com)
              </p>
            </div>
            
            {/* API Key */}
            <div>
              <Label htmlFor="api-key">API Key</Label>
              <Input 
                id="api-key"
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Your ERPNext API Key"
                className="mt-1"
              />
            </div>
            
            {/* API Secret */}
            <div>
              <Label htmlFor="api-secret">API Secret</Label>
              <Input 
                id="api-secret"
                type="password"
                value={apiSecret} 
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder={erpConnection ? "••••••••••••••••" : "Your ERPNext API Secret"}
                className="mt-1"
              />
              <p className="mt-1 text-xs text-neutral-500">
                {erpConnection ? "Leave blank to keep the existing API secret" : "Your ERPNext API secret"}
              </p>
            </div>
            
            {/* Test result */}
            {testResult && (
              <Alert variant={testResult.success ? "success" : "destructive"} className={testResult.success ? "bg-success/10 border-success" : "bg-error/10 border-error"}>
                {testResult.success ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>{testResult.success ? "Connection successful" : "Connection failed"}</AlertTitle>
                <AlertDescription>
                  {testResult.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
            <Button 
              variant="outline" 
              onClick={handleTestConnection}
              disabled={isTesting || !erpUrl || !apiKey || !apiSecret}
            >
              {isTesting ? "Testing..." : "Test Connection"}
            </Button>
            <Button 
              onClick={handleSaveConnection}
              disabled={isSaving || !erpUrl || !apiKey || !apiSecret}
            >
              {isSaving ? "Saving..." : "Save Connection"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default SettingsPage;
