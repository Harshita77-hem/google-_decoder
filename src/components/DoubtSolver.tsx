import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  HelpCircle,
  BrainCircuit,
  CornerDownRight,
  Send,
  Lock,
  Compass,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { DecodedAnswer, DoubtMessage, DoubtSolveResult, UserSession } from "../types";

interface DoubtSolverProps {
  originalQuery: string;
  originalAnswer: DecodedAnswer;
  session: UserSession;
  onOpenPricing: () => void;
  onSpendDoubt: () => void;
}

export default function DoubtSolver({
  originalQuery,
  originalAnswer,
  session,
  onOpenPricing,
  onSpendDoubt,
}: DoubtSolverProps) {
  const [doubtText, setDoubtText] = useState("");
  const [messages, setMessages] = useState<DoubtMessage[]>([]);
  const [isSolving, setIsSolving] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  
  const doubtsLeft = session.doubtsLeft ?? 10;
  const totalDoubtsLimit = session.totalDoubtsLimit ?? 10;

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll chats to the bottom
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSolving]);

  // Handle preset follow-up suggestion clicks
  const handlePresetClick = (preset: string) => {
    if (isSolving) return;
    submitDoubt(preset);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtText.trim() || isSolving) return;
    submitDoubt(doubtText.trim());
    setDoubtText("");
  };

  const submitDoubt = async (text: string) => {
    setErrorStatus(null);
    
    // Check SaaS limits
    if (!session.isPremium && doubtsLeft <= 0) {
      onOpenPricing();
      return;
    }

    // Add user message immediately to the UI
    const userMsg: DoubtMessage = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      role: "user",
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsSolving(true);

    try {
      const response = await fetch("/api/doubt-solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalQuery,
          originalContext: {
            simpleExplanation: originalAnswer.simpleExplanation,
            quickRevision: originalAnswer.quickRevision,
          },
          doubt: text,
          chatHistory: messages.map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "The doubt solver experienced an error processing that question.");
      }

      const result: DoubtSolveResult = data;

      // Add assistant response to the UI
      const assistantMsg: DoubtMessage = {
        id: "ai_" + Math.random().toString(36).substring(2, 9),
        role: "assistant",
        text: result.explanation,
        isQuickCheck: !!result.quickCheckQuestion,
        quickCheck: result.quickCheckQuestion
          ? {
              question: result.quickCheckQuestion,
              correctAnswer: result.quickCheckAnswer,
            }
          : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      
      if (!session.isPremium) {
        onSpendDoubt();
      }
    } catch (err: any) {
      console.error(err);
      setErrorStatus(err.message || "Failed to reach AI Doubt solver. Please verify the backend status.");
    } finally {
      setIsSolving(false);
    }
  };

  const handleQuickCheckAnswer = (msgId: string, selection: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId || !m.quickCheck) return m;
        
        const correctNorm = m.quickCheck.correctAnswer.toLowerCase();
        // Check if correctNorm string contains the letter option (e.g. "a", "b") or matching text
        const isCorrect = correctNorm.includes(selection.toLowerCase()) || 
                          selection.toLowerCase().includes(correctNorm);

        return {
          ...m,
          quickCheck: {
            ...m.quickCheck,
            submittedAnswer: selection,
            isCorrect,
          },
        };
      })
    );
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-850 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
      
      {/* Doubt Solver Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white p-2.5 rounded-xl shadow-md">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-slate-800 dark:text-white text-base md:text-lg flex items-center gap-1.5">
              <span>AI Doubt Solver</span>
              <span className="text-[10px] bg-indigo-600 text-white font-sans font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                PRO ONLY
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Conduct root-cause analysis of your academic confusion
            </p>
          </div>
        </div>

        {/* Status Callout if Free Trial is Active */}
        {!session.isPremium && (
          <div className="bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 p-2.5 rounded-xl text-xs max-w-sm">
            <span className="font-bold text-indigo-700 dark:text-indigo-300">
              🆓 Daily Free Doubt Chat Limit:
            </span>{" "}
            <span className="text-slate-600 dark:text-slate-350">
              You have <strong className="text-indigo-600 dark:text-indigo-400">{doubtsLeft}</strong>/{totalDoubtsLimit} free chat responses left today. Resetting daily! (Generous limit for studying)
            </span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Suggested doubts prompts column (Left 1/3) */}
        <div className="lg:col-span-1 space-y-3">
          <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5" />
            <span>Suggested Doubts</span>
          </div>
          <div className="flex flex-wrap lg:flex-col gap-2">
            {originalAnswer.suggestedFollowUps && originalAnswer.suggestedFollowUps.map((preset, i) => (
              <button
                key={i}
                onClick={() => handlePresetClick(preset)}
                disabled={isSolving || (!session.isPremium && doubtsLeft <= 0)}
                className="text-left text-xs bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-150 dark:border-slate-800 p-3 rounded-xl transition-all text-slate-700 dark:text-slate-300 flex items-start gap-2 group disabled:opacity-60 max-w-full lg:max-w-none cursor-pointer"
              >
                <CornerDownRight className="h-3.5 w-3.5 mt-0.5 text-indigo-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                <span className="line-clamp-2 md:line-clamp-none">{preset}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Chat Console (Right 2/3) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col h-[420px] overflow-hidden">
          
          {/* Chat Messages Log */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 font-sans">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 p-8 space-y-2">
                <HelpCircle className="h-10 w-10 text-slate-300 dark:text-slate-700 animate-pulse" />
                <p className="font-semibold text-sm">Have a question about this topic?</p>
                <p className="text-xs max-w-xs">
                  Click any suggested doubt on the left or type your custom query below. Our Tutor-AI will find exactly where you are stuck!
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col max-w-[85%] ${
                    m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  }`}
                >
                  <span className="text-[10px] text-slate-400 mb-1 font-mono">
                    {m.role === "user" ? "You" : " Tutors AI Coach"}
                  </span>
                  
                  {/* Message Bubble */}
                  <div
                     className={`p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm border ${
                      m.role === "user"
                        ? "bg-indigo-600 text-white border-indigo-700 rounded-tr-none"
                        : "bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-200 border-slate-100 dark:border-slate-800 rounded-tl-none"
                    }`}
                  >
                    {m.text}
 
                    {/* Render Quick Quiz if answer exists and is unresolved */}
                    {m.role === "assistant" && m.isQuickCheck && m.quickCheck && (
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50 space-y-3">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>AI Quick Understanding Check:</span>
                        </span>
                        
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                          {m.quickCheck.question}
                        </p>
                        
                        {!m.quickCheck.submittedAnswer ? (
                          <div className="grid grid-cols-2 gap-2 pt-1.5">
                            {["A", "B", "True", "False"].map((opt) => (
                              <button
                                key={opt}
                                onClick={() => handleQuickCheckAnswer(m.id, opt)}
                                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-xs rounded-xl hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-slate-700 dark:text-slate-300 font-semibold transition-all shadow-sm cursor-pointer"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-2.5 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/30 text-xs text-slate-800 dark:text-slate-100">
                            <span className="font-bold block mb-1">
                              Your answer: {m.quickCheck.submittedAnswer} •{" "}
                              {m.quickCheck.isCorrect ? (
                                <span className="text-emerald-600 dark:text-emerald-400 animate-bounce">Excellent! You got it right! 🎉</span>
                              ) : (
                                <span className="text-rose-600 dark:text-rose-400">Doubt review point! 💡</span>
                              )}
                            </span>
                            <span className="block text-slate-500 dark:text-slate-450">
                              <strong className="text-slate-700 dark:text-slate-300">Explanation: </strong>
                              {m.quickCheck.correctAnswer}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
 
            {isSolving && (
              <div className="mr-auto max-w-[85%] flex flex-col items-start">
                <span className="text-[10px] text-slate-400 mb-1 font-mono">Tutors AI Coach</span>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-tl-none shadow-sm flex items-center gap-2">
                  <div className="flex gap-1 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-105"></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-210"></span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Conducting cognitive root-cause analysis...
                  </span>
                </div>
              </div>
            )}

            {errorStatus && (
              <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 text-xs p-3.5 rounded-xl text-rose-600 dark:text-rose-400">
                {errorStatus}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Typing box */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-2 relative items-center"
          >
            {/* Soft Lock overlay if Free user depleted the resolution */}
            {!session.isPremium && doubtsLeft <= 0 && (
              <div className="absolute inset-0 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-[2px] z-10 flex items-center justify-between px-4">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-sans">
                  <Lock className="h-4 w-4 text-indigo-500 shrink-0" />
                  <span>You've used all {totalDoubtsLimit} daily free doubts! Upgrade key to Student Pro for unlimited.</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenPricing}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow transition-all cursor-pointer"
                >
                  Unlock Unlimited
                </button>
              </div>
            )}

            <input
              type="text"
              value={doubtText}
              onChange={(e) => setDoubtText(e.target.value)}
              placeholder="e.g. why does this apply only in a vacuum?"
              disabled={isSolving}
              className="flex-grow bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-200"
            />
            <button
              type="submit"
              disabled={isSolving || !doubtText.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:active:scale-100 shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
