"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/lingualive/Header";
import { LanguageSelector } from "@/components/lingualive/LanguageSelector";
import { ScenarioSelector } from "@/components/lingualive/ScenarioSelector";
import { ConversationArea } from "@/components/lingualive/ConversationArea";
import { UserInput } from "@/components/lingualive/UserInput";
import type { Message } from "@/components/lingualive/ConversationMessage";
import { LANGUAGES, SCENARIOS, DEFAULT_LANGUAGE, DEFAULT_SCENARIO } from "@/lib/constants";
import { generateAgentResponse } from "@/ai/flows/generate-agent-response";
import { provideSandboxSuggestions } from "@/ai/flows/provide-sandbox-suggestions";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid"; // For unique message IDs

export default function LinguaLivePage() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(DEFAULT_LANGUAGE);
  const [selectedScenario, setSelectedScenario] = useState<string>(DEFAULT_SCENARIO);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState<boolean>(false);
  const { toast } = useToast();

  const formatConversationHistoryForAI = (history: Message[]): string => {
    return history
      .map((msg) => `${msg.speaker === "user" ? "User" : "Agent"}: ${msg.text}`)
      .join("\n");
  };

  const handleSendMessage = async (userInput: string) => {
    if (!selectedLanguage || !selectedScenario) {
      toast({
        title: "Selection Missing",
        description: "Please select a language and a scenario first.",
        variant: "destructive",
      });
      return;
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
       // Optionally add a placeholder error message from agent
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
        // Optionally, pre-fill the input or let user copy. For now, just a toast.
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
  
  // Reset conversation when language or scenario changes
  useEffect(() => {
    setConversationHistory([]);
  }, [selectedLanguage, selectedScenario]);


  const isUIBlocked = isLoading || isLoadingSuggestion;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex flex-col container mx-auto p-4 md:p-6 gap-4 md:gap-6">
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
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
        </div>
        <ConversationArea messages={conversationHistory} isLoading={isLoading} />
        <UserInput
          onSendMessage={handleSendMessage}
          onGetSuggestion={selectedScenario === "Sandbox" ? handleGetSuggestion : undefined}
          isLoading={isLoading}
          isLoadingSuggestion={isLoadingSuggestion}
          isSandboxMode={selectedScenario === "Sandbox"}
          disabled={isUIBlocked || !selectedLanguage || !selectedScenario}
        />
      </main>
      <footer className="text-center py-4 text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} LinguaLive. Practice makes perfect!</p>
      </footer>
    </div>
  );
}
