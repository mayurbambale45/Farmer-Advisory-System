// src/ai/flows/ai-powered-advisory.js
'use server';

/**
 * @fileOverview An AI-powered advisor for farmers that integrates various data sources to provide tailored advice.
 *
 * - aiPoweredAdvisory - A function that orchestrates the advisory process.
 * - AiPoweredAdvisoryInput - The input type for the aiPoweredAdvisory function.
 * - AiPoweredAdvisoryOutput - The return type for the aiPoweredAdvisory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define schemas for input and output
const AiPoweredAdvisoryInputSchema = z.object({
  location: z.string().describe('The geographic location of the farm.'),
  cropType: z.string().describe('The type of crop being cultivated.'),
  soilData: z.string().describe('Data about the soil composition and health.'),
  weatherForecast: z.string().describe('The local weather forecast.'),
  historicalPerformance: z
    .string()
    .describe(
      'Historical data on crop yields and farming practices at the location.'
    ),
  specificQuery: z
    .string()
    .optional()
    .describe(
      'Any specific question or concern the farmer has, leave empty if none.'
    ),
});


const AiPoweredAdvisoryOutputSchema = z.object({
  advice: z.string().describe('Tailored advice and insights for the farmer.'),
});


// Define the main function that will be called
export async function aiPoweredAdvisory(
  input
) {
  return aiPoweredAdvisoryFlow(input);
}

// Define the prompt
const advisoryPrompt = ai.definePrompt({
  name: 'advisoryPrompt',
  input: {schema: AiPoweredAdvisoryInputSchema},
  output: {schema: AiPoweredAdvisoryOutputSchema},
  prompt: `You are an AI-powered agricultural advisor. You will ingest multiple data sources and tailor your response to the farmer.

Location: {{{location}}}
Crop Type: {{{cropType}}}
Soil Data: {{{soilData}}}
Weather Forecast: {{{weatherForecast}}}
Historical Performance: {{{historicalPerformance}}}


Using all the data available to you, provide tailored advice and insights for the farmer. Be concise and actionable.

{{#if specificQuery}}
The farmer has the following specific question: {{{specificQuery}}}
{{/if}}
`,
});

// Define the flow
const aiPoweredAdvisoryFlow = ai.defineFlow(
  {
    name: 'aiPoweredAdvisoryFlow',
    inputSchema: AiPoweredAdvisoryInputSchema,
    outputSchema: AiPoweredAdvisoryOutputSchema,
  },
  async input => {
    const {output} = await advisoryPrompt(input);
    return output;
  }
);
