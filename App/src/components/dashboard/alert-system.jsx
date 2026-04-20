"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/components/language-provider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
    AlertTriangle, Bell, ShieldCheck, Bug, Siren, Loader2, X, Wifi
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const API_URL = "http://127.0.0.1:5010";

export function AlertSystem() {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          const res = await fetch(`${API_URL}/get_alerts?lat=${latitude}&lon=${longitude}`);
          if (!res.ok) throw new Error("Connection failed");
          const data = await res.json();
          setAlerts(data.alerts ?? []);
        } catch (e) {
          setError(e.message);
        } finally { setLoading(false); }
      },
      () => {
        setError("Location access denied.");
        setLoading(false);
      }
    );
  }, []);

  const getAlertStyle = (type) => {
    switch (type) {
      case "critical": return { bg: "bg-red-50 dark:bg-red-950/20",    border: "border-red-200",    icon: Siren,         color: "text-red-600",    badge: "destructive" };
      case "warning":  return { bg: "bg-amber-50 dark:bg-amber-950/20", border: "border-amber-200",  icon: AlertTriangle, color: "text-amber-600", badge: "default"      };
      case "info":     return { bg: "bg-blue-50 dark:bg-blue-950/20",   border: "border-blue-200",   icon: Bug,           color: "text-blue-600",  badge: "secondary"    };
      default:         return { bg: "bg-muted/50",                       border: "border-border",     icon: Bell,          color: "text-foreground",badge: "outline"      };
    }
  };

  if (loading) return (
    <Card className="border-dashed flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-xs">Scanning satellite data...</span>
    </Card>
  );

  return (
    <Card className="border shadow-sm overflow-hidden">
      {/* Header */}
      <CardHeader className="bg-slate-900 dark:bg-slate-950 text-white py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
            <div className="relative">
              <Bell className="w-4 h-4 text-white" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
              )}
            </div>
            {t("alert_title")}
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] font-mono text-slate-400">{t("alert_online")}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 space-y-2">
        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <Wifi className="w-5 h-5 text-red-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">{t("alert_offline")}</h3>
              <p className="text-xs text-muted-foreground px-4">{t("alert_offline_desc")}</p>
            </div>
          </div>
        )}

        {/* All Clear */}
        {!error && alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-2.5">
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-sm font-bold text-foreground">{t("alert_empty")}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-[180px]">
              {t("alert_empty_desc")}
            </p>
          </div>
        )}

        {/* Active alerts */}
        {alerts.map((alert) => {
          const style = getAlertStyle(alert.type);
          const Icon = style.icon;
          return (
            <div
              key={alert.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all hover:shadow-sm ${style.bg} ${style.border}`}
            >
              <div className={`p-1.5 bg-white dark:bg-slate-900 rounded-md shadow-sm flex-shrink-0 ${style.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h4 className={`text-xs font-bold truncate ${style.color}`}>{alert.title}</h4>
                  <Badge variant={style.badge} className="text-[9px] h-4 px-1.5 uppercase flex-shrink-0">
                    {alert.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{alert.desc}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}