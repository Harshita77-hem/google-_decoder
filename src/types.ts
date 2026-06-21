export interface DecodedAnswer {
  simpleExplanation: string;
  examAnswer: string;
  realLifeExample: string;
  quickRevision: string[];
  suggestedFollowUps: string[];
}

export interface DoubtSolveResult {
  explanation: string;
  quickCheckQuestion: string;
  quickCheckAnswer: string;
}

export interface DoubtMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  isQuickCheck?: boolean;
  quickCheck?: {
    question: string;
    correctAnswer: string;
    submittedAnswer?: string;
    isCorrect?: boolean;
  };
}

export interface UserSession {
  searchesLeft: number;
  totalLimit: number;
  isPremium: boolean;
  tier: "Free Student" | "Student Pro" | "Basic Pro";
  lastResetDate?: string;
  doubtsLeft?: number;
  totalDoubtsLimit?: number;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  answer: DecodedAnswer;
}
