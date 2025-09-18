import { DashboardHeader } from "@/components/dashboard/header";
import { WeatherForecast } from "@/components/dashboard/weather-forecast";
import { CropPrediction } from "@/components/dashboard/crop-prediction";
import { FertilizerAdvisory } from "@/components/dashboard/fertilizer-advisory";
import { IrrigationAdvisory } from "@/components/dashboard/irrigation-advisory";
import { AiAdvisor } from "@/components/dashboard/ai-advisor";
import { AlertSystem } from "@/components/dashboard/alert-system";
import { FarmerCommunity } from "@/components/dashboard/farmer-community";
import { ExpertTalk } from "@/components/dashboard/expert-talk";

export default function Home() {
  return (
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <WeatherForecast />
          </div>
          <div className="lg:col-span-1">
            <CropPrediction />
          </div>
          <div className="lg:col-span-1">
            <FertilizerAdvisory />
          </div>
          <div className="lg:col-span-1">
            <IrrigationAdvisory />
          </div>
          <div className="lg:col-span-2">
            <AiAdvisor />
          </div>
          <div className="lg:col-span-1">
            <AlertSystem />
          </div>
           <div className="lg:col-span-3">
             <ExpertTalk />
          </div>
          <div className="lg:col-span-3">
            <FarmerCommunity />
          </div>
        </div>
      </main>
    </>
  );
}
