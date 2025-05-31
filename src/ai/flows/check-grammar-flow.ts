
'use server';
/**
 * @fileOverview Checks the grammar of a given text in a specified language.
 *
 * - checkGrammar - A function that handles grammar checking.
 * - CheckGrammarInput - The input type for the checkGrammar function.
 * - CheckGrammarOutput - The return type for the checkGrammar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckGrammarInputSchema = z.object({
  textToCheck: z.string().describe('The text whose grammar needs to be checked.'),
  language: z.string().describe('The language of the textToCheck (e.g., "Spanish", "French").'),
});
export type CheckGrammarInput = z.infer<typeof CheckGrammarInputSchema>;

const CheckGrammarOutputSchema = z.object({
  feedback: z.string().describe('Constructive feedback on the grammar, pointing out errors and suggesting improvements.'),
  // correctedText: z.string().optional().describe('The suggested corrected version of the text, if applicable.'),
});
export type CheckGrammarOutput = z.infer<typeof CheckGrammarOutputSchema>;

export async function checkGrammar(input: CheckGrammarInput): Promise<CheckGrammarOutput> {
  return checkGrammarFlow(input);
}

const prompt = ai.definePrompt({
  name: 'checkGrammarPrompt',
  input: {schema: CheckGrammarInputSchema},
  output: {schema: CheckGrammarOutputSchema},
  prompt: `You are an expert language tutor. The user is learning {{language}}.
Review the following text for grammatical accuracy, spelling, and proper vocabulary usage.
Provide constructive feedback. Identify specific errors and explain them clearly. Offer suggestions for improvement.
If there are no errors, provide encouragement.

Text to check:
"{{textToCheck}}"

Ensure your feedback is helpful and educational. Return only the feedback.`,
});

const checkGrammarFlow = ai.defineFlow(
  {
    name: 'checkGrammarFlow',
    inputSchema: CheckGrammarInputSchema,
    outputSchema: CheckGrammarOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
