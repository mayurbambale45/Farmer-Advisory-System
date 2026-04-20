"use client";

import { useLanguage } from "@/components/language-provider";
import { Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const LANGUAGES = [
  { code: "en", label: "English",  native: "English"  },
  { code: "hi", label: "Hindi",    native: "हिंदी"    },
  { code: "mr", label: "Marathi",  native: "मराठी"   },
];

export function LanguageToggle() {
  const { lang, changeLanguage } = useLanguage();

  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-emerald-200 hover:bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:hover:bg-emerald-950/40 dark:text-emerald-400 font-medium"
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{current.native}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-36">
        {LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`flex items-center justify-between cursor-pointer text-sm ${
              lang === language.code
                ? "text-emerald-700 font-semibold bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400"
                : "text-foreground"
            }`}
          >
            <span>{language.native}</span>
            <span className="text-[10px] text-muted-foreground ml-2">{language.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}