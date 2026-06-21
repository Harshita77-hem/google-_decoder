import React, { useState } from "react";
import { X, Check, Zap, Sparkles, Shield, Gift, BookOpen, Clock, Code } from "lucide-react";
import { UserSession } from "../types";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (tier: "Basic Pro" | "Student Pro") => void;
  currentTier: string;
}

export default function PricingModal({ isOpen, onClose, onUpgrade, currentTier }: PricingModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"Basic" | "Student">("Student");

  if (!isOpen) return null;

  const benefits = [
    { text: "Full Exam-Ready Answers (detailed & structured markdown guides)", pro: true, basic: true },
    { text: "Advanced step-by-step deep explanations & reasoning", pro: true, basic: true },
    { text: "Unlimited queries & zero search daily caps", pro: true, basic: true },
    { text: "AI Student Doubt Solver (interactive context-aware resolver)", pro: true, basic: false },
    { text: "Download structured study cards as formatting PDFs/Text", pro: true, basic: true },
    { text: "Priority fast response mode (direct dedicated API pipeline)", pro: true, basic: false },
    { text: "Zero learning distractions & completely Ad-Free study experience", pro: true, basic: true },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        
        {/* Colorful Header Panel */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-amber-600 text-white p-6 md:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-2 bg-white/15 px-3 py-1 rounded-full text-xs font-bold w-max">
            <Sparkles className="h-4 w-4 fill-amber-300 stroke-amber-300" />
            <span>Unlock Premium Search Decoder</span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight">
            Stop Guessing. Master Your Exams.
          </h2>
          <p className="text-indigo-100 mt-2 max-w-xl text-sm md:text-base font-sans">
            Upgrade your learning tool to student pro. Deconstruct textbook doubts, get high-scoring answers, and test yourself on any topic instantly.
          </p>
        </div>

        {/* Pricing Cards Content */}
        <div className="p-6 md:p-8 grid md:grid-cols-5 gap-6 md:gap-8">
          
          {/* Plan Options Selector (Left column/s 2/5) */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="section-title text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Choose Student Plan
            </h3>

            {/* Basic Pro Card */}
            <div
              onClick={() => setSelectedPlan("Basic")}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedPlan === "Basic"
                  ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 dark:border-blue-500 shadow-md"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-display font-bold text-slate-900 dark:text-white">
                    Basic Pro
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Perfect for exam prep revision
                  </p>
                </div>
                <div className={`p-1.5 rounded-full ${selectedPlan === "Basic" ? "bg-blue-600 text-white" : "border border-slate-300 text-transparent"}`}>
                  <Check className="h-3 w-3" />
                </div>
              </div>
              <div className="flex items-baseline gap-1 mt-3">
                <span className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">
                  ₹49
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  / month
                </span>
              </div>
            </div>

            {/* Student Pro Card */}
            <div
              onClick={() => setSelectedPlan("Student")}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative ${
                selectedPlan === "Student"
                  ? "border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-500 shadow-md"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent"
              }`}
            >
              <span className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                Recommended
              </span>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-display font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    Student Pro
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    The ultimate AI student bundle
                  </p>
                </div>
                <div className={`p-1.5 rounded-full ${selectedPlan === "Student" ? "bg-amber-500 text-white" : "border border-slate-300 text-transparent"}`}>
                  <Check className="h-3 w-3" />
                </div>
              </div>
              <div className="flex items-baseline gap-1 mt-3">
                <span className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">
                  ₹99
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  / month
                </span>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => onUpgrade(selectedPlan === "Basic" ? "Basic Pro" : "Student Pro")}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-sans font-bold py-3 px-4 rounded-xl shadow-lg transition-transform transform active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Zap className="h-4 w-4 fill-white/20 text-white animate-pulse" />
                <span>Upgrade to {selectedPlan === "Basic" ? "Basic Pro" : "Student Pro"} Now</span>
              </button>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-mono">
                ⚡ Cancel anytime • No credit card requirement to play in demo
              </p>
            </div>
          </div>

          {/* Feature List (Right column/s 3/5) */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="section-title text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Included Learning Benefits
            </h3>
            <ul className="space-y-3">
              {benefits.map((benefit, index) => {
                const isSelectedPro = selectedPlan === "Student" ? benefit.pro : benefit.basic;
                return (
                  <li
                    key={index}
                    className={`flex items-start gap-2 text-sm leading-tight transition-opacity ${
                      isSelectedPro
                        ? "text-slate-700 dark:text-slate-200"
                        : "text-slate-300 dark:text-slate-600 line-through"
                    }`}
                  >
                    <div className="mt-0.5">
                      {isSelectedPro ? (
                        <div className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full p-0.5">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      ) : (
                        <div className="text-slate-300 dark:text-slate-700 p-0.5">
                          <X className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                    <span>{benefit.text}</span>
                  </li>
                );
              })}
            </ul>

            {/* Extra Trust Icons */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-500 dark:text-slate-400 font-sans">
              <div className="flex flex-col items-center gap-1">
                <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Secure payment</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Clock className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                <span>Instant access</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Gift className="h-4 w-4 text-amber-500" />
                <span>Cancel any time</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
