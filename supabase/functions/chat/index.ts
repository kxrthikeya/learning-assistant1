import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { message, history } = await req.json() as { message: string; history?: Message[] };

    if (!message || typeof message !== 'string') {
      throw new Error('Invalid message format');
    }

    const geminiKey = Deno.env.get('VITE_GEMINI_API_KEY');

    if (!geminiKey) {
      throw new Error('Gemini API key not configured. Please contact support.');
    }

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      apiVersion: "v1"
    });

    let conversationContext = '';
    if (history && history.length > 0) {
      conversationContext = history
        .slice(-6)
        .map(msg => `${msg.role === 'user' ? 'Student' : 'Study Buddy'}: ${msg.content}`)
        .join('\n') + '\n\n';
    }

    const systemPrompt = `You are an AI Study Buddy for EaseStudy, a learning platform focused on thermodynamics and engineering concepts. Your role is to:

1. Help students understand thermodynamics, heat transfer, energy systems, and related engineering topics
2. Answer questions clearly and concisely (2-3 paragraphs max unless more detail is requested)
3. Use simple language and provide real-world examples when helpful
4. Break down complex concepts into digestible parts
5. Encourage critical thinking by asking follow-up questions when appropriate
6. Be friendly, patient, and supportive

Keep responses focused and avoid overly long explanations unless the student specifically asks for more detail.

${conversationContext}Student: ${message}

Study Buddy:`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const reply = response.text() || 'I apologize, but I could not generate a response. Please try rephrasing your question.';

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Chat function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process chat request';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});