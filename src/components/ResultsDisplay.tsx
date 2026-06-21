import React from "react";
import {
  Brain,
  BookOpen,
  Lightbulb,
  Zap,
  Lock,
  Copy,
  Download,
  RotateCcw,
  Sparkles,
  ClipboardCheck,
} from "lucide-react";
import { DecodedAnswer, UserSession } from "../types";

interface ResultsDisplayProps {
  answer: DecodedAnswer;
  query: string;
  session: UserSession;
  onOpenPricing: () => void;
  onRegenerate: () => void;
  isLoading: boolean;
}

export default function ResultsDisplay({
  answer,
  query,
  session,
  onOpenPricing,
  onRegenerate,
  isLoading,
}: ResultsDisplayProps) {
  const [copiedSection, setCopiedSection] = React.useState<string | null>(null);

  const handleCopy = (text: string, sectionName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    setTimeout(() => {
      setCopiedSection(null);
    }, 2000);
  };

  // Downloads the complete study guide as a beautifully structured revision file
  const handleDownload = () => {
    const divider = "\n" + "=".repeat(60) + "\n";
    let fileContent = `🎓 GOOGLE SEARCH DECODER STUDY PANEL\nTopic: ${query}\nDate Generated: ${new Date().toLocaleDateString()}\n`;
    fileContent += divider;

    fileContent += `🧠 1. SIMPLE EXPLANATION (BASIC)\n${answer.simpleExplanation}\n`;
    fileContent += divider;

    if (session.isPremium) {
      fileContent += `📘 2. EXAM ANSWER (DETAILED)\n${answer.examAnswer}\n`;
      fileContent += divider;
      fileContent += `🌍 3. REAL-LIFE EXAMPLE\n${answer.realLifeExample}\n`;
    } else {
      fileContent += `📘 2. EXAM ANSWER (DETAILED)\n🔒 Upgrade to Premium to unlock full Exam-Ready answers!\n`;
      fileContent += divider;
      fileContent += `🌍 3. REAL-LIFE EXAMPLE\n🔒 Upgrade to Premium to unlock real-life relatable examples!\n`;
    }
    fileContent += divider;

    fileContent += `⚡ 4. QUICK REVISION BULLETS\n`;
    answer.quickRevision.forEach((point, i) => {
      fileContent += `- ${point}\n`;
    });

    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${query.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_study_guide.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header Info Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-850 p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 font-sans">
            DECODED RESULT
          </span>
          <h2 className="text-lg md:text-xl font-display font-bold text-slate-900 dark:text-white capitalize truncate max-w-xl">
            "{query}"
          </h2>
        </div>
        
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 gap-2 self-start sm:self-auto">
          {/* Copy Full Button */}
          <button
            onClick={() => {
              const textToCopy = `Topic: ${query}\n\nSimple Explanation:\n${answer.simpleExplanation}\n\nRevision Notes:\n${answer.quickRevision.join("\n")}`;
              handleCopy(textToCopy, "all");
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors font-medium"
            title="Copy Study Card Summary"
          >
            {copiedSection === "all" ? (
              <>
                <ClipboardCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors font-medium border-l border-slate-200 dark:border-slate-850"
            title="Download complete study card as PDF/Text summary"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download study file</span>
          </button>

          {/* Regenerate Button */}
          <button
            onClick={onRegenerate}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors font-medium border-l border-slate-200 dark:border-slate-850 disabled:opacity-50"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Bento Grid 4 Learning Cards */}
      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        
        {/* Card 1: 🧠 Simple Explanation (FREE) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col hover:shadow-xl transition-all h-full self-stretch relative overflow-hidden group shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/40 text-amber-600 rounded-xl flex items-center justify-center text-xl">
                🧠
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-800 dark:text-white uppercase tracking-tight text-sm">
                  Simple Explanation
                </h3>
                <p className="text-[11px] text-slate-450 dark:text-slate-400">
                  Concepts clarified for everyone
                </p>
              </div>
            </div>
            <button
              onClick={() => handleCopy(answer.simpleExplanation, "simple")}
              className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              title="Copy simple explanation"
            >
              {copiedSection === "simple" ? (
                <ClipboardCheck className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
          
          <div className="prose prose-slate dark:prose-invert text-sm leading-relaxed text-slate-600 dark:text-slate-300 flex-grow whitespace-pre-line mb-6 font-sans">
            {answer.simpleExplanation}
          </div>

          <div className="pt-4 border-t border-slate-150 dark:border-slate-800 flex justify-between items-center mt-auto">
            <span className="text-[10px] font-mono bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-bold tracking-wider">
              FREE TIER OK
            </span>
          </div>
        </div>

        {/* Card 2: ⚡ Quick Revision (FREE) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col hover:shadow-xl transition-all h-full self-stretch relative overflow-hidden group shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950/40 text-purple-600 rounded-xl flex items-center justify-center text-xl">
                ⚡
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-800 dark:text-white uppercase tracking-tight text-sm">
                  Quick Revision
                </h3>
                <p className="text-[11px] text-slate-450 dark:text-slate-400">
                  Key memory-trigger bullets
                </p>
              </div>
            </div>
            <button
              onClick={() => handleCopy(answer.quickRevision.join("\n"), "revision")}
              className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              title="Copy revisions list"
            >
              {copiedSection === "revision" ? (
                <ClipboardCheck className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
          
          <div className="flex-grow space-y-3 mb-6">
            {answer.quickRevision.map((point, index) => {
              const isTrap = index === answer.quickRevision.length - 1;
              return (
                <div
                  key={index}
                  className={`p-3 rounded-xl border text-sm leading-relaxed ${
                    isTrap
                      ? "bg-rose-50/50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/50 text-rose-700 dark:text-rose-300"
                      : "bg-slate-50/50 dark:bg-slate-900/10 border-slate-100 dark:border-slate-800 text-slate-650 dark:text-slate-300"
                  }`}
                >
                  <span className="font-semibold text-[10px] uppercase block tracking-wider mb-1">
                    {isTrap ? "🚨 Common Trap to Avoid" : `Concept Tip ${index + 1}`}
                  </span>
                  {point}
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-150 dark:border-slate-800 flex justify-between items-center mt-auto">
            <span className="text-[10px] font-mono bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded font-bold tracking-wider">
              FREE TIER OK
            </span>
          </div>
        </div>

        {/* Card 3: 📘 Exam Answer (PREMIUM ONLY) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col hover:shadow-xl transition-all h-full self-stretch relative overflow-hidden group shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/40 text-blue-600 rounded-xl flex items-center justify-center text-xl">
                📘
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-800 dark:text-white uppercase tracking-tight text-sm flex items-center gap-1.5">
                  Exam-Ready Answer
                </h3>
                <p className="text-[11px] text-slate-450 dark:text-slate-400">
                  Structured high-mark response
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!session.isPremium && (
                <span className="text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold tracking-widest">
                  PRO
                </span>
              )}
              {session.isPremium && (
                <button
                  onClick={() => handleCopy(answer.examAnswer, "exam")}
                  className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                  title="Copy Exam-ready model answer"
                >
                  {copiedSection === "exam" ? (
                    <ClipboardCheck className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          </div>
          
          {/* Conditional Blurring for Free Users */}
          <div className="relative flex-grow flex flex-col justify-between">
            {session.isPremium ? (
              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed overflow-y-auto max-h-96 pr-1 whitespace-pre-line font-sans scrollbar-thin">
                {answer.examAnswer}
              </div>
            ) : (
              <div className="relative flex-grow flex flex-col">
                {/* Simulated blurred content preview */}
                <div className="blur-premium select-none pointer-events-none space-y-3 text-sm text-slate-400 dark:text-slate-705 opacity-20 blur-[3px]">
                  <p className="font-bold text-slate-800 dark:text-white">Definition & Mechanisms:</p>
                  <p>The greenhouse effect is a process that occurs when gases in Earth's atmosphere trap the Sun's heat. This process makes Earth much warmer than it would be without an atmosphere.</p>
                  <p className="font-bold text-slate-800 dark:text-white">Key Terminology:</p>
                  <ul className="list-disc list-inside">
                    <li>Long-wave Infrared Radiation</li>
                    <li>Anthropogenic Emissions</li>
                    <li>Radiative Forcing Index</li>
                  </ul>
                </div>
                
                {/* Premium Promo Lock Block */}
                <div className="absolute inset-0 bg-slate-900/10 dark:bg-slate-950/20 flex items-center justify-center backdrop-blur-[1px]">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl text-center max-w-[90%] border border-indigo-100 dark:border-slate-800">
                    <div className="text-indigo-600 dark:text-indigo-400 mb-2 font-bold flex items-center justify-center gap-1">
                      <Lock className="h-4 w-4" />
                      <span>🔒 Pro Feature</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-450 mb-4">
                      Unlock the structured, detailed exam format with marking scheme pointers.
                    </p>
                    <button
                      onClick={onOpenPricing}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white w-full py-2.5 rounded-xl font-bold text-xs hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
                    >
                      Get Student Pro — ₹49/mo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-150 dark:border-slate-800 flex justify-between items-center mt-6">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold tracking-wider ${session.isPremium ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400" : "bg-slate-100 dark:bg-slate-800 text-slate-550"}`}>
              {session.isPremium ? "PREMIUM ACTIVATED" : "LOCKED"}
            </span>
          </div>
        </div>

        {/* Card 4: 🌍 Real-Life Example (PREMIUM ONLY) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col hover:shadow-xl transition-all h-full self-stretch relative overflow-hidden group shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-xl flex items-center justify-center text-xl">
                🌍
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-800 dark:text-white uppercase tracking-tight text-sm">
                  Real-Life Example
                </h3>
                <p className="text-[11px] text-slate-450 dark:text-slate-400">
                  Relatable everyday scenario
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!session.isPremium && (
                <span className="text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold tracking-widest">
                  PRO
                </span>
              )}
              {session.isPremium && (
                <button
                  onClick={() => handleCopy(answer.realLifeExample, "real")}
                  className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                  title="Copy real-life everyday example"
                >
                  {copiedSection === "real" ? (
                    <ClipboardCheck className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          </div>
          
          <div className="relative flex-grow flex flex-col justify-between">
            {session.isPremium ? (
              <div className="text-sm text-slate-650 dark:text-slate-300 leading-relaxed flex-grow whitespace-pre-line font-sans rounded-xl p-4 bg-emerald-50/30 dark:bg-emerald-950/10 border-l-4 border-emerald-400 italic">
                {answer.realLifeExample}
              </div>
            ) : (
              <div className="relative flex-grow flex flex-col">
                {/* Simulated blurred content preview */}
                <div className="blur-premium select-none pointer-events-none space-y-3 text-sm text-slate-400 dark:text-slate-705 opacity-20 blur-[3px]">
                  <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-emerald-400 italic">
                    "Have you ever walked into a botanical garden dome or a plant greenhouse in winter? Even if it's snowing outside, it's tropical and warm inside because the glass keeps the heat in."
                  </div>
                  <p className="mt-4">In the same way, CO2 from our cars and factories acts like an extra thick blanket around the Earth, making the 'greenhouse' too warm for comfort.</p>
                </div>
                
                {/* Premium Promo Lock Block */}
                <div className="absolute inset-0 bg-slate-900/10 dark:bg-slate-950/20 flex items-center justify-center backdrop-blur-[1px]">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl text-center max-w-[90%] border border-indigo-100 dark:border-slate-800">
                    <div className="text-indigo-600 dark:text-indigo-400 mb-2 font-bold flex items-center justify-center gap-1">
                      <Lock className="h-4 w-4" />
                      <span>🔒 Pro Feature</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-450 mb-4">
                      Unlock relatable analogies, everyday examples, and physics/math formula mappings.
                    </p>
                    <button
                      onClick={onOpenPricing}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white w-full py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm cursor-pointer"
                    >
                      Get Student Pro — ₹49/mo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-150 dark:border-slate-800 flex justify-between items-center mt-6">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold tracking-wider ${session.isPremium ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-800 text-slate-550"}`}>
              {session.isPremium ? "PREMIUM ACTIVATED" : "LOCKED"}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
