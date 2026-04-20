"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLanguage } from "@/components/language-provider"; 

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplets, Loader2, Sparkles, Wand2, RefreshCw, Clock, Gauge } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  cropType:         z.string().min(2, "Required"),
  soilType:         z.string().min(2, "Required"),
  fieldSize:        z.coerce.number().min(0.1, "Required"),
  irrigationMethod: z.string().min(2, "Required"),
});

// The irrigation plan is served from the dedicated Irrigation backend on port 5006
const API_URL = "http://127.0.0.1:5006/irrigation-plan";

export function IrrigationAdvisory() {
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState(null);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { cropType: "", soilType: "Loam", fieldSize: 1, irrigationMethod: "Drip" },
  });

  function onSubmit(values) {
    startTransition(async () => {
      setResult(null);
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!response.ok) throw new Error(`Server error (${response.status})`);
        const data = await response.json();
        setResult(data);
        setSheetOpen(false);
      } catch (e) {
        toast({
          title: "Calculation Failed",
          description: `Connection failed: ${e.message}. Is the backend on port 5006 running?`,
          variant: "destructive"
        });
      }
    });
  }

  return (
    <Card className="flex flex-col border shadow-sm">
      <CardHeader className="border-b bg-blue-50/50 dark:bg-blue-950/10 py-4 px-5">
        <CardTitle className="flex items-center gap-2 text-sm font-bold text-blue-800 dark:text-blue-400">
          <div className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded">
            <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          {t("card_irri_title")}
        </CardTitle>
        <CardDescription className="text-xs">{t("card_irri_desc")}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow pt-4 px-5 pb-4">
        {result ? (
          <div className="space-y-3 animate-in fade-in-0 duration-300">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 border rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t("res_freq")}</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{result.frequency ?? "—"}</p>
              </div>
              <div className="bg-muted/50 border rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Gauge className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t("res_vol")}</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{result.waterAmount ?? "—"}</p>
              </div>
            </div>

            {/* AI Notes */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">{t("res_insight")}</span>
              </div>
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">{result.notes ?? "—"}</p>
            </div>
            
            <p className="text-[10px] text-center text-muted-foreground">{t("res_schedule_note")}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-5 text-center space-y-2.5">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
              <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-foreground">{t("res_empty")}</p>
              <p className="text-[11px] text-muted-foreground max-w-[180px] mx-auto">{t("res_empty_desc")}</p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 px-5 pb-4">
        <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white">
              {result ? (
                <><RefreshCw className="mr-1.5 h-3.5 w-3.5" /> {t("btn_recalc")}</>
              ) : (
                <><Wand2 className="mr-1.5 h-3.5 w-3.5" /> {t("btn_generate")}</>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="text-sm flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-600" />
                {t("card_irri_title")}
              </SheetTitle>
              <SheetDescription className="text-xs">{t("card_irri_desc")}</SheetDescription>
            </SheetHeader>
            <div className="py-5">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="cropType" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">{t("label_crop")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("ph_crop")} {...field} className="h-8 text-xs" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="fieldSize" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">{t("label_size")}</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} className="h-8 text-xs" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="soilType" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">{t("label_soil")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Clay" className="text-xs">{t("soil_clay")}</SelectItem>
                          <SelectItem value="Loam" className="text-xs">{t("soil_loam")}</SelectItem>
                          <SelectItem value="Sandy" className="text-xs">{t("soil_sandy")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="irrigationMethod" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">{t("label_method")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Drip" className="text-xs">{t("method_drip")}</SelectItem>
                          <SelectItem value="Sprinkler" className="text-xs">{t("method_sprinkler")}</SelectItem>
                          <SelectItem value="Flood" className="text-xs">{t("method_flood")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  <Button type="submit" disabled={isPending} className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700">
                    {isPending ? (
                      <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> {t("btn_analyzing")}</>
                    ) : t("btn_calc")}
                  </Button>
                </form>
              </Form>
            </div>
          </SheetContent>
        </Sheet>
      </CardFooter>
    </Card>
  );
}