"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlaskConical, Loader2, Wand2, BarChart3, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FALLBACK_DISTRICTS = ["Pune", "Nashik", "Nagpur", "Satara", "Sangli", "Kolhapur", "Solapur", "Ahmednagar", "Jalgaon", "Dhule"];
const FALLBACK_CROPS = ["Wheat", "Rice", "Maize", "Sugarcane", "Cotton", "Soybean"];

const API_BASE_URL = "http://127.0.0.1:5002";

const formSchema = z.object({
  cropType:    z.string().min(1, "Crop type is required."),
  district:    z.string().min(1, "District is required."),
  nitrogen:    z.coerce.number(),
  phosphorus:  z.coerce.number(),
  potassium:   z.coerce.number(),
  ph:          z.coerce.number(),
  rainfall:    z.coerce.number(),
  temperature: z.coerce.number(),
  soil_color:  z.string(),
});

export function FertilizerAdvisory() {
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);
  const [results, setResults] = useState([]);
  const [formOptions, setFormOptions] = useState({ districts: [], crops: [] });
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cropType: "", district: "",
      nitrogen: 0, phosphorus: 0, potassium: 0,
      ph: 0, rainfall: 0, temperature: 0,
      soil_color: ""
    },
  });

  const selectedDistrict = form.watch("district");

  // Fetch dropdown options
  useEffect(() => {
    axios.get(`${API_BASE_URL}/get_form_options`)
      .then(res => setFormOptions(res.data))
      .catch(() => {
        setFormOptions({ districts: FALLBACK_DISTRICTS, crops: FALLBACK_CROPS });
        toast({
          title: "Backend Unavailable",
          description: "Cannot connect to Fertilizer API. Using fallback offline options.",
          variant: "destructive",
        });
      });
  }, []);

  // Auto-fill env data when district changes
  useEffect(() => {
    if (!selectedDistrict) return;
    const fetchAndSetData = async () => {
      setIsFetching(true);
      setResults([]);
      try {
        const res = await axios.post(`${API_BASE_URL}/get_environmental_data`, { district: selectedDistrict });
        const d = res.data;
        form.setValue("nitrogen", d.N);
        form.setValue("phosphorus", d.P);
        form.setValue("potassium", d.K);
        form.setValue("ph", d.pH);
        form.setValue("temperature", d.temperature);
        form.setValue("rainfall", d.rainfall);
        form.setValue("soil_color", d.soil_color);
      } catch (e) {
        console.error("Env Data Error:", e);
      } finally {
        setIsFetching(false);
      }
    };
    fetchAndSetData();
  }, [selectedDistrict]);

  function onSubmit(values) {
    startTransition(async () => {
      setResults([]);
      try {
        const finalPayload = { ...values, crop: values.cropType };
        const response = await axios.post(`${API_BASE_URL}/predict`, finalPayload);
        if (response.data.recommendations) {
          setResults(response.data.recommendations);
        } else {
          toast({
            title: "Prediction Failed",
            description: "No valid recommendations received from the model.",
            variant: "destructive"
          });
        }
      } catch (e) {
        console.error("Prediction Error:", e);
        toast({
          title: "Prediction Failed",
          description: "Prediction failed. Ensure port 5002 is running.",
          variant: "destructive"
        });
      }
    });
  }

  return (
    <Card className="w-full shadow-sm border">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader className="border-b bg-green-50/50 dark:bg-green-950/10 py-4 px-5">
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-green-800 dark:text-green-400">
              <div className="bg-green-100 dark:bg-green-900/50 p-1 rounded">
                <FlaskConical className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              Fertilizer Advisory System
            </CardTitle>
            <CardDescription className="text-xs">
              Select district to auto-load soil data, pick a crop, and get Top 5 fertilizer matches.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-4 px-5">
            {/* Row 1: District + Crop */}
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
                      {formOptions.districts.map(d => (
                        <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />

              <FormField control={form.control} name="cropType" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">Crop Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select crop" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {formOptions.crops.map(c => (
                        <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
            </div>

            {/* Auto-fill indicator */}
            {isFetching && (
              <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 dark:bg-green-950/20 border border-green-100 p-2 rounded-md">
                <Loader2 className="w-3 h-3 animate-spin" />
                Fetching environmental data for {selectedDistrict}...
              </div>
            )}

            {/* Env data row */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { name: "temperature", label: "Temp (°C)" },
                { name: "rainfall",    label: "Rainfall (mm)" },
                { name: "ph",          label: "pH Level" },
                { name: "soil_color",  label: "Soil Type", readOnly: true },
              ].map(({ name, label, readOnly }) => (
                <FormField key={name} control={form.control} name={name} render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">{label}</FormLabel>
                    <FormControl>
                      <Input
                        type={readOnly ? "text" : "number"}
                        {...field}
                        readOnly={readOnly}
                        className={`h-8 text-xs ${readOnly ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}`}
                      />
                    </FormControl>
                  </FormItem>
                )} />
              ))}
            </div>

            {/* Nutrients row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: "nitrogen",   label: "Nitrogen (N)" },
                { name: "phosphorus", label: "Phosphorus (P)" },
                { name: "potassium",  label: "Potassium (K)" },
              ].map(({ name, label }) => (
                <FormField key={name} control={form.control} name={name} render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">{label}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="h-8 text-xs" />
                    </FormControl>
                  </FormItem>
                )} />
              ))}
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-4 pt-0 px-5 pb-5">
            <Button
              type="submit"
              disabled={isPending || isFetching}
              className="w-full h-8 text-xs bg-green-700 hover:bg-green-800 text-white"
            >
              {(isPending || isFetching) ? (
                <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Analyzing...</>
              ) : (
                <><Wand2 className="mr-1.5 h-3.5 w-3.5" /> Analyze & Recommend</>
              )}
            </Button>

            {results.length > 0 && (
              <div className="w-full space-y-3 pt-3 border-t">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5 text-green-700" />
                  <h3 className="text-xs font-bold text-green-900 dark:text-green-400 uppercase tracking-wide">Top Fertilizer Matches</h3>
                </div>
                <div className="space-y-2">
                  {results.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          {index === 0 && <Trophy className="w-3 h-3 text-amber-500" />}
                          <span className={`text-xs font-medium ${index === 0 ? "text-green-700 font-bold" : "text-foreground"}`}>
                            {index + 1}. {item.fertilizer}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.probability}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            index === 0 ? "bg-green-600" :
                            index === 1 ? "bg-green-500" :
                            index === 2 ? "bg-green-400" : "bg-green-300"
                          }`}
                          style={{ width: `${item.probability}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-center text-muted-foreground pt-1">
                  * Based on soil NPK, crop type, and regional climate data.
                </p>
              </div>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}