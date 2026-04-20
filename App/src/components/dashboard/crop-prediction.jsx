"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sprout, Loader2, Wand2, BarChart3, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FALLBACK_DISTRICTS = ["Pune", "Nashik", "Nagpur", "Satara", "Sangli", "Kolhapur", "Solapur", "Ahmednagar", "Jalgaon", "Dhule"];
const FALLBACK_SOILS = ["Black", "Red", "Alluvial", "Laterite", "Yellow", "Brown", "Light Blue"];

const formSchema = z.object({
  district: z.string().min(1, "District is required"),
  N: z.coerce.number(),
  P: z.coerce.number(),
  K: z.coerce.number(),
  pH: z.coerce.number(),
  rainfall: z.coerce.number(),
  temperature: z.coerce.number(),
  soil_color: z.string().min(1, "Soil type is required"),
});

const API_URL = "http://127.0.0.1:5001";

export function CropRecommendation() {
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);
  const [results, setResults] = useState([]);
  const [options, setOptions] = useState({ districts: [], soils: [] });
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { district: "", N: 0, P: 0, K: 0, pH: 0, rainfall: 0, temperature: 0, soil_color: "" },
  });

  const selectedDistrict = form.watch("district");

  useEffect(() => {
    axios.get(`${API_URL}/get_form_options`)
      .then(res => setOptions(res.data))
      .catch(() => {
        setOptions({ districts: FALLBACK_DISTRICTS, soils: FALLBACK_SOILS });
        toast({
          title: "Backend Unavailable",
          description: "Cannot connect to Crop API. Using fallback offline options.",
          variant: "destructive",
        });
      });
  }, []);

  useEffect(() => {
    if (!selectedDistrict) return;
    const fetchData = async () => {
      setIsFetching(true);
      try {
        const res = await axios.post(`${API_URL}/get_environmental_data`, { district: selectedDistrict });
        const d = res.data;
        form.setValue("N", d.N);
        form.setValue("P", d.P);
        form.setValue("K", d.K);
        form.setValue("pH", d.pH);
        form.setValue("temperature", d.temperature);
        form.setValue("rainfall", d.rainfall);
        form.setValue("soil_color", d.soil_color);
      } catch (e) { console.error("Failed to fetch env data:", e); }
      finally { setIsFetching(false); }
    };
    fetchData();
  }, [selectedDistrict]);

  function onSubmit(values) {
    startTransition(async () => {
      setResults([]);
      try {
        const res = await axios.post(`${API_URL}/predict`, values);
        if (res.data.recommendations) {
          setResults(res.data.recommendations);
        } else {
          toast({
            title: "Prediction Failed",
            description: "No recommendations returned. Check the backend.",
            variant: "destructive"
          });
        }
      } catch (e) {
        toast({
          title: "Prediction Failed",
          description: "Ensure port 5001 is running. Unable to fetch prediction.",
          variant: "destructive"
        });
      }
    });
  }

  return (
    <Card className="w-full shadow-sm border">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader className="border-b bg-emerald-50/50 dark:bg-emerald-950/10 py-4 px-5">
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-400">
              <div className="bg-emerald-100 dark:bg-emerald-900/50 p-1 rounded">
                <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              Smart Crop Recommendation
            </CardTitle>
            <CardDescription className="text-xs">
              Select a district — soil and weather data will auto-fill. Get Top 5 crop matches.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-4 px-5">
            {/* Row 1: District + Soil */}
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="district" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">District</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {options.districts.map(d => (
                        <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              <FormField control={form.control} name="soil_color" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">Soil Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select soil" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {options.soils.map(s => (
                        <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />
            </div>

            {/* Auto-fill indicator */}
            {isFetching && (
              <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 p-2 rounded-md">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading environmental profile for {selectedDistrict}...
              </div>
            )}

            {/* Row 2: Env data */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { name: "temperature", label: "Temp (°C)", step: "1" },
                { name: "rainfall",    label: "Rainfall (mm)", step: "1" },
                { name: "pH",          label: "pH Level", step: "0.1" },
                { name: "N",           label: "Nitrogen (N)", step: "1" },
              ].map(({ name, label, step }) => (
                <FormField key={name} control={form.control} name={name} render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">{label}</FormLabel>
                    <FormControl>
                      <Input type="number" step={step} {...field} className="h-8 text-xs" />
                    </FormControl>
                  </FormItem>
                )} />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="P" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">Phosphorus (P)</FormLabel>
                  <FormControl><Input type="number" {...field} className="h-8 text-xs" /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="K" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">Potassium (K)</FormLabel>
                  <FormControl><Input type="number" {...field} className="h-8 text-xs" /></FormControl>
                </FormItem>
              )} />
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-4 pt-0 px-5 pb-5">
            <Button
              type="submit"
              disabled={isPending || isFetching}
              className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isPending ? (
                <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Analyzing...</>
              ) : (
                <><Wand2 className="mr-1.5 h-3.5 w-3.5" /> Analyze Suitability</>
              )}
            </Button>

            {results.length > 0 && (
              <div className="w-full space-y-3 pt-3 border-t">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-700" />
                  <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-400 uppercase tracking-wide">Top Crop Matches</h3>
                </div>
                <div className="space-y-2">
                  {results.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          {index === 0 && <Trophy className="w-3 h-3 text-amber-500" />}
                          <span className={`text-xs font-medium ${index === 0 ? "text-emerald-700 font-bold" : "text-foreground"}`}>
                            {index + 1}. {item.crop}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.probability}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            index === 0 ? "bg-emerald-600" : index === 1 ? "bg-emerald-500" : "bg-emerald-300"
                          }`}
                          style={{ width: `${item.probability}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}