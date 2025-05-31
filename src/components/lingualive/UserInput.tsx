"use client";

import { useState, type FormEvent, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Lightbulb, Loader2, Mic, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { InteractionModeOption } from "@/lib/constants";

interface UserInputProps {
  onSendMessage: (message: string) => void;
  onGetSuggestion?: () => void;
  isLoading: boolean;
  isLoadingSuggestion?: boolean;
  isSandboxMode: boolean;
  disabled?: boolean;
  currentLanguageBcp47: string;
  interactionMode: InteractionModeOption['value'];
}

export function UserInput({
  onSendMessage,
  onGetSuggestion,
  isLoading,
  isLoadingSuggestion = false,
  isSandboxMode,
  disabled = false,
  currentLanguageBcp47,
  interactionMode,
}: UserInputProps) {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechApiSupported, setSpeechApiSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const { toast } = useToast();

  const speechRecognitionRef = useRef<any>(null); 

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setSpeechApiSupported(false);
      return;
    }
    setSpeechApiSupported(true);

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false; // Important for verbal mode auto-send
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechError(null);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (interactionMode === 'verbal') {
        onSendMessage(transcript); // Auto-send in verbal mode
        setMessage(""); // Clear textarea if it was showing transcript
      } else {
        setMessage(prevMessage => prevMessage ? prevMessage + " " + transcript : transcript);
      }
    };

    recognition.onerror = (event: any) => {
      let errorMsg = "Speech recognition error.";
      if (event.error === 'no-speech') {
        errorMsg = "No speech detected. Please try again.";
      } else if (event.error === 'audio-capture') {
        errorMsg = "Microphone problem. Please check your microphone.";
      } else if (event.error === 'not-allowed') {
        errorMsg = "Microphone permission denied. Please enable it in your browser settings.";
      }
      setSpeechError(errorMsg);
      toast({ title: "Voice Input Error", description: errorMsg, variant: "destructive" });
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    speechRecognitionRef.current = recognition;

    return () => {
      if (speechRecognitionRef.current && typeof speechRecognitionRef.current.stop === 'function') {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {
           console.warn("Error stopping speech recognition on cleanup:", e);
        }
      }
    };
  }, [toast, interactionMode, onSendMessage]); // Added interactionMode and onSendMessage to dependencies

  // Stop listening if interaction mode changes to written
  useEffect(() => {
    if (interactionMode === 'written' && isListening && speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    }
  }, [interactionMode, isListening]);

  const handleMicClick = () => {
    if (interactionMode === 'written' || !speechApiSupported) {
      if (!speechApiSupported) {
        toast({ title: "Voice input not supported", description: "Your browser does not support the Web Speech API.", variant: "destructive" });
      }
      return;
    }
    if (isLoading || disabled) return;

    if (speechRecognitionRef.current) {
      if (isListening) {
        speechRecognitionRef.current.stop();
      } else {
        setMessage(""); // Clear text area when starting mic in verbal mode
        speechRecognitionRef.current.lang = currentLanguageBcp47;
        try {
          speechRecognitionRef.current.start();
        } catch (e: any) {
          console.error("Error starting speech recognition:", e);
          const errorMsg = "Could not start voice input. This might be due to an ongoing session or a browser issue. Please try again.";
          setSpeechError(errorMsg);
          toast({ title: "Voice Input Error", description: errorMsg, variant: "destructive" });
          setIsListening(false);
        }
      }
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (interactionMode === 'written' && message.trim() && !isLoading && !isListening) {
      onSendMessage(message.trim());
      setMessage("");
    }
    // In verbal mode, send is handled by STT onresult
  };

  const micButtonDisabled = disabled || isLoading || !speechApiSupported || (interactionMode === 'written');
  const sendButtonDisabled = disabled || isLoading || (interactionMode === 'written' && !message.trim()) || isListening || interactionMode === 'verbal';
  const textAreaDisabled = disabled || isLoading || isListening || (interactionMode === 'verbal' && !isListening) ;


  return (
    <form onSubmit={handleSubmit} className="bg-card p-4 rounded-lg border shadow-sm">
      <div className="flex items-end gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={interactionMode === 'verbal' ? (isListening ? "Listening..." : "Click mic to speak...") : "Type your message here..."}
          className="flex-1 resize-none rounded-lg text-base shadow-sm focus:ring-accent"
          rows={2}
          onKeyDown={(e) => {
            if (interactionMode === 'written' && e.key === 'Enter' && !e.shiftKey && !isLoading && !isListening) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={textAreaDisabled}
          readOnly={interactionMode === 'verbal'} // Make read-only in verbal to show transcript
          aria-label="Your message"
        />
        <div className="flex flex-col gap-2">
          {interactionMode === 'verbal' && (
            <Button
              type="button"
              onClick={handleMicClick}
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              className="rounded-lg h-11 w-11 border-primary text-primary hover:bg-primary/10 data-[state=destructive]:bg-destructive data-[state=destructive]:text-destructive-foreground"
              disabled={micButtonDisabled}
              aria-label={isListening ? "Stop listening" : speechApiSupported ? "Start voice input" : "Voice input not supported"}
            >
              {isListening ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : speechError && !isListening ? (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
          )}

          {isSandboxMode && onGetSuggestion && (
            <Button
              type="button"
              onClick={onGetSuggestion}
              variant="outline"
              size="icon"
              className="rounded-lg h-11 w-11 border-accent text-accent hover:bg-accent/10"
              disabled={disabled || isLoading || isLoadingSuggestion || isListening}
              aria-label="Get a suggestion"
            >
              {isLoadingSuggestion ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Lightbulb className="h-5 w-5" />
              )}
            </Button>
          )}

          {interactionMode === 'written' && (
             <Button
              type="submit"
              size="icon"
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-11 w-11"
              disabled={sendButtonDisabled}
              aria-label="Send message"
            >
              {isLoading && interactionMode === 'written' ? ( // Show loader on send only in written mode
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>
      </div>
      {interactionMode === 'verbal' && !speechApiSupported && <p className="text-xs text-muted-foreground mt-1 text-center">Voice input is not supported by your browser.</p>}
    </form>
  );
}
