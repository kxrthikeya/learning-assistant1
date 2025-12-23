import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
    const { syllabusText, paperTexts } = await req.json();
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert exam analyzer. Analyze past papers and syllabus to identify patterns. Return JSON with "topics" array (each with name, frequency, totalMarks, yearsAppeared) and "repeatedQuestions" array.',
          },
          {
            role: 'user',
            content: `Analyze this syllabus and past papers to identify patterns:\n\nSyllabus:\n${syllabusText}\n\nPast Papers:\n${paperTexts.join('\n---\n')}\n\nReturn JSON only.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '{}';
    
    let patterns = { topics: [], repeatedQuestions: [] };
    try {
      patterns = JSON.parse(content);
    } catch {
      patterns = { topics: [], repeatedQuestions: [] };
    }

    return new Response(JSON.stringify({ patterns }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message, patterns: { topics: [], repeatedQuestions: [] } }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
