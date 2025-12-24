import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface QuizRequest {
  syllabus: string;
  numQuestions: number;
  difficulty: "easy" | "medium" | "hard";
  bloomLevel: "REMEMBER" | "UNDERSTAND" | "APPLY" | "ANALYZE" | "EVALUATE" | "CREATE";
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

interface GroqChatMessage {
  role: "system" | "user";
  content: string;
}

/**
 * Splits syllabus into manageable chunks for processing
 * Each chunk is approximately 2000-3000 characters
 */
function chunkSyllabus(syllabus: string, maxChunkSize = 3000): string[] {
  const lines = syllabus.split(/\n+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const line of lines) {
    if (currentChunk.length + line.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = line;
    } else {
      currentChunk += (currentChunk ? "\n" : "") + line;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [syllabus];
}

/**
 * Builds the Groq API prompt for generating quiz questions
 */
function buildGroqPrompt(
  chunk: string,
  numQuestions: number,
  difficulty: string,
  bloomLevel: string
): GroqChatMessage[] {
  const bloomDescriptions = {
    REMEMBER: "Recall facts, terms, and basic concepts",
    UNDERSTAND: "Explain ideas and concepts",
    APPLY: "Use information in new situations",
    ANALYZE: "Draw connections and distinguish between different parts",
    EVALUATE: "Justify decisions and assess value",
    CREATE: "Produce new or original work",
  };

  const systemMessage = `You are an expert exam setter. You only create multiple-choice questions that can be answered strictly from the given syllabus text. If something is not covered in the syllabus, you must not ask about it.`;

  const userMessage = `Syllabus chunk:

${chunk}

Task: Generate ${numQuestions} multiple-choice questions strictly based on this syllabus chunk.

Requirements:
- Difficulty: ${difficulty}
- Cognitive level (Bloom's Taxonomy): ${bloomLevel} - ${bloomDescriptions[bloomLevel] || ""}
- Each question must be answerable only from the syllabus chunk
- Each question must focus on an important concept from the syllabus
- Exactly 4 options per question (A, B, C, D) in a plain string array
- Exactly one correct option
- Distractors must be plausible but clearly wrong given the syllabus
- Provide a brief explanation referencing the syllabus text

Output VALID JSON in this exact format and nothing else:

{
  "questions": [
    {
      "question": "...",
      "options": ["...","...","...","..."],
      "correct_index": 0,
      "explanation": "..."
    }
  ]
}`;

  return [
    { role: "system", content: systemMessage },
    { role: "user", content: userMessage },
  ];
}

/**
 * Validates and filters quiz questions
 * Returns only well-formed questions
 */
function validateQuestions(rawQuestions: unknown): QuizQuestion[] {
  if (!Array.isArray(rawQuestions)) {
    return [];
  }

  const validQuestions: QuizQuestion[] = [];
  const seenQuestions = new Set<string>();

  for (const item of rawQuestions) {
    if (
      typeof item === "object" &&
      item !== null &&
      typeof item.question === "string" &&
      item.question.trim().length > 0 &&
      Array.isArray(item.options) &&
      item.options.length === 4 &&
      item.options.every((opt: unknown) => typeof opt === "string" && opt.trim().length > 0) &&
      typeof item.correct_index === "number" &&
      item.correct_index >= 0 &&
      item.correct_index <= 3 &&
      typeof item.explanation === "string" &&
      item.explanation.trim().length > 0
    ) {
      const normalizedQuestion = item.question.toLowerCase().trim();
      
      if (!seenQuestions.has(normalizedQuestion)) {
        seenQuestions.add(normalizedQuestion);
        validQuestions.push({
          question: item.question.trim(),
          options: item.options.map((opt: string) => opt.trim()),
          correct_index: item.correct_index,
          explanation: item.explanation.trim(),
        });
      }
    }
  }

  return validQuestions;
}

/**
 * Calls Groq API to generate quiz questions
 */
async function callGroqAPI(
  messages: GroqChatMessage[],
  apiKey: string
): Promise<unknown> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-70b-versatile",
      messages,
      temperature: 0.5,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No content returned from Groq API");
  }

  return JSON.parse(content);
}

/**
 * Attempts to fix malformed JSON by making another Groq API call
 */
async function fixMalformedJSON(
  rawText: string,
  apiKey: string
): Promise<unknown> {
  const messages: GroqChatMessage[] = [
    {
      role: "system",
      content: "You are a JSON formatter. Convert the given text to valid JSON.",
    },
    {
      role: "user",
      content: `Convert this text to valid JSON following this schema:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correct_index": number,
      "explanation": "string"
    }
  ]
}

Text to convert:
${rawText}`,
    },
  ];

  return await callGroqAPI(messages, apiKey);
}

/**
 * Main handler for the edge function
 * 
 * Example usage from frontend:
 * 
 * const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-quiz-groq`, {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
 *   },
 *   body: JSON.stringify({
 *     syllabus: 'Your syllabus text here...',
 *     numQuestions: 10,
 *     difficulty: 'medium',
 *     bloomLevel: 'UNDERSTAND'
 *   })
 * });
 * const { questions } = await response.json();
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json() as QuizRequest;
    const { syllabus, numQuestions, difficulty, bloomLevel } = body;

    if (!syllabus || !syllabus.trim()) {
      throw new Error("Syllabus text is required");
    }

    if (!numQuestions || numQuestions < 1 || numQuestions > 50) {
      throw new Error("numQuestions must be between 1 and 50");
    }

    if (!difficulty || !["easy", "medium", "hard"].includes(difficulty)) {
      throw new Error("difficulty must be 'easy', 'medium', or 'hard'");
    }

    if (
      !bloomLevel ||
      !["REMEMBER", "UNDERSTAND", "APPLY", "ANALYZE", "EVALUATE", "CREATE"].includes(bloomLevel)
    ) {
      throw new Error("bloomLevel must be a valid Bloom's Taxonomy level");
    }

    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY not configured in Secrets");
    }

    const chunks = chunkSyllabus(syllabus);
    const limitedChunks = numQuestions <= 5 ? chunks.slice(0, 1) : chunks.slice(0, 2);
    
    const questionsPerChunk = Math.ceil(numQuestions / limitedChunks.length);
    
    const allQuestions: QuizQuestion[] = [];

    for (const chunk of limitedChunks) {
      try {
        const messages = buildGroqPrompt(chunk, questionsPerChunk, difficulty, bloomLevel);
        
        let parsedData: unknown;
        try {
          parsedData = await callGroqAPI(messages, groqApiKey);
        } catch (error) {
          console.error("Groq API call failed:", error.message);
          continue;
        }

        let questionsArray: unknown;
        if (typeof parsedData === "object" && parsedData !== null && "questions" in parsedData) {
          questionsArray = parsedData.questions;
        } else {
          try {
            const fixedData = await fixMalformedJSON(JSON.stringify(parsedData), groqApiKey);
            if (typeof fixedData === "object" && fixedData !== null && "questions" in fixedData) {
              questionsArray = fixedData.questions;
            }
          } catch (fixError) {
            console.error("Failed to fix malformed JSON:", fixError.message);
            continue;
          }
        }

        const validQuestions = validateQuestions(questionsArray);
        allQuestions.push(...validQuestions);

        if (allQuestions.length >= numQuestions) {
          break;
        }
      } catch (chunkError) {
        console.error("Error processing chunk:", chunkError.message);
        continue;
      }
    }

    const finalQuestions = allQuestions.slice(0, numQuestions);

    if (finalQuestions.length === 0) {
      throw new Error("Failed to generate any valid questions");
    }

    return new Response(
      JSON.stringify({ questions: finalQuestions }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
