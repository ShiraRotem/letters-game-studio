import { useRef, useCallback } from 'react';

export const useAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const playTone = (freq: number, type: OscillatorType, duration: number, startTime: number) => {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    gain.gain.setValueAtTime(0.1, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  const playYay = useCallback(() => {
    const ctx = getContext();
    const now = ctx.currentTime;
    // Major chord arpeggio
    playTone(523.25, 'sine', 0.2, now);       // C5
    playTone(659.25, 'sine', 0.2, now + 0.1); // E5
    playTone(783.99, 'sine', 0.4, now + 0.2); // G5
    playTone(1046.50, 'triangle', 0.6, now + 0.3); // C6
  }, []);

  const playTryAgain = useCallback(() => {
    const ctx = getContext();
    const now = ctx.currentTime;
    // Descending tones
    playTone(300, 'sawtooth', 0.3, now);
    playTone(200, 'sawtooth', 0.4, now + 0.2);
    
    // Also speak it
    speak("Try again");
  }, []);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1; // Slightly higher pitch for kids
      // Try to find a friendly voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female')) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;
      
      window.speechSynthesis.cancel(); // Clear queue
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  return { playYay, playTryAgain, speak };
};
