import React from "react";
import { Sparkles, Sun, Moon, Zap, User, Lock, Award } from "lucide-react";
import { UserSession } from "../types";

interface HeaderProps {
  session: UserSession;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onOpenPricing: () => void;
  onResetSearches: () => void;
  onToggleDemoPremium: () => void;
}

export default function Header({
  session,
  darkMode,
  setDarkMode,
  onOpenPricing,
  onResetSearches,
  onToggleDemoPremium,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 transition-colors h-16 flex items-center px-4 md:px-8">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-lg leading-none">D</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg md:text-xl tracking-tight text-slate-800 dark:text-white flex items-center gap-1.5">
              <span>Search<span className="text-indigo-600 dark:text-indigo-400">Decoder</span></span>
              <span className="hidden xs:inline-block text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-sans px-2 py-0.5 rounded-full font-medium border border-slate-100 dark:border-slate-700">
                Student
              </span>
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Demo Pro Toggle */}
          <button
            onClick={onToggleDemoPremium}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              session.isPremium
                ? "bg-amber-100/80 dark:bg-amber-950/40 border-amber-300 text-amber-700 dark:text-amber-300"
                : "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="SaaS Demo Admin Switch"
          >
            <Zap className={`h-3 w-3 ${session.isPremium ? "fill-amber-500 text-amber-500" : ""}`} />
            <span>Demo: {session.isPremium ? "Premium Active" : "Set User Premium"}</span>
          </button>

          {/* User Limits Counter for Free Trial */}
          {!session.isPremium ? (
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                <strong className="text-indigo-600 dark:text-indigo-400">{session.searchesLeft}</strong>/{session.totalLimit} Daily Free Decodes Left
              </span>
              <button
                onClick={onResetSearches}
                className="ml-1 text-[10px] text-slate-400 hover:text-indigo-500 hover:underline cursor-pointer"
                title="Reset counter"
              >
                (Reset)
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
              <Award className="h-3.5 w-3.5 fill-white/20" />
              <span>{session.tier}</span>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-800 cursor-pointer"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
          </button>

          {/* Primary Premium CTA */}
          {!session.isPremium && (
            <button
              onClick={onOpenPricing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold text-xs py-2 px-4 rounded-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5 text-center cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5 fill-white/20 animate-bounce" />
              <span className="hidden xs:inline">Upgrade to Student Pro</span>
              <span className="xs:hidden">Get Pro</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
