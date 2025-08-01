import { useState, useEffect, useRef, useCallback } from 'react';
import { Language } from '../types';

interface SpeechQueueItem {
  text: string;
  id: string; // To identify which item is being spoken
}

interface TextToSpeechOptions {
  language: Language;
  onBoundary: (itemId: string) => void;
  onEnd: () => void;
}

export const useTextToSpeech = ({ language, onBoundary, onEnd }: TextToSpeechOptions) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const queueRef = useRef<SpeechQueueItem[]>([]);
  
  const processQueue = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      return;
    }
    if (queueRef.current.length === 0) {
      setIsSpeaking(false);
      onEnd();
      return;
    }

    const item = queueRef.current.shift();
    if (!item) return;

    const utterance = new SpeechSynthesisUtterance(item.text);
    
    const voices = window.speechSynthesis.getVoices();
    const voiceLang = language === 'nl' ? 'nl-NL' : 'en-US';
    
    let selectedVoice = voices.find(v => v.lang === voiceLang && v.name.includes('Google'));
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang === voiceLang);
    }
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
        setIsSpeaking(true);
        onBoundary(item.id);
    };

    utterance.onend = () => {
      processQueue();
    };
    
    utterance.onerror = (event) => {
        console.error("SpeechSynthesisUtterance.onerror", event);
        queueRef.current = [];
        setIsSpeaking(false);
        onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }, [language, onBoundary, onEnd]);


  const play = useCallback((items: SpeechQueueItem[]) => {
    if (items.length === 0 || window.speechSynthesis.speaking) return;
    
    const startSpeech = () => {
      queueRef.current = [...items];
      processQueue();
    }
    
    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = startSpeech;
    } else {
        startSpeech();
    }
  }, [processQueue]);

  const cancel = useCallback(() => {
    window.speechSynthesis.cancel();
    queueRef.current = [];
    setIsSpeaking(false);
    onEnd();
  }, [onEnd]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return { play, cancel, isSpeaking };
};
