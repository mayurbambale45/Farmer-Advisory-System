"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sprout, Loader2, User, MapPin, 
  Trash2, Save, Tractor, Droplets, 
  Mountain, LayoutGrid, Info
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const API_BASE = "http://127.0.0.1:5009";

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [farmData, setFarmData] = useState({
    crop: "",
    soil: "",
    size: "",
    method: "Drip"
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchProfile(parsedUser.id);
  }, []);

  const fetchProfile = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/profile/${id}`);
      const data = await res.json();
      if (data.crop) {
        setFarmData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/profile/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...farmData, farmer_id: user.id }),
      });
      if (res.ok) {
        toast({ title: "Profile Updated", description: "Your farm details have been saved successfully." });
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save profile. Try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Farm Profile</h1>
          <p className="text-muted-foreground">Manage your agricultural details for better recommendations.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={() => { localStorage.removeItem("user"); window.location.href="/"; }}>
             <Trash2 className="w-4 h-4 mr-2" /> Logout
           </Button>
           <Button className="bg-emerald-600 hover:bg-emerald-700" size="sm" onClick={handleSave} disabled={saving}>
             {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
             Save Changes
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Farmer Info Card */}
        <Card className="md:col-span-1 border-none shadow-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
          <CardHeader>
            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8" />
            </div>
            <CardTitle className="text-xl">{user?.name}</CardTitle>
            <CardDescription className="text-emerald-50 opacity-90">{user?.phone}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm bg-white/10 p-3 rounded-xl backdrop-blur-sm">
              <MapPin className="w-4 h-4" />
              <span>Maharashtra, India</span>
            </div>
            <div className="p-3 border border-white/20 rounded-xl text-xs flex gap-2 items-start">
              <Info className="w-4 h-4 flex-shrink-0" />
              <p>Your details are used to provide personalized crop and fertilizer advice.</p>
            </div>
          </CardContent>
        </Card>

        {/* Farm Details Form */}
        <Card className="md:col-span-2 border shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Tractor className="w-5 h-5 text-emerald-600" />
              Current Farm Status
            </CardTitle>
            <CardDescription>This information helps our AI understand your landscape.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Sprout className="w-3.5 h-3.5 text-emerald-600" /> Primary Crop
                </label>
                <Input 
                  placeholder="e.g. Sugarcane, Wheat" 
                  value={farmData.crop}
                  onChange={e => setFarmData({...farmData, crop: e.target.value})}
                  className="rounded-xl bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Mountain className="w-3.5 h-3.5 text-emerald-600" /> Soil Type
                </label>
                <Input 
                  placeholder="e.g. Black, Clay, Sandy" 
                  value={farmData.soil}
                  onChange={e => setFarmData({...farmData, soil: e.target.value})}
                  className="rounded-xl bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <LayoutGrid className="w-3.5 h-3.5 text-emerald-600" /> Field Size (Acres)
                </label>
                <Input 
                  type="number"
                  placeholder="e.g. 2.5" 
                  value={farmData.size}
                  onChange={e => setFarmData({...farmData, size: e.target.value})}
                  className="rounded-xl bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Droplets className="w-3.5 h-3.5 text-emerald-600" /> Irrigation Method
                </label>
                <select 
                  className="w-full h-10 px-3 py-2 rounded-xl border border-input bg-background text-foreground text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={farmData.method}
                  onChange={e => setFarmData({...farmData, method: e.target.value})}
                >
                  <option value="Drip">Drip Irrigation</option>
                  <option value="Sprinkler">Sprinkler</option>
                  <option value="Surface">Surface / Flood</option>
                  <option value="Manual">Manual Watering</option>
                </select>
              </div>

            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900">
               <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-1">Why save this?</h4>
               <p className="text-xs text-emerald-700/80 dark:text-emerald-500">
                 By keeping your farm profile updated, you won't have to enter these details every time you ask for a new irrigation or fertilizer plan.
               </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
