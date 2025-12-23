import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { summary, difficulty, count } = await req.json();
    const geminiKey = Deno.env.get('VITE_GEMINI_API_KEY') || Deno.env.get('GEMINI_API_KEY');

    if (!geminiKey) {
      throw new Error('Gemini API key not configured');
    }

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const difficultyGuidance = {
      easy: 'Basic recall and definitions. Straightforward questions.',
      medium: 'Application of concepts and moderate reasoning. Multi-step logic.',
      hard: 'Advanced analysis, complex engineering problems, numerical calculations, and conceptual traps. High difficulty for competitive exams like GATE/JEE.'
    };

    const systemPrompt = `You are a high-level engineering exam generator.
Create ${count} challenging MCQs based ONLY on the following content:
${summary}

GUIDELINES:
- Difficulty: ${difficulty.toUpperCase()}
- Strategy: ${difficultyGuidance[difficulty]}
- Format: Strictly valid JSON array.
- Fields per object: "question", "options" (4 strings), "correctIndex" (0-3), "explanation", "difficulty".
- Requirements: No markdown, no extra text. Just the JSON array.
- Quality: Ensure options are plausible but only one is correct. Add detailed explanations.`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const content = response.text() || '[]';
    
    let questions = [];
    try {
      const cleanContent = content.replace(/```json
?/g, '').replace(/```
?/g, '').trim();
      questions = JSON.parse(cleanContent);
    } catch (e) {
      console.error("JSON parse error:", e, content);
      throw new Error("Invalid response format from AI");
    }

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message, questions: [] }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
