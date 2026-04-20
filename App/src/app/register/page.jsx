"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sprout, Loader2, Phone, User, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

const API_BASE = "http://127.0.0.1:5009";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSignup = async () => {
    if (!name || phone.length < 10) {
      toast({ 
        title: "Missing Details", 
        description: "Please enter your name and a valid 10-digit number.", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast({ title: "Registration Successful!", description: "You can now login with your mobile number." });
        router.push("/login");
      } else {
        toast({ title: "Registration Failed", description: data.error || "Something went wrong", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Connection failed. Is the server running?", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-background to-green-50 dark:from-emerald-950/20 dark:to-background flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm space-y-4">
        {/* Logo */}
        <div className="text-center space-y-1">
          <div className="bg-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight py-2">Create Account</h1>
          <p className="text-sm text-muted-foreground italic">Easy registration for farmers</p>
        </div>

        <Card className="border shadow-2xl overflow-hidden rounded-2xl">
          <CardHeader className="pb-4 pt-6 px-6 bg-emerald-600/5">
            <CardTitle className="text-lg">Register</CardTitle>
            <CardDescription className="text-sm">Join our farming community in just two steps.</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 px-6 pb-6 pt-4">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                <Input
                  placeholder="Full Name"
                  className="pl-10 h-11 text-base rounded-xl border-emerald-100 dark:border-emerald-800 bg-white dark:bg-slate-900 focus-visible:ring-emerald-500"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                <Input
                  placeholder="Mobile Number (10 digits)"
                  className="pl-10 h-11 text-base rounded-xl border-emerald-100 dark:border-emerald-800 bg-white dark:bg-slate-900 focus-visible:ring-emerald-500"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  maxLength={10}
                  type="tel"
                />
              </div>
              
              <Button 
                onClick={handleSignup} 
                className="w-full h-11 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]" 
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Sign Up"}
              </Button>

              <div className="flex items-center justify-center gap-2 pt-2">
                <span className="text-sm text-muted-foreground">Already have an account?</span>
                <Link href="/login" className="text-sm font-bold text-emerald-600 hover:underline">
                  Login here
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Link href="/" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-emerald-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home (Continue as Guest)
        </Link>
      </div>
    </div>
  );
}
