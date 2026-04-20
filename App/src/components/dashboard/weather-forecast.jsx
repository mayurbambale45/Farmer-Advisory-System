"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
    Cloud, CloudFog, CloudRain, CloudSun, Sun, Cloudy, Zap, Snowflake, 
    Loader2, Droplets, Wind, MapPin, X, Sunrise, Sunset,
    Activity, Waves, ArrowUp, ArrowDown, AlertTriangle, ShieldCheck
} from "lucide-react";

const API_URL = "http://127.0.0.1:5003";

// Export so AgriBot can consume it
export let globalWeatherContext = null;
export let globalLocationName = "your location";

const getWeatherConfig = (code) => {
  if ([0, 1].includes(code)) return { 
    icon: Sun, label: "Sunny", color: "text-amber-400", 
    bg: "bg-amber-500/10 dark:bg-amber-500/15", border: "border-amber-500/30",
    gradFrom: "from-amber-400", gradTo: "to-orange-600", emoji: "☀️" 
  };
  if ([2].includes(code)) return { 
    icon: CloudSun, label: "P. Cloudy", color: "text-sky-400", 
    bg: "bg-sky-500/10 dark:bg-sky-500/15", border: "border-sky-500/30",
    gradFrom: "from-sky-400", gradTo: "to-indigo-500", emoji: "⛅" 
  };
  if ([3].includes(code)) return { 
    icon: Cloudy, label: "Overcast", color: "text-indigo-300", 
    bg: "bg-indigo-500/10 dark:bg-indigo-500/15", border: "border-indigo-500/30",
    gradFrom: "from-slate-400", gradTo: "to-indigo-600", emoji: "☁️" 
  };
  if ([45, 48].includes(code)) return { 
    icon: CloudFog, label: "Foggy", color: "text-emerald-300", 
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15", border: "border-emerald-500/30",
    gradFrom: "from-emerald-300", gradTo: "to-teal-500", emoji: "🌫️" 
  };
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { 
    icon: CloudRain, label: "Rainy", color: "text-blue-400", 
    bg: "bg-blue-600/10 dark:bg-blue-600/15", border: "border-blue-500/30",
    gradFrom: "from-blue-500", gradTo: "to-indigo-700", emoji: "🌧️" 
  };
  if ([71, 73, 75, 85, 86].includes(code)) return { 
    icon: Snowflake, label: "Snowy", color: "text-cyan-300", 
    bg: "bg-cyan-500/10 dark:bg-cyan-500/15", border: "border-cyan-500/30",
    gradFrom: "from-cyan-400", gradTo: "to-blue-500", emoji: "❄️" 
  };
  if ([95, 96, 99].includes(code)) return { 
    icon: Zap, label: "Stormy", color: "text-purple-400", 
    bg: "bg-purple-600/10 dark:bg-purple-600/15", border: "border-purple-500/30",
    gradFrom: "from-purple-600", gradTo: "to-fuchsia-800", emoji: "⛈️" 
  };
  return { 
    icon: Cloud, label: "Cloudy", color: "text-gray-300", 
    bg: "bg-gray-500/10 dark:bg-gray-500/15", border: "border-gray-500/30",
    gradFrom: "from-gray-400", gradTo: "to-gray-600", emoji: "🌥️" 
  };
};

const getWarning = (tempMax, tempMin, rain) => {
  if (rain >= 100)   return { msg: "Flood Risk", color: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20", dot: "bg-rose-500" };
  if (rain >= 65)    return { msg: "Heavy Rain", color: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20", dot: "bg-rose-500" };
  if (rain >= 35)    return { msg: "Moderate Rain", color: "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20", dot: "bg-orange-500" };
  if (tempMax >= 40) return { msg: "Heatwave", color: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20", dot: "bg-rose-500" };
  if (tempMin <= 8)  return { msg: "Cold Wave", color: "text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20", dot: "bg-sky-500" };
  return { msg: "Normal", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-500" };
};

const formatTime = (isoString) => {
  if (!isoString) return "--";
  try {
    return new Date(isoString).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  } catch { return "--"; }
};

const getUVLabel = (uv) => {
  if (!uv) return { label: "N/A", color: "text-gray-400" };
  if (uv <= 2) return { label: `${uv} Low`, color: "text-green-500" };
  if (uv <= 5) return { label: `${uv} Moderate`, color: "text-yellow-500" };
  if (uv <= 7) return { label: `${uv} High`, color: "text-orange-500" };
  return { label: `${uv} Very High`, color: "text-red-500" };
};

// ─── Day Detail Modal ───────────────────────────────────────────────────────
function DayDetailModal({ day, idx, forecast, locationName, onClose }) {
  if (!day) return null;
  const maxT = Math.round(forecast.temperature_2m_max[idx]);
  const minT = Math.round(forecast.temperature_2m_min[idx]);
  const feelsMax = Math.round(forecast.apparent_temperature_max?.[idx] ?? maxT);
  const feelsMin = Math.round(forecast.apparent_temperature_min?.[idx] ?? minT);
  const rain = forecast.precipitation_sum[idx] ?? 0;
  const rainProb = forecast.precipitation_probability_max?.[idx] ?? "--";
  const windMax = Math.round(forecast.wind_speed_10m_max?.[idx] ?? 0);
  const humidityMax = forecast.relative_humidity_2m_max?.[idx] ?? "--";
  const humidityMin = forecast.relative_humidity_2m_min?.[idx] ?? "--";
  const uv = forecast.uv_index_max?.[idx];
  const sunrise = forecast.sunrise?.[idx];
  const sunset  = forecast.sunset?.[idx];
  const conf = getWeatherConfig(forecast.weather_code[idx]);
  const warn = getWarning(maxT, minT, rain);
  const uvInfo = getUVLabel(uv);
  const Icon = conf.icon;

  const isToday = idx === 0;
  const dateLabel = isToday
    ? "Today"
    : new Date(day).toLocaleDateString("en-IN", { weekday: "long" });
  const dateFull = new Date(day).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with gradient */}
        <div className={`bg-gradient-to-br ${conf.gradFrom} ${conf.gradTo} p-5 text-white`}>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="flex items-center gap-1.5 text-white/75 text-xs mb-3">
            <MapPin className="w-3 h-3" />
            <span>{locationName}</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{dateLabel}</p>
              <p className="text-sm text-white/75">{dateFull}</p>
              <p className="text-base mt-1 font-medium">{conf.emoji} {conf.label}</p>
            </div>
            <Icon className="w-16 h-16 text-white/80" />
          </div>

          {/* Temp bar */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-1">
              <ArrowUp className="w-4 h-4 text-red-200" />
              <span className="text-3xl font-bold">{maxT}°</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="h-2 bg-white/60 rounded-full"
                style={{ width: `${Math.min(100, ((maxT - minT) / 20) * 100)}%` }}
              />
            </div>
            <div className="flex items-center gap-1">
              <ArrowDown className="w-4 h-4 text-blue-200" />
              <span className="text-3xl font-bold">{minT}°</span>
            </div>
          </div>
          <p className="text-xs text-white/60 mt-1">Feels like ↑{feelsMax}° ↓{feelsMin}°</p>
        </div>

        {/* Alert Badge */}
        <div className={`mx-5 -mt-3 mb-1 py-1.5 px-3 rounded-full text-xs font-bold border text-center ${warn.color}`}>
          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${warn.dot}`} />
          {warn.msg}
        </div>

        {/* Details Grid */}
        <div className="p-5 grid grid-cols-2 gap-3">

          {/* Rain */}
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3 flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg">
              <Droplets className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Rainfall</p>
              <p className="text-base font-bold text-foreground">{rain} mm</p>
              <p className="text-[10px] text-muted-foreground">{rainProb}% chance</p>
            </div>
          </div>

          {/* Wind */}
          <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-3 flex items-center gap-3">
            <div className="bg-slate-100 dark:bg-slate-700/40 p-2 rounded-lg">
              <Wind className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Wind</p>
              <p className="text-base font-bold text-foreground">{windMax} km/h</p>
              <p className="text-[10px] text-muted-foreground">Max speed</p>
            </div>
          </div>

          {/* Humidity */}
          <div className="bg-cyan-50 dark:bg-cyan-950/20 rounded-xl p-3 flex items-center gap-3">
            <div className="bg-cyan-100 dark:bg-cyan-900/40 p-2 rounded-lg">
              <Waves className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Humidity</p>
              <p className="text-base font-bold text-foreground">{humidityMax}%</p>
              <p className="text-[10px] text-muted-foreground">Min {humidityMin}%</p>
            </div>
          </div>

          {/* UV Index */}
          <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-xl p-3 flex items-center gap-3">
            <div className="bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded-lg">
              <Sun className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">UV Index</p>
              <p className={`text-base font-bold ${uvInfo.color}`}>{uvInfo.label}</p>
              <p className="text-[10px] text-muted-foreground">Daily max</p>
            </div>
          </div>

          {/* Sunrise */}
          <div className="bg-orange-50 dark:bg-orange-950/20 rounded-xl p-3 flex items-center gap-3">
            <div className="bg-orange-100 dark:bg-orange-900/40 p-2 rounded-lg">
              <Sunrise className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Sunrise</p>
              <p className="text-base font-bold text-foreground">{formatTime(sunrise)}</p>
            </div>
          </div>

          {/* Sunset */}
          <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-xl p-3 flex items-center gap-3">
            <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-lg">
              <Sunset className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Sunset</p>
              <p className="text-base font-bold text-foreground">{formatTime(sunset)}</p>
            </div>
          </div>

        </div>

        {/* Farming Tip */}
        <div className="mx-5 mb-5 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
          <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase mb-1">🌱 Farming Tip</p>
          <p className="text-xs text-emerald-800 dark:text-emerald-300">
            {rain >= 35
              ? "Heavy rain expected. Avoid pesticide spraying. Check field drainage."
              : rain >= 10
              ? "Light rain likely. Good day for transplanting seedlings."
              : maxT >= 38
              ? "Very hot day. Water crops early morning or after sunset. Mulch soil."
              : minT <= 10
              ? "Cold night ahead. Protect tender crops with covers."
              : "Favorable farming day. Good for spraying, harvesting, or field work."}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function WeatherForecast({ onWeatherLoaded }) {
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [locationName, setLocationName] = useState("Local Field");
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`${API_URL}/weather?lat=${latitude}&lon=${longitude}`);
          if (!res.ok) throw new Error(`Weather API error (${res.status}). Is the backend running on port 5003?`);
          
          // Reverse geocode
          try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              const name = geoData.address?.city || geoData.address?.county || geoData.address?.state_district || geoData.address?.state || "Local Field";
              setLocationName(name);
              globalLocationName = name;
            }
          } catch (e) { /* ignore */ }
          
          const jsonData = await res.json();
          setData(jsonData);

          // Store globally for AgriBot to read
          globalWeatherContext = {
            name: globalLocationName,
            lat: parseFloat(latitude).toFixed(2),
            lon: parseFloat(longitude).toFixed(2),
            temp: jsonData.current?.temp,
            humidity: jsonData.current?.humidity,
            wind: jsonData.current?.wind,
            rain: jsonData.daily_stats?.rain_mm ?? 0,
          };

          // Also callback to parent so AgriBot gets it via prop
          if (onWeatherLoaded) onWeatherLoaded(globalWeatherContext);

        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
      },
      () => {
        setError("Location access denied. Please allow location for weather data.");
        setLoading(false);
      }
    );
  }, []);

  if (loading) return (
    <Card className="h-52 flex items-center justify-center gap-3 border-dashed">
      <Loader2 className="w-5 h-5 animate-spin text-primary" />
      <span className="text-sm text-muted-foreground">Fetching live weather...</span>
    </Card>
  );

  if (error) return (
    <Card className="h-52 flex flex-col items-center justify-center border shadow-sm bg-muted/20">
      <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-3">
        <CloudFog className="w-6 h-6 text-red-400" />
      </div>
      <p className="text-sm font-semibold text-foreground">Weather Data Unavailable</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-[250px] text-center">{error}</p>
    </Card>
  );
  if (!data) return null;

  const mainWeatherConf = getWeatherConfig(data.current?.weather_code ?? 0);
  const MainIcon = mainWeatherConf.icon;

  return (
    <>
      <Card className="overflow-hidden border shadow-md">
        
        {/* Hero Header */}
        {/* Premium Formal Hero Section */}
        <div className={`relative overflow-hidden bg-gradient-to-br ${mainWeatherConf.gradFrom} ${mainWeatherConf.gradTo} text-white`}>
          {/* Decorative Mesh background effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-24 -mb-24" />

          <div className="relative p-6 px-8 flex flex-col md:flex-row gap-8 items-center justify-between">
            {/* Left Column: Core Weather */}
            <div className="flex flex-col gap-4 text-center md:text-left items-center md:items-start">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/15 rounded-full border border-white/20 backdrop-blur-md">
                <MapPin className="w-3.5 h-3.5 text-white/90" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/90">
                  {locationName} · {data.latitude?.toFixed(2)}°, {data.longitude?.toFixed(2)}°
                </span>
              </div>

              <div className="flex items-center gap-6">
                <h1 className="text-7xl font-black tracking-tighter drop-shadow-lg">
                  {data.current?.temp ?? "--"}<span className="text-4xl align-top font-normal">°</span>
                </h1>
                <div className="h-14 w-px bg-white/20 hidden md:block" />
                <div className="flex flex-col items-center md:items-start justify-center">
                  <MainIcon className="w-12 h-12 text-white drop-shadow-md" />
                  <p className="text-xl font-bold tracking-tight mt-1">{mainWeatherConf.label}</p>
                </div>
              </div>
              
              <p className="text-sm font-medium text-white/80">
                Feels like <span className="font-bold text-white">{data.current?.feels_like ?? "--"}°</span> · Local Time: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Right Column: Expert Stats & Advice */}
            <div className="flex flex-col gap-4 w-full md:w-auto min-w-[320px]">
              {/* Stat Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/10 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex items-center gap-3 shadow-inner">
                  <div className="bg-white/10 p-2 rounded-xl">
                    <Droplets className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-white/60 tracking-wider">Precipitation</p>
                    <p className="text-sm font-bold">{data.daily_stats?.rain_mm ?? 0} mm</p>
                  </div>
                </div>

                <div className="bg-black/10 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex items-center gap-3 shadow-inner">
                  <div className="bg-white/10 p-2 rounded-xl">
                    <Wind className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-white/60 tracking-wider">Wind Speed</p>
                    <p className="text-sm font-bold">{data.current?.wind ?? "--"} km/h</p>
                  </div>
                </div>
              </div>

              {/* AI Professional Advisory Section */}
              {data.ai_advice && (
                <div className={`p-4 rounded-2xl border backdrop-blur-2xl shadow-xl animate-in fade-in slide-in-from-right-2 duration-700 ${
                  data.ai_advice.type === "warning" 
                    ? "bg-red-500/20 border-red-400/30 text-red-100" 
                    : "bg-white/10 border-white/20 text-white"
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-lg ${data.ai_advice.type === "warning" ? "bg-red-500/40" : "bg-white/20"}`}>
                      {data.ai_advice.type === "warning" ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] uppercase font-bold tracking-widest opacity-70 mb-1">Meteorological Advisory</p>
                      <p className="text-xs font-semibold leading-relaxed">
                        {data.ai_advice.text.replace(/^[⚠✅]\s/, "")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sunrise/Set Inline */}
              <div className="flex items-center justify-between px-2 text-white/60">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                   <Sunrise className="w-3.5 h-3.5" /> {data.daily_stats?.sunrise ? formatTime(data.daily_stats.sunrise) : "--:--"}
                </div>
                <div className="text-[10px] font-bold opacity-30 px-2 flex items-center">
                  <div className="h-0.5 w-8 bg-white" />
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                   {data.daily_stats?.sunset ? formatTime(data.daily_stats.sunset) : "--:--"} <Sunset className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 7-Day Forecast Grid */}
        <CardContent className="p-4">
          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-3">
            7-Day Forecast — tap a day for details
          </p>
          <div className="grid grid-cols-7 gap-1.5">
            {(data.forecast?.time ?? []).slice(0, 7).map((date, idx) => {
              const maxT   = Math.round(data.forecast.temperature_2m_max[idx]);
              const minT   = Math.round(data.forecast.temperature_2m_min[idx]);
              const rain   = data.forecast.precipitation_sum[idx] ?? 0;
              const conf   = getWeatherConfig(data.forecast.weather_code[idx]);
              const warn   = getWarning(maxT, minT, rain);
              const Icon   = conf.icon;
              const isToday = idx === 0;
              const isSelected = selectedIdx === idx;

              return (
                <button
                  key={idx}
                  onClick={() => { setSelectedDay(date); setSelectedIdx(idx); }}
                  className={`flex flex-col gap-1 p-2 rounded-xl border transition-all hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer text-left w-full
                    ${conf.bg} ${conf.border}
                    ${isToday ? "ring-2 ring-primary/40 shadow-sm" : ""}
                    ${isSelected ? "ring-2 ring-primary shadow-md" : ""}
                  `}
                >
                  {/* Day name */}
                  <div className="text-center">
                    <p className={`text-[10px] font-bold ${isToday ? "text-primary" : "text-foreground"}`}>
                      {isToday ? "Today" : new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      {new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                    </p>
                  </div>

                  {/* Icon */}
                  <div className="flex justify-center">
                    <Icon className={`w-5 h-5 ${conf.color}`} />
                  </div>

                  {/* Temps */}
                  <div className="text-center font-bold">
                    <span className="text-[10px] text-rose-500 dark:text-rose-400">↑{maxT}°</span>
                    <span className="mx-0.5 opacity-20">|</span>
                    <span className="text-[10px] text-blue-500 dark:text-blue-400">↓{minT}°</span>
                  </div>

                  {/* Rain */}
                  <div className="flex items-center justify-center gap-0.5 text-[9px] bg-white/10 dark:bg-black/10 py-0.5 rounded-md">
                    <Droplets className="w-2.5 h-2.5 text-blue-500 flex-shrink-0" />
                    <span className="text-muted-foreground font-medium">{rain}mm</span>
                  </div>

                  {/* Warning badge */}
                  <div className={`text-center py-0.5 text-[8px] font-bold uppercase tracking-wide rounded border truncate ${warn.color}`}>
                    {warn.msg}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Day Detail Modal */}
      {selectedDay !== null && selectedIdx !== null && (
        <DayDetailModal
          day={selectedDay}
          idx={selectedIdx}
          forecast={data.forecast}
          locationName={locationName}
          onClose={() => { setSelectedDay(null); setSelectedIdx(null); }}
        />
      )}
    </>
  );
}