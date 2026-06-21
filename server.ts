import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load local environment variables if available
dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy-loaded Gemini AI client to prevent startup crashes if GEMINI_API_KEY is not defined
let aiInstance: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required but missing in secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Ensure the server doesn't crash on standard errors
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// ==================== API ROUTES ====================

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Main endpoint: Decode an academic query or question
app.post("/api/decode", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "Please enter a valid search query or study question." });
    }

    const ai = getGemini();
    
    const prompt = `You are a friendly, expert, and highly motivational AI School Coach & Tutor.
A student is searching for this query/concept: "${query.substring(0, 500)}"
Deconstruct this concept and convert it into 4 educational learning formats exactly following the requested JSON schema.
- 'simpleExplanation': Explain it to a 12-year-old student. Use encouraging and clean language. Keep it engaging, include an intuitive real-world analogy.
- 'examAnswer': Provide a structured, formal, academic answer optimized for scoring full marks. Include sections like Definition, Core Concepts, Step-by-Step Mechanics, and Important Key Terminology. Use Markdown elements such as headers inside the string for gorgeous styling.
- 'realLifeExample': Create a relatable and immersive real-world scenario showing how the concept works in action.
- 'quickRevision': Provide 4 to 5 punchy bullet points summarizing memory triggers, plus 1 common trap/illusion/misconception of this topic to avoid.
- 'suggestedFollowUps': Provide exactly 3 natural follow-ups or queries a student might ask because they are confused or want to dig deeper. Use friendly student phrasing.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the primary engine for 'Google Search Decoder for Students', an educational SaaS. Your tone is warm, highly supportive, clear, structured, and motivational.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            simpleExplanation: {
              type: Type.STRING,
              description: "Intuitive explanation with a motivational tone, including a paragraph break and a clear analogy.",
            },
            examAnswer: {
              type: Type.STRING,
              description: "Structured markdown study guide with definition, key points, and terminology section.",
            },
            realLifeExample: {
              type: Type.STRING,
              description: "Step-by-step relatable real-world example.",
            },
            quickRevision: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "4-5 punchy review points and 1 trap summary.",
            },
            suggestedFollowUps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exactly 3 follow-up questions for Doubt Solver.",
            },
          },
          required: ["simpleExplanation", "examAnswer", "realLifeExample", "quickRevision", "suggestedFollowUps"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No responses received from the AI model.");
    }

    const parsedResult = JSON.parse(resultText);
    res.json(parsedResult);
  } catch (error: any) {
    console.error("Decoding error:", error);
    res.status(500).json({
      error: error.message || "Failed to decode the query. Please verify your Gemini API key or try again later.",
    });
  }
});

// Doubt Solver endpoint: Resolve a student's confusion
app.post("/api/doubt-solve", async (req, res) => {
  try {
    const { originalQuery, originalContext, doubt, chatHistory } = req.body;
    if (!doubt || typeof doubt !== "string" || !doubt.trim()) {
      return res.status(400).json({ error: "Please express your doubt so the AI can help!" });
    }

    const ai = getGemini();

    const historyPrompt = chatHistory && chatHistory.length > 0
      ? `Previous conversation history with developer/student:\n${chatHistory.map((h: any) => `${h.role === "user" ? "Student" : "Coach"}: ${h.text}`).join("\n")}`
      : "";

    const prompt = `You are the AI Doubt Solver inside the 'Google Search Decoder for Students' platform.
A student is studying the topic/question: "${originalQuery}"
They received this primary context summaries: "${originalContext ? JSON.stringify(originalContext).substring(0, 800) : "N/A"}"

Now, the student has run into a doubt/point of confusion:
"${doubt}"

${historyPrompt}

Your task:
1. Conduct a "root cause analysis" of their confusion. Be very empathetic, saying things like 'It is completely normal to find this confusing because...' or 'Many students get tripped up here!'
2. Explain the solution to their doubt in a clean, step-by-step format without jargon.
3. Formulate a simple 'quickCheckQuestion' (Multiple Choice or True/False) to test their understanding based exactly on your correction.
4. Provide the correct answer in 'quickCheckAnswer' with a 1-sentence encouraging justification.

Output exactly following the requested JSON schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the AI Doubt Solver. You diagnose the psychological root cause of student confusion, explain beautifully, and make them feel smart.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: {
              type: Type.STRING,
              description: "Empathetic analysis of confusion, followed by neat step-by-step resolution of the doubt.",
            },
            quickCheckQuestion: {
              type: Type.STRING,
              description: "A simple multiple-choice or True/False question directly testing the doubt.",
            },
            quickCheckAnswer: {
              type: Type.STRING,
              description: "The correct answer value (e.g. A, B, or Option) and a short supportive reason.",
            },
          },
          required: ["explanation", "quickCheckQuestion", "quickCheckAnswer"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response received from the Doubt Solver model.");
    }

    const parsedResult = JSON.parse(resultText);
    res.json(parsedResult);
  } catch (error: any) {
    console.error("Doubt resolution error:", error);
    res.status(500).json({
      error: error.message || "Failed to solve the doubt. Please try again.",
    });
  }
});


// ==================== VITE MIDDLEWARE SETUP ====================

const startServer = async () => {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
