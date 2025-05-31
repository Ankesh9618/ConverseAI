
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Header } from "@/components/lingualive/Header";
import { LanguageSelector } from "@/components/lingualive/LanguageSelector";
import { ScenarioSelector } from "@/components/lingualive/ScenarioSelector";
import { InteractionSelector } from "@/components/lingualive/InteractionSelector";
import { VoiceSelector } from "@/components/lingualive/VoiceSelector";
import { ConversationArea } from "@/components/lingualive/ConversationArea";
import { UserInput } from "@/components/lingualive/UserInput";
import type { Message } from "@/components/lingualive/ConversationMessage";
import { 
  LANGUAGES, 
  SCENARIOS, 
  INTERACTION_MODES,
  DEFAULT_LANGUAGE, 
  DEFAULT_SCENARIO,
  DEFAULT_INTERACTION_MODE,
  type InteractionModeOption 
} from "@/lib/constants";
import { generateAgentResponse } from "@/ai/flows/generate-agent-response";
import { provideSandboxSuggestions } from "@/ai/flows/provide-sandbox-suggestions";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid"; 

export default function LinguaLivePage() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(DEFAULT_LANGUAGE);
  const [selectedScenario, setSelectedScenario] = useState<string>(DEFAULT_SCENARIO);
  const [selectedInteractionMode, setSelectedInteractionMode] = useState<InteractionModeOption['value']>(DEFAULT_INTERACTION_MODE);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState<boolean>(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState<boolean>(false);
  const { toast } = useToast();

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | undefined>(undefined);

  const currentLanguageDetails = useMemo(() => LANGUAGES.find(l => l.value === selectedLanguage), [selectedLanguage]);

  useEffect(() => {
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    if (!synth) return;

    const loadVoices = () => {
      const voices = synth.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices(); // Initial load
    if (synth.onvoiceschanged !== undefined) { // Subscribe to changes
      synth.onvoiceschanged = loadVoices;
    }

    return () => {
      if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = null;
      }
      if(synth.speaking) {
        synth.cancel(); // Cancel any speech on component unmount or if dependencies change this effect
      }
    };
  }, []); // Empty dependency array: runs once on mount and cleans up on unmount

  const voicesForSelectedLanguage = useMemo(() => {
    if (!currentLanguageDetails?.bcp47 || availableVoices.length === 0) {
      return [];
    }
    const baseLang = currentLanguageDetails.bcp47.split('-')[0];
    return availableVoices.filter(voice => voice.lang.startsWith(baseLang));
  }, [availableVoices, currentLanguageDetails?.bcp47]);


  const formatConversationHistoryForAI = (history: Message[]): string => {
    return history
      .map((msg) => `${msg.speaker === "user" ? "User" : "Agent"}: ${msg.text}`)
      .join("\n");
  };

  const handleSendMessage = async (userInput: string) => {
    if (!selectedLanguage || !selectedScenario || !selectedInteractionMode) {
      toast({
        title: "Selection Missing",
        description: "Please select language, scenario, and interaction mode.",
        variant: "destructive",
      });
      return;
    }
     if (selectedInteractionMode === 'verbal' && typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel(); 
      setIsAgentSpeaking(false);
    }

    const newUserMessage: Message = {
      id: uuidv4(),
      speaker: "user",
      text: userInput,
    };
    const updatedHistory = [...conversationHistory, newUserMessage];
    setConversationHistory(updatedHistory);
    setIsLoading(true);

    try {
      const aiResponse = await generateAgentResponse({
        language: selectedLanguage,
        scenario: selectedScenario,
        userInput: userInput,
        conversationHistory: formatConversationHistoryForAI(updatedHistory),
      });

      if (aiResponse.agentResponse) {
        const agentMessage: Message = {
          id: uuidv4(),
          speaker: "agent",
          text: aiResponse.agentResponse,
        };
        setConversationHistory((prevHistory) => [...prevHistory, agentMessage]);
      } else {
        throw new Error("AI did not provide a response.");
      }
    } catch (error) {
      console.error("Error generating agent response:", error);
      toast({
        title: "Error",
        description: "Failed to get a response from the AI. Please try again.",
        variant: "destructive",
      });
       const agentErrorMessage: Message = {
        id: uuidv4(),
        speaker: "agent",
        text: "I'm sorry, I encountered an error. Could you please try rephrasing or try again later?",
      };
      setConversationHistory((prevHistory) => [...prevHistory, agentErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetSuggestion = async () => {
    if (selectedScenario !== "Sandbox") return;
    setIsLoadingSuggestion(true);
    try {
      const suggestionResponse = await provideSandboxSuggestions({
        language: selectedLanguage,
        conversationHistory: formatConversationHistoryForAI(conversationHistory),
      });
      if (suggestionResponse.suggestion) {
        toast({
          title: "Suggestion",
          description: (
            <div>
              <p className="font-semibold">Try saying this:</p>
              <p className="mt-1 p-2 bg-muted rounded-md">{suggestionResponse.suggestion}</p>
            </div>
          ),
        });
      }
    } catch (error) {
      console.error("Error getting suggestion:", error);
      toast({
        title: "Error",
        description: "Failed to get a suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSuggestion(false);
    }
  };
  
  const speakAgentMessage = useCallback(() => {
    if (selectedInteractionMode !== 'verbal') {
      setIsAgentSpeaking(false);
      return;
    }

    const lastMessage = conversationHistory.length > 0 ? conversationHistory[conversationHistory.length - 1] : null;

    if (lastMessage?.speaker === 'agent' && lastMessage.text && typeof window !== 'undefined' && window.speechSynthesis) {
      const synth = window.speechSynthesis;
      
      if (synth.speaking) {
        synth.cancel(); // Cancel previous speech before starting new one
      }

      const utterance = new SpeechSynthesisUtterance(lastMessage.text);
      if (currentLanguageDetails?.bcp47) {
        utterance.lang = currentLanguageDetails.bcp47;
      }

      const voices = synth.getVoices(); 
      if (voices.length > 0) {
        let voiceToUse: SpeechSynthesisVoice | undefined = undefined;
        if (selectedVoiceURI) {
          voiceToUse = voices.find(v => v.voiceURI === selectedVoiceURI);
        }
        
        if (!voiceToUse && utterance.lang) { 
          voiceToUse = voices.find(v => v.lang === utterance.lang) || 
                       voices.find(v => utterance.lang && v.lang.startsWith(utterance.lang.split('-')[0]));
        }
        
        if (voiceToUse) {
          utterance.voice = voiceToUse;
        }
      }
      
      utterance.onstart = () => setIsAgentSpeaking(true);
      utterance.onend = () => setIsAgentSpeaking(false);
      utterance.onerror = (e) => {
        console.error("Speech synthesis error:", e);
        setIsAgentSpeaking(false);
        toast({ title: "Voice Output Error", description: "Could not play agent's voice.", variant: "destructive" });
      };
      
      synth.speak(utterance);
    }
  }, [conversationHistory, currentLanguageDetails?.bcp47, toast, selectedInteractionMode, selectedVoiceURI]); 

  useEffect(() => {
    // This effect specifically triggers speaking the latest agent message.
    // It runs when conversationHistory, selectedInteractionMode, or speakAgentMessage function itself changes.
    const lastMessage = conversationHistory.length > 0 ? conversationHistory[conversationHistory.length - 1] : null;
    if (selectedInteractionMode === 'verbal' && lastMessage?.speaker === 'agent') {
        // Ensure voices are loaded before attempting to speak.
        // The main voice loading happens in another useEffect.
        // Here, we check if voices are available, if not, onvoiceschanged should eventually trigger speakAgentMessage
        // once they are. This call handles cases where voices are already loaded.
        const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
        if (synth && synth.getVoices().length > 0) {
            speakAgentMessage();
        } else if (synth) {
            // If voices not yet loaded, wait for them
            const tempVoicesChangedHandler = () => {
                speakAgentMessage();
                synth.onvoiceschanged = null; // Clean up temp handler
            };
            synth.onvoiceschanged = tempVoicesChangedHandler;
        }
    }
  }, [conversationHistory, selectedInteractionMode, speakAgentMessage]);


  useEffect(() => {
    setConversationHistory([]);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsAgentSpeaking(false);
    }
    // Reset voice selection only when language changes to ensure the voice list is relevant
    // setSelectedVoiceURI(undefined); // This was too broad, moved selective reset below.
  }, [selectedScenario, selectedInteractionMode]);

  useEffect(() => {
    // Specifically reset voice URI when language changes
    setSelectedVoiceURI(undefined);
  }, [selectedLanguage]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const isUIBlocked = isLoading || isLoadingSuggestion || (selectedInteractionMode === 'verbal' && isAgentSpeaking);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex flex-col container mx-auto p-4 md:p-6 gap-4 md:gap-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <LanguageSelector
            languages={LANGUAGES}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
            disabled={isUIBlocked}
          />
          <ScenarioSelector
            scenarios={SCENARIOS}
            selectedScenario={selectedScenario}
            onSelectScenario={setSelectedScenario}
            disabled={isUIBlocked}
          />
          <InteractionSelector
            interactionModes={INTERACTION_MODES}
            selectedInteractionMode={selectedInteractionMode}
            onSelectInteractionMode={setSelectedInteractionMode}
            disabled={isUIBlocked}
          />
          <VoiceSelector
            voices={voicesForSelectedLanguage}
            selectedVoiceURI={selectedVoiceURI}
            onSelectVoiceURI={setSelectedVoiceURI}
            disabled={isUIBlocked || voicesForSelectedLanguage.length === 0 || selectedInteractionMode === 'written'}
            currentLanguageBcp47={currentLanguageDetails?.bcp47}
            interactionMode={selectedInteractionMode}
          />
        </div>
        <ConversationArea messages={conversationHistory} isLoading={isLoading} />
        <UserInput
          onSendMessage={handleSendMessage}
          onGetSuggestion={selectedScenario === "Sandbox" ? handleGetSuggestion : undefined}
          isLoading={isLoading}
          isLoadingSuggestion={isLoadingSuggestion}
          isSandboxMode={selectedScenario === "Sandbox"}
          disabled={isUIBlocked || !selectedLanguage || !selectedScenario || !selectedInteractionMode}
          currentLanguageBcp47={currentLanguageDetails?.bcp47 || 'en-US'}
          interactionMode={selectedInteractionMode}
        />
      </main>
      <footer className="text-center py-4 text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} LinguaLive. Practice makes perfect!</p>
      </footer>
    </div>
  );
}
