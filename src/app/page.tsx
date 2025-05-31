
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
import { translateText } from "@/ai/flows/translate-text-flow";
import { checkGrammar } from "@/ai/flows/check-grammar-flow";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid"; 
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type PendingChangeType = 'language' | 'scenario' | 'interactionMode';

interface PendingChangeDetails {
  type: PendingChangeType;
  value: string;
  setter: (value: string) => void;
}

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

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingChangeDetails, setPendingChangeDetails] = useState<PendingChangeDetails | null>(null);

  const currentLanguageDetails = useMemo(() => LANGUAGES.find(l => l.value === selectedLanguage), [selectedLanguage]);

  useEffect(() => {
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    if (!synth) return;

    const loadVoices = () => {
      const voices = synth.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices(); 
    if (synth.onvoiceschanged !== undefined) { 
      synth.onvoiceschanged = loadVoices;
    }

    return () => {
      if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = null;
      }
      if(synth.speaking) {
        synth.cancel(); 
      }
    };
  }, []); 

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
      originalLanguage: selectedLanguage, 
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
          originalLanguage: selectedLanguage, 
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
        originalLanguage: selectedLanguage,
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

  const handleTranslateMessage = async (messageId: string, textToTranslate: string, originalLang: string) => {
    setConversationHistory(prev => 
      prev.map(msg => msg.id === messageId ? { ...msg, isTranslating: true, translatedText: undefined, grammarFeedback: undefined } : msg)
    );
    try {
      const translationResponse = await translateText({
        textToTranslate: textToTranslate,
        sourceLanguage: originalLang,
        targetLanguage: "English",
      });
      if (translationResponse.translatedText) {
        setConversationHistory(prev =>
          prev.map(msg => 
            msg.id === messageId 
            ? { ...msg, translatedText: translationResponse.translatedText, isTranslating: false } 
            : msg
          )
        );
      } else {
        throw new Error("Translation service did not return text.");
      }
    } catch (error) {
      console.error("Error translating text:", error);
      toast({
        title: "Translation Error",
        description: "Failed to translate the message. Please try again.",
        variant: "destructive",
      });
      setConversationHistory(prev =>
        prev.map(msg => msg.id === messageId ? { ...msg, isTranslating: false } : msg)
      );
    }
  };

  const handleCheckGrammar = async (messageId: string, textToCheck: string, language: string) => {
    setConversationHistory(prev => 
      prev.map(msg => msg.id === messageId ? { ...msg, isCheckingGrammar: true, grammarFeedback: undefined, translatedText: undefined } : msg)
    );
    try {
      const grammarResponse = await checkGrammar({
        textToCheck: textToCheck,
        language: language,
      });
      if (grammarResponse.feedback) {
        setConversationHistory(prev =>
          prev.map(msg => 
            msg.id === messageId 
            ? { ...msg, grammarFeedback: grammarResponse.feedback, isCheckingGrammar: false } 
            : msg
          )
        );
      } else {
        throw new Error("Grammar check service did not return feedback.");
      }
    } catch (error) {
      console.error("Error checking grammar:", error);
      toast({
        title: "Grammar Check Error",
        description: "Failed to check grammar for the message. Please try again.",
        variant: "destructive",
      });
      setConversationHistory(prev =>
        prev.map(msg => msg.id === messageId ? { ...msg, isCheckingGrammar: false } : msg)
      );
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
        synth.cancel(); 
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
    const lastMessage = conversationHistory.length > 0 ? conversationHistory[conversationHistory.length - 1] : null;
    if (selectedInteractionMode === 'verbal' && lastMessage?.speaker === 'agent') {
        const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
        if (synth && synth.getVoices().length > 0) {
            speakAgentMessage();
        } else if (synth) {
            const tempVoicesChangedHandler = () => {
                speakAgentMessage();
                synth.onvoiceschanged = null; 
            };
            synth.onvoiceschanged = tempVoicesChangedHandler;
        }
    }
  }, [conversationHistory, selectedInteractionMode, speakAgentMessage]);

  const initiateChange = (
    type: PendingChangeType,
    newValue: string,
    currentValue: string,
    setter: (value: string) => void
  ) => {
    if (newValue === currentValue) return;

    if (conversationHistory.length > 0) {
      setPendingChangeDetails({ type, value: newValue, setter });
      setIsConfirmDialogOpen(true);
    } else {
      setter(newValue);
    }
  };

  const handleConfirmChange = () => {
    if (pendingChangeDetails) {
      pendingChangeDetails.setter(pendingChangeDetails.value);
    }
    setIsConfirmDialogOpen(false);
    setPendingChangeDetails(null);
  };

  const handleCancelChange = () => {
    setIsConfirmDialogOpen(false);
    setPendingChangeDetails(null);
  };

  useEffect(() => {
    setConversationHistory([]);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsAgentSpeaking(false);
    }
  }, [selectedLanguage, selectedScenario, selectedInteractionMode]);

  useEffect(() => {
    setSelectedVoiceURI(undefined);
  }, [selectedLanguage]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const isUIBlocked = isLoading || isLoadingSuggestion || (selectedInteractionMode === 'verbal' && isAgentSpeaking) || isConfirmDialogOpen;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex flex-col container mx-auto p-4 md:p-6 gap-4 md:gap-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <LanguageSelector
            languages={LANGUAGES}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={(lang) => initiateChange('language', lang, selectedLanguage, setSelectedLanguage)}
            disabled={isUIBlocked}
          />
          <ScenarioSelector
            scenarios={SCENARIOS}
            selectedScenario={selectedScenario}
            onSelectScenario={(scenario) => initiateChange('scenario', scenario, selectedScenario, setSelectedScenario)}
            disabled={isUIBlocked}
          />
          <InteractionSelector
            interactionModes={INTERACTION_MODES}
            selectedInteractionMode={selectedInteractionMode}
            onSelectInteractionMode={(mode) => initiateChange('interactionMode', mode, selectedInteractionMode, setSelectedInteractionMode as (value: string) => void)}
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
        <ConversationArea 
          messages={conversationHistory} 
          isLoading={isLoading}
          selectedLanguage={selectedLanguage}
          onTranslateMessage={handleTranslateMessage}
          onCheckGrammar={handleCheckGrammar}
        />
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
        <p>&copy; {new Date().getFullYear()} ConverseAI. Practice makes perfect!</p>
      </footer>

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Change</AlertDialogTitle>
            <AlertDialogDescription>
              Changing the {pendingChangeDetails?.type} will reset your current conversation. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelChange}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmChange}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    
