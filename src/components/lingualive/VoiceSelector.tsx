
"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Volume2, PlayCircle, StopCircle, Loader2 } from 'lucide-react';
import type { InteractionModeOption } from '@/lib/constants';

interface VoiceSelectorProps {
  voices: SpeechSynthesisVoice[];
  selectedVoiceURI: string | undefined;
  onSelectVoiceURI: (uri: string | undefined) => void;
  disabled?: boolean;
  currentLanguageBcp47: string | undefined;
  interactionMode: InteractionModeOption['value'];
}

export function VoiceSelector({
  voices,
  selectedVoiceURI,
  onSelectVoiceURI,
  disabled = false,
  currentLanguageBcp47,
  interactionMode,
}: VoiceSelectorProps) {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSynth(window.speechSynthesis);
    }
  }, []);

  useEffect(() => {
    // Stop preview if component is disabled or interaction mode changes from verbal
    if ((disabled || interactionMode === 'written') && isPreviewing && synth) {
      synth.cancel();
      setIsPreviewing(false);
    }
  }, [disabled, interactionMode, isPreviewing, synth]);

  // Cleanup synth on unmount
  useEffect(() => {
    return () => {
      if (synth && synth.speaking) {
        synth.cancel();
      }
    };
  }, [synth]);


  const handlePreviewVoice = () => {
    if (!synth || !selectedVoiceURI || selectedVoiceURI === "default" || !currentLanguageBcp47) return;

    if (synth.speaking) {
      synth.cancel();
      setIsPreviewing(false); // Explicitly set to false as onend might not fire immediately
      return;
    }

    const voiceToPreview = voices.find(v => v.voiceURI === selectedVoiceURI);
    if (!voiceToPreview) return;

    const sampleText = "Hello, I can speak in this voice.";
    const utterance = new SpeechSynthesisUtterance(sampleText);
    utterance.voice = voiceToPreview;
    utterance.lang = currentLanguageBcp47; // Use BCP47 for language
    utterance.pitch = 1;
    utterance.rate = 1;

    utterance.onstart = () => setIsPreviewing(true);
    utterance.onend = () => setIsPreviewing(false);
    utterance.onerror = (e) => {
      console.error("Speech synthesis error during preview:", e);
      setIsPreviewing(false);
    };

    synth.speak(utterance);
  };

  const canPreview = !disabled && 
                     interactionMode === 'verbal' && 
                     !!selectedVoiceURI && 
                     selectedVoiceURI !== "default" &&
                     voices.length > 0 &&
                     !!currentLanguageBcp47;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="voice-select" className="flex items-center text-base">
          <Volume2 className="mr-2 h-5 w-5 text-primary" />
          Choose a Voice
        </Label>
        {interactionMode === 'verbal' && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handlePreviewVoice}
            disabled={!canPreview || (isPreviewing && !synth?.speaking)} // Disable if cannot preview or if previewing but synth isn't active (edge case)
            className="h-8 w-8 text-primary data-[disabled=true]:text-muted-foreground"
            aria-label={isPreviewing ? "Stop voice preview" : "Preview selected voice"}
          >
            {isPreviewing && synth?.speaking ? ( // Ensure synth is actually speaking before showing StopCircle
              <StopCircle className="h-5 w-5" />
            ) : (
              <PlayCircle className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>
      <Select
        value={selectedVoiceURI || "default"}
        onValueChange={(value) => onSelectVoiceURI(value === "default" ? undefined : value)}
        disabled={disabled || voices.length === 0 || interactionMode === 'written'}
      >
        <SelectTrigger id="voice-select" className="w-full text-base py-3 h-auto rounded-lg shadow-sm">
          <SelectValue placeholder="Select a voice..." />
        </SelectTrigger>
        <SelectContent>
          {voices.length === 0 && interactionMode === 'verbal' && (
            <SelectItem value="no-voices" disabled className="text-base py-2">
              No voices for this language
            </SelectItem>
          )}
           {interactionMode === 'written' && (
            <SelectItem value="written-mode" disabled className="text-base py-2">
              Voice selection N/A (Written Mode)
            </SelectItem>
          )}
          <SelectItem value="default" className="text-base py-2">
            Default Voice
          </SelectItem>
          {voices.map((voice) => (
            <SelectItem key={voice.voiceURI} value={voice.voiceURI} className="text-base py-2">
              {voice.name} ({voice.lang})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
