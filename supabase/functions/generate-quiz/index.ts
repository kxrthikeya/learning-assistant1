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
    const geminiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiKey) {
      throw new Error('Gemini API key not configured in Secrets');
    }

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const difficultyGuidance = {
      easy: 'Conceptual understanding and basic principles.',
      medium: 'Application-based problems requiring multi-step logic.',
      hard: `GATE/JEE/ESE level complexity. Focus on:
1. Numerical problem solving (derive values).
2. Advanced analytical reasoning.
3. Conceptual traps where options are mathematically or theoretically close.
4. Higher-order thinking (Bloom's Taxonomy Analysis/Synthesis).`
    };

    const systemPrompt = `You are a Senior Engineering Professor generating a high-stakes competitive exam (like GATE or IES).
Create ${count} highly challenging MCQs based ONLY on this syllabus/content:
${summary}

STRICT EXAM RULES:
- Difficulty: ${difficulty.toUpperCase()}
- Level: ${difficultyGuidance[difficulty]}
- Format: Return ONLY a valid JSON array of objects.
- Each object: {"question": string, "options": [string, string, string, string], "correctIndex": number, "explanation": string, "difficulty": string}
- NO trivial recall. NO "What is..." questions.
- Distractors must be plausible (e.g., if it's a numerical, one distractor should be the result if a common formula error is made).
- Explanation must include the derivation or logic used.`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const content = response.text() || '[]';

    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const questions = JSON.parse(cleanContent);

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
