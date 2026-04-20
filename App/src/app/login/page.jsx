"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sprout, Loader2, Phone, Lock, ArrowLeft, ShieldCheck, CheckCircle2, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

const API_BASE = "http://127.0.0.1:5009";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState("");  // only set in demo mode
  const [phone, setPhone]     = useState("");
  const [otp, setOtp]         = useState("");

  const handleSendOtp = async () => {
    if (phone.length < 10) {
      toast({ title: "Invalid Number", description: "Please enter a 10-digit mobile number.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast({ title: "Login Error", description: data.error || "Account not found. Please register.", variant: "destructive" });
        return;
      }

      // Show demo OTP only if backend is in demo mode
      if (data.demo_otp) setDemoOtp(data.demo_otp);
      else setDemoOtp(""); // Twilio mode — no OTP shown

      setStep(2);
      toast({
        title: "OTP Sent! 📱",
        description: data.demo_otp
          ? "Demo mode: Your OTP is shown below."
          : `A 6-digit OTP has been sent to +91 ${phone}`
      });
    } catch (error) {
      toast({ title: "Connection Error", description: "Could not reach the server.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!otp || otp.length < 4) {
      toast({ title: "Invalid OTP", description: "Please enter the 6-digit OTP.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();

      if (data.status === "success") {
        localStorage.setItem("user", JSON.stringify(data.user));
        toast({ title: "✅ Welcome Back!", description: `Logged in as ${data.user.name}` });
        window.location.href = "/";
      } else {
        toast({ title: "Invalid OTP", description: data.error || "Incorrect code. Try again.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Verification failed. Try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-emerald-950/20 dark:to-background flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm space-y-6">

        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="bg-emerald-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30">
            <Sprout className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Farmer Login</h1>
          <p className="text-sm text-muted-foreground">Secure OTP-based access for Indian farmers</p>
        </div>

        <Card className="border-none shadow-2xl overflow-hidden rounded-3xl bg-white/80 dark:bg-card/60 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/5">
          <CardHeader className="pb-4 pt-7 px-7">
            <CardTitle className="text-base flex items-center gap-2">
              {step === 1
                ? <Phone className="w-5 h-5 text-emerald-600" />
                : <MessageSquare className="w-5 h-5 text-emerald-600" />}
              {step === 1 ? "Enter your mobile number" : "Enter your OTP"}
            </CardTitle>
            <CardDescription className="text-sm">
              {step === 1
                ? "We'll send a secure one-time code to your number."
                : demoOtp
                  ? "Demo mode — see code below."
                  : `OTP sent to +91 ${phone}`}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 px-7 pb-7">

            {/* Step 1 — Phone Number */}
            {step === 1 && (
              <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                <div className="relative group">
                  <span className="absolute left-3.5 top-3.5 text-muted-foreground group-focus-within:text-emerald-600 text-sm font-medium pointer-events-none transition-colors">
                    +91
                  </span>
                  <Input
                    placeholder="Mobile number"
                    className="pl-12 h-12 text-base rounded-2xl border-emerald-100 dark:border-emerald-800 bg-white dark:bg-slate-900 focus-visible:ring-emerald-500 transition-all font-medium"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    onKeyDown={e => e.key === "Enter" && handleSendOtp()}
                    maxLength={10}
                    type="tel"
                  />
                  {phone.length === 10 && (
                    <CheckCircle2 className="absolute right-3.5 top-3.5 h-5 w-5 text-emerald-500 animate-in fade-in" />
                  )}
                </div>

                <Button
                  onClick={handleSendOtp}
                  className="w-full h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-[0.97] transition-all"
                  disabled={loading || phone.length < 10}
                >
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Send OTP →"}
                </Button>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="text-sm text-muted-foreground">No account?</span>
                  <Link href="/register" className="text-sm font-bold text-emerald-600 hover:underline">
                    Register free
                  </Link>
                </div>
              </div>
            )}

            {/* Step 2 — OTP Verify */}
            {step === 2 && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                  <Input
                    placeholder="Enter 6-digit OTP"
                    className="pl-11 h-12 text-center text-xl tracking-[8px] font-bold rounded-2xl border-emerald-100 dark:border-emerald-800 bg-white dark:bg-slate-900 focus-visible:ring-emerald-500"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    onKeyDown={e => e.key === "Enter" && handleVerify()}
                    maxLength={6}
                    type="tel"
                    autoFocus
                  />
                </div>

                {/* Demo OTP badge — only shown in demo/dev mode */}
                {demoOtp && (
                  <div className="flex items-center gap-2 text-xs bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 rounded-xl px-4 py-3 animate-in fade-in zoom-in duration-300">
                    <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Dev Mode OTP: <strong className="font-mono text-sm tracking-wider">{demoOtp}</strong>
                      <br />
                      <span className="text-[10px] opacity-70">This is shown only in demo mode. Enable Twilio to hide.</span>
                    </span>
                  </div>
                )}

                <Button
                  onClick={handleVerify}
                  className="w-full h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-[0.97] transition-all"
                  disabled={loading || otp.length < 4}
                >
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Verify & Sign In ✓"}
                </Button>

                <button
                  onClick={() => { setStep(1); setOtp(""); setDemoOtp(""); }}
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-emerald-600 transition-colors py-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Use a different number
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        <Link href="/" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-emerald-600 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Continue as Guest
        </Link>
      </div>
    </div>
  );
}