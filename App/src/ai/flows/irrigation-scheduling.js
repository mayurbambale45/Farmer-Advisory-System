// Irrigation Scheduling AI agent.
//
// - irrigationSchedule - A function that suggests optimal irrigation schedules based on weather forecasts and crop water needs.
// - IrrigationScheduleInput - The input type for the irrigationSchedule function.
// - IrrigationScheduleOutput - The return type for the irrigationSchedule function.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IrrigationScheduleInputSchema = z.object({
  cropType: z.string().describe('The type of crop being grown.'),
  soilType: z.string().describe('The type of soil in the field.'),
  weatherForecast: z.string().describe('The weather forecast for the next 7 days.'),
  cropWaterNeeds: z.string().describe('The water needs of the crop.'),
  fieldSize: z.number().describe('The size of the field in acres.'),
  irrigationMethod: z.string().describe('The irrigation method used (e.g., drip, sprinkler).'),
});


const IrrigationScheduleOutputSchema = z.object({
  schedule: z.string().describe('The suggested irrigation schedule.'),
  waterAmount: z.string().describe('The suggested amount of water to use per irrigation.'),
  frequency: z.string().describe('The suggested frequency of irrigation.'),
  notes: z.string().describe('Any additional notes or recommendations.'),
});


export async function irrigationSchedule(input) {
  return irrigationScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'irrigationSchedulePrompt',
  input: {schema: IrrigationScheduleInputSchema},
  output: {schema: IrrigationScheduleOutputSchema},
  prompt: `You are an expert agricultural advisor specializing in irrigation scheduling.

Based on the following information, suggest an optimal irrigation schedule for the farmer.

Crop Type: {{{cropType}}}
Soil Type: {{{soilType}}}
Weather Forecast: {{{weatherForecast}}}
Crop Water Needs: {{{cropWaterNeeds}}}
Field Size: {{{fieldSize}}} acres
Irrigation Method: {{{irrigationMethod}}}

Consider the weather forecast, crop water needs, and soil type to determine the best schedule.
Provide a schedule, the amount of water to use per irrigation, the frequency of irrigation, and any additional notes or recommendations.

Schedule: 
Water Amount: 
Frequency: 
Notes: `,
});

const irrigationScheduleFlow = ai.defineFlow(
  {
    name: 'irrigationScheduleFlow',
    inputSchema: IrrigationScheduleInputSchema,
    outputSchema: IrrigationScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output;
  }
);
