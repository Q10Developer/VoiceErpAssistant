import { useState, useEffect } from "react";

interface SpeechSynthesisOptions {
  voice?: SpeechSynthesisVoice;
  pitch?: number;
  rate?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

const useSpeechSynthesis = (options: SpeechSynthesisOptions = {}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  
  const {
    voice,
    pitch = 1,
    rate = 1,
    volume = 1,
    onStart,
    onEnd,
    onError
  } = options;
  
  // Initialize speech synthesis and get available voices
  useEffect(() => {
    if (!window.speechSynthesis) {
      if (onError) onError(new Error("Speech synthesis is not supported in this browser"));
      return;
    }
    
    // Function to set available voices
    const setAvailableVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };
    
    // Get voices - if already available, set them immediately
    setAvailableVoices();
    
    // Chrome loads voices asynchronously, so we need to listen for the voiceschanged event
    window.speechSynthesis.onvoiceschanged = setAvailableVoices;
    
    return () => {
      // Cleanup
      window.speechSynthesis.cancel();
      if (utterance) {
        utterance.onstart = null;
        utterance.onend = null;
        utterance.onerror = null;
      }
    };
  }, [onError]);
  
  // Speak function
  const speak = (text: string, speakOptions?: SpeechSynthesisOptions) => {
    if (!window.speechSynthesis) {
      if (onError) onError(new Error("Speech synthesis is not supported in this browser"));
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create utterance with text
    const newUtterance = new SpeechSynthesisUtterance(text);
    
    // Set utterance properties
    newUtterance.pitch = speakOptions?.pitch ?? pitch;
    newUtterance.rate = speakOptions?.rate ?? rate;
    newUtterance.volume = speakOptions?.volume ?? volume;
    
    // Set voice if specified
    if (speakOptions?.voice || voice) {
      newUtterance.voice = speakOptions?.voice ?? voice!;
    } else if (voices.length > 0) {
      // Try to find a good default voice (prefer English voices)
      const defaultVoice = voices.find(v => v.lang.includes('en-US')) || voices[0];
      newUtterance.voice = defaultVoice;
    }
    
    // Set event handlers
    newUtterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      if (speakOptions?.onStart || onStart) (speakOptions?.onStart || onStart)?.();
    };
    
    newUtterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      if (speakOptions?.onEnd || onEnd) (speakOptions?.onEnd || onEnd)?.();
    };
    
    newUtterance.onerror = (event) => {
      if (speakOptions?.onError || onError) {
        (speakOptions?.onError || onError)?.(new Error(`Speech synthesis error: ${event.error}`));
      }
    };
    
    // Start speaking
    window.speechSynthesis.speak(newUtterance);
    setUtterance(newUtterance);
  };
  
  // Pause speaking
  const pause = () => {
    if (window.speechSynthesis && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };
  
  // Resume speaking
  const resume = () => {
    if (window.speechSynthesis && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };
  
  // Cancel speaking
  const cancel = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };
  
  return {
    speak,
    pause,
    resume,
    cancel,
    isSpeaking,
    isPaused,
    voices,
  };
};

export default useSpeechSynthesis;
