// src/ai/flows/provide-sandbox-suggestions.ts
'use server';

/**
 * @fileOverview Provides suggestions for the sandbox mode in the language learning app.
 *
 * This file defines a Genkit flow that offers conversation prompts to users in the sandbox scenario
 * when they might be unsure how to continue the conversation.
 *
 * @module src/ai/flows/provide-sandbox-suggestions
 *
 * @interface ProvideSandboxSuggestionsInput - Defines the input for the sandbox suggestions flow.
 * @interface ProvideSandboxSuggestionsOutput - Defines the output for the sandbox suggestions flow, containing a suggested prompt.
 * @function provideSandboxSuggestions - The main function to invoke the sandbox suggestions flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * @interface ProvideSandboxSuggestionsInput
 * @property {string} language - The language the user is practicing.
 * @property {string} conversationHistory - The current conversation history.
 */
const ProvideSandboxSuggestionsInputSchema = z.object({
  language: z.string().describe('The language the user is practicing.'),
  conversationHistory: z.string().describe('The current conversation history.'),
});
export type ProvideSandboxSuggestionsInput = z.infer<
  typeof ProvideSandboxSuggestionsInputSchema
>;

/**
 * @interface ProvideSandboxSuggestionsOutput
 * @property {string} suggestion - A suggested prompt for the user to continue the conversation.
 */
const ProvideSandboxSuggestionsOutputSchema = z.object({
  suggestion: z.string().describe('A suggested prompt for the user.'),
});
export type ProvideSandboxSuggestionsOutput = z.infer<
  typeof ProvideSandboxSuggestionsOutputSchema
>;

/**
 * Provides a suggestion for the user to continue the conversation in sandbox mode.
 * @param {ProvideSandboxSuggestionsInput} input - The input containing the language and conversation history.
 * @returns {Promise<ProvideSandboxSuggestionsOutput>} - A promise resolving to an object containing a suggestion.
 */
export async function provideSandboxSuggestions(
  input: ProvideSandboxSuggestionsInput
): Promise<ProvideSandboxSuggestionsOutput> {
  return provideSandboxSuggestionsFlow(input);
}

const provideSandboxSuggestionsPrompt = ai.definePrompt({
  name: 'provideSandboxSuggestionsPrompt',
  input: {schema: ProvideSandboxSuggestionsInputSchema},
  output: {schema: ProvideSandboxSuggestionsOutputSchema},
  prompt: `You are an AI language learning assistant helping a user practice speaking in {{language}}.
The user is in sandbox mode and the conversation history is as follows:

{{conversationHistory}}

Provide a single, short, and creative suggestion for the user to continue the conversation. Focus on realistic conversational prompts.  The prompt should be appropriate for the language that is being spoken.

Suggestion:`, // Keep the output brief and to the point
});

const provideSandboxSuggestionsFlow = ai.defineFlow(
  {
    name: 'provideSandboxSuggestionsFlow',
    inputSchema: ProvideSandboxSuggestionsInputSchema,
    outputSchema: ProvideSandboxSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await provideSandboxSuggestionsPrompt(input);
    return output!;
  }
);
