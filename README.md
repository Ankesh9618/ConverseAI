# ConverseAI

ConverseAI is an interactive web application designed to help users practice and improve their conversational skills in various foreign languages. It leverages AI to simulate realistic dialogues in different scenarios, providing a dynamic learning environment.

## Core Features

*   **Multiple Language Support:** Practice conversations in languages like English, Spanish, French, German, Japanese, Mandarin Chinese, and Italian.
*   **Scenario-Based Learning:** Engage in conversations tailored to common real-world situations such as meeting a stranger, ordering food, buying groceries, or asking for directions.
*   **Sandbox Mode:** Enjoy open-ended conversations for free-form practice.
*   **Dual Interaction Modes:**
    *   **Written Mode:** Type your messages and receive text-based AI responses.
    *   **Verbal Mode:** Use your microphone to speak; your speech is transcribed, and AI responses are spoken back to you.
*   **Voice Selection:** In verbal mode, choose from a variety of available voices for the AI agent's speech, with a preview option.
*   **Speech-to-Text (STT):** Integrated voice input for hands-free communication in verbal mode.
*   **Text-to-Speech (TTS):** AI agent's responses are read aloud in verbal mode, with voice selection.
*   **In-Conversation Tools:**
    *   **Translate Messages:** Translate both user and AI messages to English if the conversation is in a different language.
    *   **Grammar Check:** Get AI-powered grammar feedback on your written/spoken messages.
*   **Contextual Awareness:** AI responses are generated based on the selected language, scenario, and conversation history.
*   **Safe Reset:** Confirmation dialog before resetting the conversation when changing core settings (language, scenario, interaction mode).

## Tech Stack

*   **Frontend:** Next.js, React
*   **UI Components:** ShadCN UI
*   **Styling:** Tailwind CSS
*   **AI Integration:** Genkit (with Google AI models)
*   **Voice Interaction:** Browser Web Speech API (for STT and TTS)

## Getting Started

The main application logic and UI structure can be found in `src/app/page.tsx`. This is the primary entry point for the user interface and interaction handling.

**Note:** Verbal interaction features (Speech-to-Text and Text-to-Speech) rely on the Web Speech API. Performance and voice availability may vary depending on your browser and operating system. Ensure your browser has microphone permissions enabled for voice input.
