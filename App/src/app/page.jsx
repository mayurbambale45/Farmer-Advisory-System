"use client";

import { useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { WeatherForecast } from "@/components/dashboard/weather-forecast"; 
import { CropRecommendation } from "@/components/dashboard/crop-prediction"; 
import { FertilizerAdvisory } from "@/components/dashboard/fertilizer-advisory"; 
import { IrrigationAdvisory } from "@/components/dashboard/irrigation-advisory"; 
import { AlertSystem } from "@/components/dashboard/alert-system"; 
import { AgriBot } from "@/components/dashboard/agri-bot"; 
import { Footer } from "@/components/dashboard/footer"; 
import { Sprout, Radio } from "lucide-react";

export default function Home() {
  const { t } = useLanguage();

  // Shared weather context: WeatherForecast → AgriBot
  const [weatherContext, setWeatherContext] = useState(null);

  return (
    <div className="min-h-screen flex flex-col">
      
      <main className="container mx-auto px-4 py-5 space-y-6 max-w-7xl flex-grow">
        
        {/* WEATHER HERO */}
        <section id="weather" className="scroll-mt-16">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sprout className="w-4 h-4 text-primary" />
              <h2 className="text-base font-bold text-foreground tracking-tight">{t("hero_title")}</h2>
            </div>
            <a
              href="#alerts"
              className="text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Radio className="w-3 h-3 animate-pulse" />
              {t("live_updates")}
            </a>
          </div>
          {/* onWeatherLoaded lifts location+weather data up to page level */}
          <WeatherForecast onWeatherLoaded={setWeatherContext} />
        </section>

        {/* WORKSPACE */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN — Planning Tools */}
          <div id="planning" className="lg:col-span-2 space-y-6 scroll-mt-16">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{t("section_planning")}</h3>
              <div className="h-px bg-border flex-1" />
            </div>
            
            <div className="space-y-6">
              <div>
                <p className="mb-2 text-xs font-semibold text-primary/70 uppercase tracking-wider">{t("card_crop")}</p>
                <CropRecommendation />
              </div>
              
              <div>
                <p className="mb-2 text-xs font-semibold text-primary/70 uppercase tracking-wider">{t("card_fert")}</p>
                <FertilizerAdvisory />
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-primary/70 uppercase tracking-wider">{t("card_irri")}</p>
                <IrrigationAdvisory />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — Expert Assistant */}
          <div id="assistant" className="lg:col-span-1 scroll-mt-16">
            <div className="sticky top-16 space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{t("section_expert")}</h3>
                <div className="h-px bg-border flex-1" />
              </div>
              {/* Pass weatherContext so AgriBot knows the farmer's location */}
              <AgriBot weatherContext={weatherContext} />
              
              <div id="alerts" className="scroll-mt-16">
                <AlertSystem />
              </div>
            </div>
          </div>

        </section>

      </main>
      <Footer />
    </div>
  );
}