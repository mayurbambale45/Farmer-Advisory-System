"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Cloud, CloudFog, CloudRain, CloudSun, Sun } from "lucide-react";

const weatherData = {
  current: {
    location: "Green Valley, CA",
    temp: 22,
    condition: "Partly Cloudy",
    icon: CloudSun,
  },
  forecast: [
    { day: "Mon", temp: 24, icon: Sun },
    { day: "Tue", temp: 21, icon: CloudSun },
    { day: "Wed", temp: 19, icon: CloudRain },
    { day: "Thu", temp: 20, icon: Cloud },
    { day: "Fri", temp: 18, icon: CloudFog },
  ],
};

export function WeatherForecast() {
  const CurrentIcon = weatherData.current.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CurrentIcon className="w-6 h-6 text-accent" />
          Weather Forecast
        </CardTitle>
        <CardDescription>{weatherData.current.location}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <CurrentIcon className="w-16 h-16 text-accent" />
          <div>
            <div className="text-5xl font-bold">
              {weatherData.current.temp}°C
            </div>
            <div className="text-muted-foreground">
              {weatherData.current.condition}
            </div>
          </div>
        </div>
        <div className="flex gap-4 sm:gap-6">
          {weatherData.forecast.map((day) => {
            const DayIcon = day.icon;
            return (
              <div key={day.day} className="flex flex-col items-center gap-1">
                <div className="font-medium">{day.day}</div>
                <DayIcon className="w-8 h-8 text-muted-foreground" />
                <div className="font-bold">{day.temp}°</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
