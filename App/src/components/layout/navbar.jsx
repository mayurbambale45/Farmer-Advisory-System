"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/components/language-provider";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sprout, LogIn, User, LogOut, LayoutDashboard, CloudSun, Wrench, MessageSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (e) {
      console.error("Failed to load user", e);
    }

    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const navLinks = [
    { href: "#weather",   icon: CloudSun,       label: t("nav_weather") },
    { href: "#planning",  icon: Wrench,          label: t("nav_planning") },
    { href: "#assistant", icon: MessageSquare,   label: t("nav_assistant") },
    { href: "#alerts",    icon: LayoutDashboard, label: t("nav_alerts") },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-200 ${
        scrolled
          ? "bg-background/98 backdrop-blur-md shadow-sm"
          : "bg-background/95 backdrop-blur"
      }`}
    >
      <div className="container mx-auto px-4 h-14 flex items-center justify-between max-w-7xl">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-1.5 rounded-lg text-primary-foreground group-hover:bg-primary/90 transition-colors">
            <Sprout className="h-4 w-4" />
          </div>
          <span className="text-base font-bold text-primary tracking-tight">AgriAssist</span>
        </Link>

        {/* Nav Links - Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, icon: Icon, label }) => (
            <a
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-all"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ModeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs border-primary/20 text-primary hover:bg-primary/5">
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden md:inline max-w-[80px] truncate">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel className="text-xs">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem className="text-xs cursor-pointer">
                    <User className="mr-2 h-3.5 w-3.5" /> {t("nav_profile")}
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={handleLogout} className="text-xs text-red-600 focus:text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-3.5 w-3.5" /> {t("nav_logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button size="sm" className="gap-1.5 h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground">
                <LogIn className="w-3.5 h-3.5" />
                <span>{t("nav_login")}</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
