import { useState, useEffect, useRef, useCallback } from 'react';
import { Language } from '../types';

interface SpeechQueueItem {
  text: string;
  id: string; // To identify which item is being spoken
}

interface SpeechQueueChunk {
  text: string;
  id: string;
  isFirstChunk: boolean;
}

interface TextToSpeechOptions {
  language: Language;
  onBoundary: (itemId: string | null) => void;
  onEnd: () => void;
}

const sanitizeText = (text: string): string => {
    if (!text) return '';
    let sanitized = text;
    // Remove markdown-like formatting that shouldn't be read
    sanitized = sanitized.replace(/(\*\*|__|\*|_)/g, '');
    // Replace "smart" quotes and other special characters with standard ones
    sanitized = sanitized.replace(/[""]/g, '"');
    sanitized = sanitized.replace(/['']/g, "'");
    // Remove characters that can cause issues, like vertical tabs.
    sanitized = sanitized.replace(/[\x0B]/g, ' ');
    return sanitized.trim();
};

const chunkText = (text: string): string[] => {
    if (!text) return [];

    const chunks: string[] = [];
    // Reduced maxLength to prevent mid-sentence pauses
    const maxLength = 80;

    // Split by sentence terminators, but be more careful about abbreviations
    const sentences = text.split(/(?<=[.!?])\s+/);

    sentences.forEach(sentence => {
        const trimmedSentence = sentence.trim();
        if (trimmedSentence.length === 0) return;

        if (trimmedSentence.length <= maxLength) {
            chunks.push(trimmedSentence);
        } else {
            // If a sentence is too long, try to split by natural breaks
            const naturalBreaks = trimmedSentence.split(/(?<=[,;:])\s+/);
            
            naturalBreaks.forEach(breakPart => {
                if (breakPart.length <= maxLength) {
                    chunks.push(breakPart);
                } else {
                    // If still too long, split by words but try to keep phrases together
                    const words = breakPart.split(/\s+/);
                    let currentChunk = '';
                    
                    words.forEach(word => {
                        const chunkWithWord = currentChunk ? `${currentChunk} ${word}` : word;
                        if (chunkWithWord.length > maxLength) {
                            if (currentChunk.length > 0) {
                                chunks.push(currentChunk);
                            }
                            currentChunk = word;
                        } else {
                            currentChunk = chunkWithWord;
                        }
                    });
                    
                    if (currentChunk.length > 0) {
                        chunks.push(currentChunk);
                    }
                }
            });
        }
    });

    return chunks.filter(c => c.trim().length > 0);
};

export const useTextToSpeech = ({ language, onBoundary, onEnd }: TextToSpeechOptions) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const queueRef = useRef<SpeechQueueChunk[]>([]);
  const keepAliveIntervalRef = useRef<number | null>(null);
  // Use a ref to prevent re-entrant calls to processQueue
  const isProcessingRef = useRef<boolean>(false);

  const stopKeepAlive = useCallback(() => {
    if (keepAliveIntervalRef.current) {
      window.clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }
  }, []);

  const fullReset = useCallback(() => {
      stopKeepAlive();
      queueRef.current = [];
      setIsSpeaking(false);
      isProcessingRef.current = false;
      onBoundary(null);
      // It's safer to explicitly cancel any lingering speech synthesis.
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      onEnd();
  }, [onEnd, stopKeepAlive, onBoundary]);
  
  const processQueue = useCallback(() => {
    if (isProcessingRef.current || window.speechSynthesis.speaking) {
      return; // Already processing or speaking, wait for it to finish
    }
    if (queueRef.current.length === 0) {
      fullReset();
      return;
    }

    isProcessingRef.current = true;
    const chunkItem = queueRef.current.shift();
    if (!chunkItem || !chunkItem.text) {
        isProcessingRef.current = false;
        processQueue(); // Skip empty chunk
        return;
    };

    const utterance = new SpeechSynthesisUtterance(chunkItem.text);
    const voiceLang = language === 'nl' ? 'nl-NL' : 'en-US';
    const voices = window.speechSynthesis.getVoices();
    
    // Prioritize Google voices as they are often higher quality
    let selectedVoice = voices.find(v => v.lang === voiceLang && v.name.includes('Google'));
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang === voiceLang);
    }
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = 0.9; // Slightly slower for better clarity
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (chunkItem.isFirstChunk) {
        onBoundary(chunkItem.id);
      }
      // Start keep-alive. Some browsers (e.g., Chrome on some OS) stop speech after ~15s.
      stopKeepAlive();
      keepAliveIntervalRef.current = window.setInterval(() => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 12000); // Pulse every 12 seconds
    };

    utterance.onend = () => {
      isProcessingRef.current = false;
      // Longer delay to allow the speech engine to settle before the next utterance.
      setTimeout(() => processQueue(), 200); 
    };
    
    utterance.onerror = (event) => {
      console.error("SpeechSynthesisUtterance.onerror event object:", event);
      console.error("Speech synthesis error details:", {
            error: event.error,
            textChunk: chunkItem.text.substring(0, 50) + '...',
            language: language,
            voice: utterance.voice?.name || 'default',
      });
      // A full reset is the safest way to recover from an error.
      fullReset();
    };

    window.speechSynthesis.speak(utterance);
  }, [language, onBoundary, fullReset, stopKeepAlive]);

  const play = useCallback((items: SpeechQueueItem[]) => {
    // Force a cancel and reset before starting anything new.
    // This is the most reliable way to prevent overlapping speech requests.
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    fullReset();

    if (!items || items.length === 0) {
        return;
    }
    
    const newQueue: SpeechQueueChunk[] = [];
    items.forEach(item => {
        const sanitizedText = sanitizeText(item.text);
        const chunks = chunkText(sanitizedText);
        if (chunks.length > 0) {
            chunks.forEach((chunk, index) => {
                newQueue.push({
                    text: chunk,
                    id: item.id,
                    isFirstChunk: index === 0,
                });
            });
        }
    });

    if (newQueue.length === 0) {
        fullReset();
        return;
    }
    
    queueRef.current = newQueue;
    setIsSpeaking(true); // Set speaking state immediately for UI feedback

    // Wait for voices to be loaded if they aren't already
    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
            // Check if queue still exists, in case user cancelled in the meantime
            if (queueRef.current.length > 0) processQueue();
        }
    } else {
        processQueue();
    }
  }, [processQueue, fullReset]);

  const cancel = useCallback(() => {
    fullReset();
  }, [fullReset]);

  // General cleanup on unmount
  useEffect(() => {
    return () => {
      if(window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      stopKeepAlive();
    };
  }, [stopKeepAlive]);

  // A safety net to resume speech synthesis if it gets stuck when changing browser tabs
  useEffect(() => {
      const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible' && isSpeaking) {
             if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
             }
          }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
  }, [isSpeaking]);

  return { play, cancel, isSpeaking };
};