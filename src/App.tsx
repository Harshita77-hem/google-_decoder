import React, { useState, useEffect } from "react";
import {
  Search,
  BookOpen,
  Sparkles,
  History,
  Trash2,
  Lock,
  Unlock,
  AlertCircle,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { DecodedAnswer, SearchHistoryItem, UserSession } from "./types";
import Header from "./components/Header";
import PricingModal from "./components/PricingModal";
import ResultsDisplay from "./components/ResultsDisplay";
import DoubtSolver from "./components/DoubtSolver";

const SUGGESTED_QUERIES = [
  { text: "Why is mitochondria the powerhouse of the cell?", subject: "Biology", emoji: "💡" },
  { text: "Explain Schrödinger's Cat simply.", subject: "Quantum Physics", emoji: "⚛️" },
  { text: "Simplify the Law of Diminishing Marginal Utility.", subject: "Economics", emoji: "📊" },
  { text: "Explain Newton's Third Law with a balloon scenario.", subject: "Physics", emoji: "🍎" },
  { text: "How does Photosynthesis convert light to glucose?", subject: "Chemistry/Bio", emoji: "🌿" },
];

const LOADING_MOTIVATIONAL_QUOTES = [
  "Translating complex textbook jargon into clear student language...",
  "Formatting high-impact Quick Revision flashcards...",
  "Did you know? Spaced repetition can improve retention by up to 200%!",
  "Deconstructing abstract principles into intuitive, real-world analogies...",
  "Structuring mark-scoring grids and Exam terminologies...",
  "Tutors Fact: The best way to learn is to explain the concept to a 10-year-old!",
];

const getTodayDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function App() {
  // --- States ---
  const [session, setSession] = useState<UserSession>(() => {
    const todayStr = getTodayDateString();
    const saved = localStorage.getItem("gdecoder_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure new properties exist or are reset if there is a date mismatch
        if (!parsed.isPremium && parsed.lastResetDate !== todayStr) {
          return {
            ...parsed,
            searchesLeft: 15,
            totalLimit: 15,
            doubtsLeft: 10,
            totalDoubtsLimit: 10,
            lastResetDate: todayStr,
          };
        }
        // Force upgrade old (5) limits to (15) so returning users get the newly increased limits
        if (!parsed.isPremium && (parsed.totalLimit === 5 || !parsed.doubtsLeft)) {
          return {
            ...parsed,
            searchesLeft: Math.max(parsed.searchesLeft || 0, 15),
            totalLimit: 15,
            doubtsLeft: Math.max(parsed.doubtsLeft || 0, 10),
            totalDoubtsLimit: 10,
            lastResetDate: parsed.lastResetDate || todayStr,
          };
        }
        return parsed;
      } catch (e) {
        // Fallback
      }
    }
    return {
      searchesLeft: 15,
      totalLimit: 15,
      isPremium: false,
      tier: "Free Student",
      lastResetDate: todayStr,
      doubtsLeft: 10,
      totalDoubtsLimit: 10,
    };
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("gdecoder_dark");
    if (saved) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const [inputQuery, setInputQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState<DecodedAnswer | null>(null);
  
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>(() => {
    const saved = localStorage.getItem("gdecoder_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  // --- Effects ---
  // Periodically check/apply daily reset if calendar day rolls over while page is open
  useEffect(() => {
    const todayStr = getTodayDateString();
    if (!session.isPremium && session.lastResetDate !== todayStr) {
      setSession((prev) => ({
        ...prev,
        searchesLeft: 15,
        totalLimit: 15,
        doubtsLeft: 10,
        totalDoubtsLimit: 10,
        lastResetDate: todayStr,
      }));
    }
  }, [session.isPremium, session.lastResetDate]);

  // Apply dark mode class to html document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("gdecoder_dark", String(darkMode));
  }, [darkMode]);

  // Keep session synced
  useEffect(() => {
    localStorage.setItem("gdecoder_session", JSON.stringify(session));
  }, [session]);

  // Keep search history synced
  useEffect(() => {
    localStorage.setItem("gdecoder_history", JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Cycle comments during loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingQuote(LOADING_MOTIVATIONAL_QUOTES[0]);
      let idx = 1;
      interval = setInterval(() => {
        setLoadingQuote(LOADING_MOTIVATIONAL_QUOTES[idx % LOADING_MOTIVATIONAL_QUOTES.length]);
        idx++;
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // --- Handlers ---
  const handleCheckoutUpgrade = (tier: "Basic Pro" | "Student Pro") => {
    setSession((prev) => ({
      ...prev,
      isPremium: true,
      tier,
    }));
    setIsPricingOpen(false);
  };

  const handleResetSearches = () => {
    setSession((prev) => ({
      ...prev,
      searchesLeft: 15,
      doubtsLeft: 10,
    }));
  };

  const handleToggleDemoPremium = () => {
    setSession((prev) => {
      const enablePremium = !prev.isPremium;
      return {
        ...prev,
        isPremium: enablePremium,
        tier: enablePremium ? "Student Pro" : "Free Student",
        searchesLeft: enablePremium ? 9999 : 15,
        doubtsLeft: enablePremium ? 9999 : 10,
      };
    });
  };

  const submitSearch = async (queryText: string) => {
    const cleanQuery = queryText.trim();
    if (!cleanQuery) return;

    // Flush any prior errors
    setErrorMessage(null);

    // Check query limit for non-premium users
    if (!session.isPremium && session.searchesLeft <= 0) {
      setIsPricingOpen(true);
      return;
    }

    setIsLoading(true);
    setInputQuery(cleanQuery);
    setActiveQuery(cleanQuery);

    try {
      const response = await fetch("/api/decode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: cleanQuery }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Server error while decoding. Please verify parameters.");
      }

      const decodedResult: DecodedAnswer = data;
      setCurrentAnswer(decodedResult);

      // Decrement searches if they are on a free tier
      if (!session.isPremium) {
        setSession((prev) => ({
          ...prev,
          searchesLeft: Math.max(0, prev.searchesLeft - 1),
        }));
      }

      // Add to search history if not already present
      setSearchHistory((prev) => {
        const filtered = prev.filter((item) => item.query.toLowerCase() !== cleanQuery.toLowerCase());
        const newItem: SearchHistoryItem = {
          id: "hist_" + Math.random().toString(36).substring(2, 9),
          query: cleanQuery,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          answer: decodedResult,
        };
        return [newItem, ...filtered].slice(0, 8); // Store last 8 items
      });

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to contact proxy service. Verify GEMINI_API_KEY secret exists.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    submitSearch(inputQuery);
  };

  const handleSelectHistoryItem = (item: SearchHistoryItem) => {
    setErrorMessage(null);
    setInputQuery(item.query);
    setActiveQuery(item.query);
    setCurrentAnswer(item.answer);
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Header */}
      <Header
        session={session}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenPricing={() => setIsPricingOpen(true)}
        onResetSearches={handleResetSearches}
        onToggleDemoPremium={handleToggleDemoPremium}
      />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
        {/* Google-like logo and introduction when there are no active results */}
        <AnimatePresence mode="wait">
          {!currentAnswer && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-2xl text-center mb-8 md:mb-12 mt-4 md:mt-12"
            >
              <div className="flex justify-center items-center gap-1.5 mb-3 text-indigo-600 dark:text-indigo-400 font-display font-medium text-sm tracking-wider uppercase">
                <Sparkles className="h-4 w-4 fill-indigo-500/20" />
                <span>AI Academic Study Decoder</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white tracking-tight leading-none mb-4">
                Google Search <br className="xs:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-600 to-amber-500">
                  Decoder
                </span>
                <span className="text-slate-450 dark:text-slate-300 font-light font-sans text-3xl md:text-4xl"> for Students</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-450 font-sans max-w-lg mx-auto text-sm md:text-base leading-relaxed">
                Deconstruct abstract syllabus notes, tricky diagrams, formulas and homework questions into 4 student-ready visual study guides.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Search Bar Console */}
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSearchSubmitForm} className="relative z-10 w-full">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-slate-800 rounded-2xl p-2 pl-4 shadow-sm focus-within:border-indigo-400 dark:focus-within:border-indigo-500 transition-all">
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Paste an exam doubt or topic (e.g. cellular respiration, calculus derivative...)"
                className="flex-grow text-slate-850 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-sm md:text-base"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputQuery.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold font-sans text-xs md:text-sm py-2.5 px-6 rounded-xl shadow-md transition-all whitespace-nowrap cursor-pointer"
              >
                Decode Now
              </button>
            </div>
          </form>

          {!session.isPremium && (
            <div className="flex items-center gap-2.5 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/30 rounded-xl px-4 py-2.5 mt-4 text-[11px] md:text-xs text-slate-600 dark:text-slate-450 font-sans text-center justify-center max-w-lg mx-auto shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500 fill-indigo-500/30 animate-pulse shrink-0" />
              <span>
                <strong>Higher free tier limits than ChatGPT &amp; Claude!</strong> Get <strong>15 free daily decodes</strong> &amp; <strong>10 doubt solver chats</strong> resetting every 24 hours ({session.searchesLeft} decodes left today).
              </span>
            </div>
          )}

          {/* Search Suggestion Buttons when no active results */}
          {!currentAnswer && !isLoading && (
            <div className="mt-8 space-y-4 text-center">
              <span className="text-xs font-mono text-slate-450 dark:text-slate-500 uppercase tracking-widest block">
                ⭐ Try one-click Academic suggestions
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {SUGGESTED_QUERIES.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputQuery(query.text);
                      submitSearch(query.text);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-slate-800 rounded-md cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-slate-800 shadow-sm transition-all"
                  >
                    <span>{query.emoji}</span>
                    <span>{query.text}</span>
                    <span className="text-[9px] bg-indigo-50 dark:bg-slate-800 text-indigo-500/80 px-1.5 py-0.5 rounded font-bold font-mono">
                      {query.subject}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Loading Spinner & motivational microquotes */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl text-center py-16 px-6 font-sans space-y-6"
            >
              <div className="relative mx-auto w-16 h-16">
                {/* Orbital Spinner effect */}
                <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="space-y-2">
                <h4 className="font-display font-extrabold text-slate-900 dark:text-white text-base">
                  Studying Search query: "{activeQuery}"
                </h4>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider animate-pulse font-mono">
                  Running Gemini 3.5 Decoder pipeline
                </p>
                <div className="h-6 overflow-hidden max-w-md mx-auto">
                  <motion.p
                    key={loadingQuote}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-xs text-slate-500 dark:text-slate-400 italic"
                  >
                    {loadingQuote}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Callout */}
        {errorMessage && (
          <div className="w-full max-w-2xl bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/50 p-4 rounded-2xl flex items-start gap-3 mt-6 font-sans text-rose-700 dark:text-rose-400">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong className="block font-bold mb-1">Decoding Pipeline Blocked</strong>
              {errorMessage}
            </div>
          </div>
        )}

        {/* Results Page Layout */}
        {!isLoading && currentAnswer && (
          <div className="w-full mt-8 space-y-12">
            
            {/* Primary decoded 4Cards bento display */}
            <ResultsDisplay
              answer={currentAnswer}
              query={activeQuery}
              session={session}
              onOpenPricing={() => setIsPricingOpen(true)}
              onRegenerate={() => submitSearch(activeQuery)}
              isLoading={isLoading}
            />

            {/* Context-aware Doubt solver console */}
            <DoubtSolver
              originalQuery={activeQuery}
              originalAnswer={currentAnswer}
              session={session}
              onOpenPricing={() => setIsPricingOpen(true)}
              onSpendDoubt={() => {
                setSession((prev) => ({
                  ...prev,
                  doubtsLeft: Math.max(0, (prev.doubtsLeft ?? 10) - 1),
                }));
              }}
            />

            {/* Clean bottom search bar allowing students to search anew */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col items-center gap-4 text-center">
              <div>
                <h4 className="font-display font-bold text-slate-900 dark:text-white text-base">
                  Got another Academic Doubt?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Search another question above anytime to decode it.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Search Study Cards Log (History) */}
        {!isLoading && searchHistory.length > 0 && (
          <div className="w-full max-w-2xl mt-12 pt-8 border-t border-slate-200 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <div className="flex items-center gap-1.5 font-mono">
                <History className="h-4 w-4" />
                <span>Your Decoded Study Cards ({searchHistory.length})</span>
              </div>
              <button
                onClick={handleClearHistory}
                className="text-slate-400 hover:text-rose-500 flex items-center gap-1 font-sans font-medium hover:underline lowercase"
                title="Clear all local search history summaries"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear</span>
              </button>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
              {searchHistory.map((historyItem) => (
                <div
                  key={historyItem.id}
                  onClick={() => handleSelectHistoryItem(historyItem)}
                  className={`p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-750 border rounded-2xl cursor-pointer text-left transition-all ${
                    activeQuery.toLowerCase() === historyItem.query.toLowerCase()
                      ? "border-blue-500 dark:border-blue-500 shadow-sm"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900 dark:text-white capitalize truncate">
                    {historyItem.query}
                  </p>
                  <div className="flex items-center justify-between mt-2.5 text-[10px] text-slate-400 font-mono">
                    <span>{historyItem.timestamp}</span>
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-blue-500">
                      View Study Guide
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Premium Upgrading billing modal */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onUpgrade={handleCheckoutUpgrade}
        currentTier={session.tier}
      />

      {/* Footer copyright */}
      <footer className="border-t border-slate-200 dark:border-slate-850 py-6 px-4 bg-white/50 dark:bg-slate-950/50 mt-12 text-center text-xs text-slate-400 dark:text-slate-500 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Google Search Decoder for Students. Inspired by Google AI Education.</p>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Education Terms</span>
            <span className="hover:underline cursor-pointer">Tutor Policy</span>
            <span className="hover:underline cursor-pointer" onClick={() => setIsPricingOpen(true)}>Upgrade Info</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
