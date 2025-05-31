'use server';

/**
 * @fileOverview Generates realistic responses from the AI agent based on the selected language and scenario.
 *
 * - generateAgentResponse - A function that generates the AI agent's response.
 * - GenerateAgentResponseInput - The input type for the generateAgentResponse function.
 * - GenerateAgentResponseOutput - The return type for the generateAgentResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAgentResponseInputSchema = z.object({
  language: z
    .string()
    .describe('The language in which the conversation should take place.'),
  scenario: z.string().describe('The scenario for the conversation.'),
  userInput: z.string().describe('The user input to which the agent should respond.'),
  conversationHistory: z
    .string()
    .optional()
    .describe('The history of the conversation so far.'),
});
export type GenerateAgentResponseInput = z.infer<typeof GenerateAgentResponseInputSchema>;

const GenerateAgentResponseOutputSchema = z.object({
  agentResponse: z.string().describe('The AI agent response.'),
});
export type GenerateAgentResponseOutput = z.infer<typeof GenerateAgentResponseOutputSchema>;

export async function generateAgentResponse(input: GenerateAgentResponseInput): Promise<GenerateAgentResponseOutput> {
  return generateAgentResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAgentResponsePrompt',
  input: {schema: GenerateAgentResponseInputSchema},
  output: {schema: GenerateAgentResponseOutputSchema},
  prompt: `You are a helpful AI agent assisting users in practicing conversations in a foreign language. The user has selected the following language: {{{language}}}. The scenario is: {{{scenario}}}.  Here is the conversation history: {{{conversationHistory}}}. User input: {{{userInput}}}. Generate a realistic and appropriate response in the specified language and scenario.  Ensure the response is natural and fits the context of the conversation.`, // Ensure response is natural
});

const generateAgentResponseFlow = ai.defineFlow(
  {
    name: 'generateAgentResponseFlow',
    inputSchema: GenerateAgentResponseInputSchema,
    outputSchema: GenerateAgentResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
