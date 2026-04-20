"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/components/language-provider"; 
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, Send, User, Sprout, Loader2, MapPin } from "lucide-react";

const API_URL = "http://127.0.0.1:5005/chat";

// Quick suggestion chips shown below the intro
const QUICK_CHIPS = {
  en: [
    "What crops suit my area?",
    "How's the weather for farming?",
    "When should I irrigate?",
    "Best fertilizer for wheat?",
  ],
  hi: [
    "मेरे क्षेत्र के लिए कौन सी फसल?",
    "आज खेती के लिए मौसम कैसा है?",
    "सिंचाई कब करें?",
    "गेहूं के लिए सबसे अच्छा खाद?",
  ],
  mr: [
    "माझ्या भागात कोणते पीक?",
    "आजचे हवामान शेतीसाठी कसे?",
    "पाणी कधी द्यावे?",
    "गव्हासाठी सर्वोत्तम खत?",
  ],
};

export function AgriBot({ weatherContext }) {
  const { t, lang } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationReady, setLocationReady] = useState(false);
  const scrollRef = useRef(null);

  // Build greeting based on location
  const buildGreeting = (ctx) => {
    if (ctx?.name && ctx.name !== "your location") {
      if (lang === "hi") return `नमस्ते! 🌾 मैं AgriAssist हूँ। आप ${ctx.name} से हैं — ${ctx.temp}°C, ${ctx.humidity}% आर्द्रता। मुझसे फसल, खाद या सिंचाई के बारे में पूछें।`;
      if (lang === "mr") return `नमस्ते! 🌾 मी AgriAssist आहे. तुम्ही ${ctx.name} येथे आहात — ${ctx.temp}°C, ${ctx.humidity}% आर्द्रता. पीक, खत किंवा पाण्याबद्दल विचारा.`;
      return `Namaste! 🌾 I am your AI Agriculture Expert.\nYou're at ${ctx.name} — ${ctx.temp}°C, ${ctx.humidity}% humidity, wind ${ctx.wind} km/h.\nAsk me about crops, pests, irrigation, or fertilizers!`;
    }
    return t("bot_intro");
  };

  // Reset greeting on language change or when weather arrives
  useEffect(() => {
    setMessages([{ role: "bot", text: buildGreeting(weatherContext) }]);
  }, [lang]);

  // When weatherContext arrives (from parent), update greeting
  useEffect(() => {
    if (weatherContext && !locationReady) {
      setLocationReady(true);
      setMessages([{ role: "bot", text: buildGreeting(weatherContext) }]);
    }
  }, [weatherContext]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input;
    if (!userText.trim()) return;
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          lang: lang,
          // Pass location + weather context to backend
          location: weatherContext || {},
        }),
      });
      if (!res.ok) throw new Error("Network error");
      const data = await res.json();
      setMessages(prev => [...prev, { role: "bot", text: data.reply || "Error" }]);
    } catch {
      setMessages(prev => [...prev, { role: "bot", text: `⚠ ${t("bot_error")}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => sendMessage(input);
  const handleChip = (chip) => sendMessage(chip);

  const chips = QUICK_CHIPS[lang] || QUICK_CHIPS.en;
  const showChips = messages.length <= 1;

  return (
    <Card className="flex flex-col border shadow-sm" style={{ height: "500px" }}>
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 px-4 rounded-t-[calc(var(--radius)-1px)] flex-shrink-0">
        <CardTitle className="flex items-center gap-2.5 text-sm font-medium">
          <div className="bg-white/15 p-1.5 rounded-lg">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">{t("bot_name")}</p>
            <p className="text-[10px] text-emerald-100 font-normal">{t("bot_powered")}</p>
          </div>
          <div className="ml-auto flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
              <span className="text-[10px] text-emerald-100">Online</span>
            </div>
            {weatherContext?.name && (
              <div className="flex items-center gap-1 text-[9px] text-emerald-200">
                <MapPin className="w-2.5 h-2.5" />
                <span className="truncate max-w-[80px]">{weatherContext.name}</span>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 dark:bg-slate-900/30">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex items-end gap-1.5 max-w-[90%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === "user"
                  ? "bg-emerald-600 text-white"
                  : "bg-white dark:bg-slate-800 border text-emerald-600"
              }`}>
                {msg.role === "user" ? <User className="w-3 h-3" /> : <Sprout className="w-3 h-3" />}
              </div>
              <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed shadow-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-emerald-600 text-white rounded-br-sm"
                  : "bg-white dark:bg-slate-800 text-foreground border rounded-bl-sm"
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {/* Quick suggestion chips (shown only when chat is empty) */}
        {showChips && !loading && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {chips.map((chip, i) => (
              <button
                key={i}
                onClick={() => handleChip(chip)}
                className="text-[10px] px-2.5 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors font-medium"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-2 rounded-2xl rounded-bl-sm shadow-sm border">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </CardContent>

      {/* Input */}
      <CardFooter className="p-2.5 bg-white dark:bg-card border-t flex-shrink-0">
        <div className="flex w-full gap-2 items-center">
          <Input
            placeholder={t("bot_input_ph")}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            className="h-8 text-xs bg-slate-50 dark:bg-slate-900/50 rounded-full pl-3 pr-3"
          />
          <Button
            onClick={handleSend}
            size="icon"
            disabled={loading || !input.trim()}
            className="h-8 w-8 rounded-full bg-emerald-600 hover:bg-emerald-700 flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}