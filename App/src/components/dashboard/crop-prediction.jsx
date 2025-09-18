"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { predictCrops } from "@/ai/flows/crop-prediction-on-location";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Leaf, Loader2, Sparkles, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  location: z.string().min(2, "Location is required."),
  soilType: z.string().min(2, "Soil type is required."),
  historicalWeatherData: z.string().min(10, "Please provide some historical weather data."),
});

export function CropPrediction() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "Napa Valley, CA",
      soilType: "Loam",
      historicalWeatherData: "Average rainfall 25 inches/year, temperature range 10-30°C.",
    },
  });

  function onSubmit(values) {
    startTransition(async () => {
      setError(null);
      setResult(null);
      try {
        const prediction = await predictCrops(values);
        setResult(prediction);
      } catch (e) {
        setError("Failed to get prediction. Please try again.");
        console.error(e);
      }
    });
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="w-6 h-6 text-primary" />
              Crop Prediction Engine
            </CardTitle>
            <CardDescription>Enter farm details to get suitable crop suggestions from our AI.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Central Valley, CA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="soilType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Soil Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Clay, Sandy, Loam" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="historicalWeatherData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Historical Weather</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe average rainfall, temperature, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Predict Crops
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {result && (
              <div className="space-y-4 rounded-lg border bg-secondary/50 p-4">
                <h3 className="font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent"/>AI Suggestions</h3>
                <div className="space-y-2">
                  <p className="font-medium">Suggested Crops:</p>
                  <div className="flex flex-wrap gap-2">
                    {result.suggestedCrops.map((crop) => (
                      <Badge key={crop} variant="secondary">{crop}</Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Reasoning:</p>
                  <p className="text-sm text-muted-foreground">{result.reasoning}</p>
                </div>
              </div>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
