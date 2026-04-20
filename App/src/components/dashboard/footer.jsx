import { useState } from "react";
import { 
  Sprout, MapPin, Mail, Phone, Github, Twitter, Linkedin, 
  ExternalLink, ShieldCheck, FileText, Scale, Globe, Building 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Footer() {
  const year = new Date().getFullYear();
  const [activePolicy, setActivePolicy] = useState(null);

  const policyContent = {
    privacy: {
      title: "Privacy Policy",
      content: `AgriAssist is committed to protecting the privacy of its users. This policy outlines how we handle your data.

1. Data Collection: We collect location data only to provide accurate weather and crop advisory. Your farm data is stored securely.
2. Purpose: Data is used solely for AI-driven recommendations and local alert systems.
3. Third Parties: We do not sell or share your personal information with third-party advertisers. We use Open-Meteo for weather and Groq/Google for AI processing.
4. Security: We implement industry-standard encryption for all data transmissions.
5. Consent: By using the platform, you consent to our data processing for agricultural advisory purposes.`
    },
    terms: {
      title: "Terms of Service",
      content: `Welcome to AgriAssist. By accessing this platform, you agree to the following terms:

1. Service Intent: This is an advisory platform. AI recommendations should be verified by local agricultural experts before implementation.
2. User Conduct: Users must providing accurate farm information to receive valid predictions.
3. Intellectual Property: All AI models and interface designs are the property of AgriAssist.
4. Liability: AgriAssist is not liable for crop loss or damages resulting from unforeseen environmental shifts. Predictions are based on historical and real-time data trends.
5. Modifications: We reserve the right to update these terms to reflect evolving agricultural standards.`
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 mt-16 border-t border-emerald-900/20">
      <div className="container mx-auto px-6 max-w-7xl py-14 grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* Brand & Mission */}
        <div className="md:col-span-4 space-y-5">
          <div className="flex items-center gap-3 text-white">
            <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-900/20">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight block leading-none">AgriAssist</span>
              <span className="text-[10px] uppercase font-medium tracking-widest text-emerald-500 opacity-80">Official Farmer Resource</span>
            </div>
          </div>
          <p className="text-[11px] leading-relaxed max-w-xs font-medium">
            AgriAssist is a precision intelligence platform dedicated to optimizing agricultural productivity through AI-driven weather, soil, and crop analysis for sustainable development.
          </p>
          <div className="flex gap-4 pt-2">
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:text-emerald-400 cursor-pointer transition-all hover:border-emerald-500/50">
              <Twitter className="w-4 h-4" />
            </div>
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:text-emerald-400 cursor-pointer transition-all hover:border-emerald-500/50">
              <Github className="w-4 h-4" />
            </div>
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:text-emerald-400 cursor-pointer transition-all hover:border-emerald-500/50">
              <Linkedin className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Resources - Official Portals */}
        <div className="md:col-span-3">
          <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-emerald-500" /> Official Resources
          </h3>
          <ul className="space-y-3 text-[11px] font-medium">
            <li>
              <a href="https://icar.org.in/" target="_blank" className="hover:text-white flex items-center gap-2 group transition-colors">
                 ICAR Portals <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
              </a>
            </li>
            <li>
              <a href="https://pmfby.gov.in/" target="_blank" className="hover:text-white flex items-center gap-2 group transition-colors">
                Crop Insurance (PMFBY) <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
              </a>
            </li>
            <li>
              <a href="https://www.enam.gov.in/" target="_blank" className="hover:text-white flex items-center gap-2 group transition-colors">
                E-NAM Market Prices <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
              </a>
            </li>
            <li>
              <a href="https://agrimachinery.nic.in/" target="_blank" className="hover:text-white flex items-center gap-2 group transition-colors">
                Agri Machinery Subsidy <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
              </a>
            </li>
          </ul>
        </div>

        {/* Quick Access */}
        <div className="md:col-span-2">
          <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-emerald-500" /> Quick Access
          </h3>
          <ul className="space-y-3 text-[11px] font-medium">
             <li><a href="/" className="hover:text-white transition-colors">Dashboard Overview</a></li>
             <li><a href="/profile" className="hover:text-white transition-colors">Farm Management</a></li>
             <li><a href="#" className="hover:text-white transition-colors">Advisory History</a></li>
             <li><a href="#" className="hover:text-white transition-colors">Knowledge Base</a></li>
          </ul>
        </div>

        {/* Official Contact */}
        <div className="md:col-span-3">
          <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
             Official Contact
          </h3>
          <ul className="space-y-4 text-[11px] font-medium">
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Digital Innovation Hub, Miraj, <br/>Maharashtra - 416410, India</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>support@agriassist.gov.in</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>1800-420-AGRI (Toll Free)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar: Policies & Copyright */}
      <div className="border-t border-slate-900 bg-black/20 py-8">
        <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <p>© {year} AgriAssist Precision Intelligence. All rights strictly reserved.</p>
          
          <div className="flex gap-8">
            <Dialog>
              <DialogTrigger asChild>
                <button className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Privacy Policy
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-slate-950 border-slate-800 text-slate-300">
                <DialogHeader>
                  <DialogTitle className="text-white text-lg flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" /> {policyContent.privacy.title}
                  </DialogTitle>
                  <DialogDescription className="text-slate-500 font-mono text-[10px] uppercase pt-1">
                    Effective Date: April 18, 2026
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[350px] mt-4 pr-4 text-xs leading-relaxed font-medium">
                  {policyContent.privacy.content.split('\n').map((line, i) => (
                    <p key={i} className="mb-4">{line}</p>
                  ))}
                </ScrollArea>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <button className="hover:text-white transition-colors flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Terms of Service
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-slate-950 border-slate-800 text-slate-300">
                <DialogHeader>
                  <DialogTitle className="text-white text-lg flex items-center gap-2">
                    <Scale className="w-5 h-5 text-emerald-500" /> {policyContent.terms.title}
                  </DialogTitle>
                  <DialogDescription className="text-slate-500 font-mono text-[10px] uppercase pt-1">
                    Last Updated: {year}
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[350px] mt-4 pr-4 text-xs leading-relaxed font-medium">
                   {policyContent.terms.content.split('\n').map((line, i) => (
                    <p key={i} className="mb-4">{line}</p>
                  ))}
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </footer>
  );
}