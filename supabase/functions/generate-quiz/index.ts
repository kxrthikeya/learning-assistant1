import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { summary, difficulty, count } = await req.json();
    const geminiKey = Deno.env.get('VITE_GEMINI_API_KEY');

    if (!geminiKey) {
      throw new Error('Gemini API key not configured');
    }

    const difficultyGuidance = {
      easy: 'Create questions that test understanding of fundamental concepts with minimal complexity. Questions should be clear and straightforward.',
      medium: 'Create questions that require application of concepts and moderate reasoning. Include some numerical problems where applicable.',
      hard: 'Create HARD, exam-oriented questions that require deep analysis, multi-step thinking, and application. Focus on numerical problems, conceptual traps, and "best option" reasoning. Avoid trivial recall questions.',
    };

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `You are an exam-focused quiz generator for engineering students. Generate multiple-choice questions that strictly follow the instructions below.

### Exam & Syllabus
- Generate exam-quality questions suitable for engineering courses (B.Tech, GATE, competitive exams)
- Use ONLY concepts from the provided notes/content below. Do not introduce out-of-syllabus topics.
- Questions should be relevant to engineering disciplines (CSE, ECE, Mechanical, etc.)

### Difficulty & Style
- Difficulty level: ${difficulty.toUpperCase()}
- ${difficultyGuidance[difficulty]}
- Focus on application, reasoning, and multi-step thinking, not simple definitions or direct memory recall
- Avoid trivial questions like "What is [term]?" or pure memorization
- Prefer numerical problems, conceptual traps, and "best option" reasoning where applicable
- Questions should test understanding, not just recognition

### Output Format
- Generate ${count} MCQs
- Return as JSON array with fields: "question", "options" (array of 4 strings), "correctIndex" (0-3), "explanation", "difficulty"
- Explanation should justify why the correct answer is right and why others are wrong

### Self-check
- Rate each question's actual difficulty internally
- If any question is too easy (simple recall/definition) or not clearly linked to provided content, replace it with a harder, more relevant one
- Ensure questions are unambiguous and have only one clearly correct answer

### Content to Generate Questions From:
${summary}

Return ONLY the JSON array, no additional text or markdown.`;

    const prompt = systemPrompt;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text() || '[]';

    let questions = [];
    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      questions = JSON.parse(cleanContent);
    } catch {
      questions = [];
    }

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message, questions: [] }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});