"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { irrigationSchedule } from "@/ai/flows/irrigation-scheduling";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplets, Loader2, Sparkles, Wand2 } from "lucide-react";


const formSchema = z.object({
  cropType: z.string().min(2, "Crop type is required."),
  soilType: z.string().min(2, "Soil type is required."),
  weatherForecast: z.string().min(10, "Weather forecast is required."),
  cropWaterNeeds: z.string().min(5, "Crop water needs are required."),
  fieldSize: z.coerce.number().min(0.1, "Field size must be positive."),
  irrigationMethod: z.string().min(2, "Irrigation method is required."),
});

export function IrrigationAdvisory() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isSheetOpen, setSheetOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cropType: "Corn",
      soilType: "Clay Loam",
      weatherForecast: "Sunny for the next 5 days, temps around 28°C.",
      cropWaterNeeds: "High during tasseling stage.",
      fieldSize: 10,
      irrigationMethod: "Drip",
    },
  });

  function onSubmit(values) {
    startTransition(async () => {
      setError(null);
      setResult(null);
      try {
        const schedule = await irrigationSchedule(values);
        setResult(schedule);
        setSheetOpen(false);
      } catch (e) {
        setError("Failed to get schedule. Please try again.");
        console.error(e);
      }
    });
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="w-6 h-6 text-primary" />
          Irrigation Advisory
        </CardTitle>
        <CardDescription>Optimize water usage with an AI-generated irrigation schedule.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        {result ? (
           <div className="space-y-4 rounded-lg border bg-secondary/50 p-4 text-sm">
            <h3 className="font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent"/>Generated Schedule</h3>
            <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Schedule:</span>
                <span className="font-medium">{result.schedule}</span>
                <span className="text-muted-foreground">Water Amount:</span>
                <span className="font-medium">{result.waterAmount}</span>
                <span className="text-muted-foreground">Frequency:</span>
                <span className="font-medium">{result.frequency}</span>
            </div>
             <p className="text-muted-foreground pt-2 border-t"><span className="font-medium text-foreground">Notes:</span> {result.notes}</p>
          </div>
        ) : (
            <div className="text-center text-muted-foreground p-4">
                <p>Click below to generate a new irrigation schedule.</p>
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button className="w-full">
              <Wand2 className="mr-2 h-4 w-4" />
              {result ? "Generate New Schedule" : "Generate Schedule"}
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>Generate Irrigation Schedule</SheetTitle>
              <SheetDescription>
                Provide details about your field to get a customized schedule.
              </SheetDescription>
            </SheetHeader>
            <div className="py-4 max-h-[80vh] overflow-y-auto pr-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="cropType" render={({ field }) => ( <FormItem><FormLabel>Crop Type</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="soilType" render={({ field }) => ( <FormItem><FormLabel>Soil Type</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="weatherForecast" render={({ field }) => ( <FormItem><FormLabel>Weather Forecast</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="cropWaterNeeds" render={({ field }) => ( <FormItem><FormLabel>Crop Water Needs</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="fieldSize" render={({ field }) => ( <FormItem><FormLabel>Field Size (acres)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="irrigationMethod" render={({ field }) => ( <FormItem><FormLabel>Irrigation Method</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="Drip">Drip</SelectItem><SelectItem value="Sprinkler">Sprinkler</SelectItem><SelectItem value="Flood">Flood</SelectItem></SelectContent>
                        </Select><FormMessage /></FormItem> )} />
                    <SheetFooter className="mt-6">
                        <Button type="submit" disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Generate
                        </Button>
                    </SheetFooter>
                    {error && <p className="text-sm text-destructive mt-2 text-center">{error}</p>}
                </form>
              </Form>
            </div>
          </SheetContent>
        </Sheet>
      </CardFooter>
    </Card>
  );
}
