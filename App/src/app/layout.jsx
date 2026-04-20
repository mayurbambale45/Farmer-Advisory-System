import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { Navbar } from "@/components/layout/navbar";

export const metadata = {
  title: "AgriAssist | Smart Farming Platform",
  description: "AI-powered farming advisory system for crop recommendation, fertilizer guidance, and weather forecasting.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-background min-h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider>
            {/* Navbar is a child of LanguageProvider so it can use useLanguage() */}
            <Navbar />
            <div className="flex-1">
              {children}
            </div>
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}