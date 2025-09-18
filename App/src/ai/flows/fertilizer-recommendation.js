// src/ai/flows/fertilizer-recommendation.js
'use server';

/**
 * @fileOverview Provides fertilizer recommendations tailored to the user's specific crop and soil data.
 *
 * - fertilizerRecommendation - A function that takes crop and soil data and returns fertilizer recommendations.
 * - FertilizerRecommendationInput - The input type for the fertilizerRecommendation function.
 * - FertilizerRecommendationOutput - The return type for the fertilizerRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FertilizerRecommendationInputSchema = z.object({
  cropType: z.string().describe('The type of crop being grown.'),
  soilData: z.string().describe('Data about the soil composition and condition.'),
  region: z.string().describe('The region where the farming is taking place'),
});



const FertilizerRecommendationOutputSchema = z.object({
  recommendations: z.string().describe('Fertilizer recommendations tailored to the crop and soil data.'),
});



export async function fertilizerRecommendation(
  input
) {
  return fertilizerRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fertilizerRecommendationPrompt',
  input: {schema: FertilizerRecommendationInputSchema},
  output: {schema: FertilizerRecommendationOutputSchema},
  prompt: `You are an expert in agriculture, providing fertilizer recommendations based on crop type, soil data, and region.

  Provide tailored recommendations to optimize crop yields and minimize fertilizer waste.

  Crop Type: {{{cropType}}}
  Soil Data: {{{soilData}}}
  Region: {{{region}}}

  Provide clear and actionable recommendations.
  `,
});

const fertilizerRecommendationFlow = ai.defineFlow(
  {
    name: 'fertilizerRecommendationFlow',
    inputSchema: FertilizerRecommendationInputSchema,
    outputSchema: FertilizerRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output;
  }
);
