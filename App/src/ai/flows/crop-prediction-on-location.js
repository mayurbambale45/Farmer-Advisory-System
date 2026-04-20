'use server';
/**
 * @fileOverview Crop prediction flow that suggests suitable crops based on location.
 *
 * - predictCrops - Predicts suitable crops for a given location.
 * - CropPredictionInput - Input type for the predictCrops function.
 * - CropPredictionOutput - Output type for the predictCrops function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CropPredictionInputSchema = z.object({
  location: z
    .string()
    .describe('The geographical location for crop prediction.'),
  soilType: z.string().describe('The type of soil in the specified location.'),
  historicalWeatherData: z
    .string()
    .describe('Historical weather data for the location.'),
});


const CropPredictionOutputSchema = z.object({
  suggestedCrops: z
    .array(z.string())
    .describe(
      'An array of suggested crops suitable for the given location, soil type, and weather data.'
    ),
  reasoning: z
    .string()
    .describe('The reasoning behind the crop suggestions.'),
});


export async function predictCrops(input) {
  return cropPredictionFlow(input);
}

const cropPredictionPrompt = ai.definePrompt({
  name: 'cropPredictionPrompt',
  input: {schema: CropPredictionInputSchema},
  output: {schema: CropPredictionOutputSchema},
  prompt: `You are an agricultural expert. Based on the provided location, soil type, and historical weather data, suggest the most suitable crops to plant.

Location: {{{location}}}
Soil Type: {{{soilType}}}
Historical Weather Data: {{{historicalWeatherData}}}

Consider factors such as climate, soil fertility, and water availability.

Return an array of suggested crops and the reasoning behind the suggestions.

Suggested Crops:
`, // Intentionally kept open for the model to complete.
});

const cropPredictionFlow = ai.defineFlow(
  {
    name: 'cropPredictionFlow',
    inputSchema: CropPredictionInputSchema,
    outputSchema: CropPredictionOutputSchema,
  },
  async input => {
    const {output} = await cropPredictionPrompt(input);
    return output;
  }
);
