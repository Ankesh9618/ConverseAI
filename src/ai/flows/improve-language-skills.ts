'use server';

/**
 * @fileOverview An AI agent that provides feedback on language skills after a conversation.
 *
 * - improveLanguageSkills - A function that initiates the language skills improvement process.
 * - ImproveLanguageSkillsInput - The input type for the improveLanguageSkills function.
 * - ImproveLanguageSkillsOutput - The return type for the improveLanguageSkills function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveLanguageSkillsInputSchema = z.object({
  language: z.string().describe('The language the user is practicing.'),
  scenario: z.string().describe('The scenario the user is practicing in.'),
  conversationHistory: z.array(z.object({
    speaker: z.enum(['user', 'agent']),
    text: z.string(),
  })).describe('The conversation history between the user and the agent.'),
});
export type ImproveLanguageSkillsInput = z.infer<typeof ImproveLanguageSkillsInputSchema>;

const ImproveLanguageSkillsOutputSchema = z.object({
  feedback: z.object({
    grammar: z.string().describe('Feedback on the user\'s grammar.'),
    pronunciation: z.string().describe('Feedback on the user\'s pronunciation.'),
    vocabulary: z.string().describe('Feedback on the user\'s vocabulary.'),
    overall: z.string().describe('Overall feedback on the user\'s language skills.'),
  }).describe('Feedback on the user\'s language skills.'),
});
export type ImproveLanguageSkillsOutput = z.infer<typeof ImproveLanguageSkillsOutputSchema>;

export async function improveLanguageSkills(input: ImproveLanguageSkillsInput): Promise<ImproveLanguageSkillsOutput> {
  return improveLanguageSkillsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveLanguageSkillsPrompt',
  input: {schema: ImproveLanguageSkillsInputSchema},
  output: {schema: ImproveLanguageSkillsOutputSchema},
  prompt: `You are an AI language tutor providing feedback to a user practicing their {{language}} skills in a {{scenario}} scenario.

  Based on the following conversation history, provide feedback on the user's grammar, pronunciation, and vocabulary. Also, provide overall feedback and encouragement.

  Conversation History:
  {{#each conversationHistory}}
  {{speaker}}: {{text}}
  {{/each}}
  `,
});

const improveLanguageSkillsFlow = ai.defineFlow(
  {
    name: 'improveLanguageSkillsFlow',
    inputSchema: ImproveLanguageSkillsInputSchema,
    outputSchema: ImproveLanguageSkillsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
