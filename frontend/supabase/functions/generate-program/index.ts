// @ts-nocheck

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

const SYSTEM_INSTRUCTION =
  "You are a fitness program generator. Return ONLY valid JSON. Do not include markdown, backticks, or commentary.";

const readUpstreamJson = async (res: Response) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const extractOpenAIStyleContent = (data: any) =>
  data?.choices?.[0]?.message?.content;

const extractGeminiContent = (data: any) => {
  const parts = data?.candidates?.[0]?.content?.parts;
  const text = Array.isArray(parts)
    ? parts.map((p: any) => p?.text).filter(Boolean).join("")
    : undefined;
  return text;
};

const callOpenAI = async (prompt: string) => {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) {
    return {
      ok: false,
      status: 500,
      error: "OPENAI_API_KEY is not set in Supabase secrets.",
    };
  }

  const model = Deno.env.get("OPENAI_MODEL") || "gpt-4o-mini";

  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    }),
  });

  const data = await readUpstreamJson(upstream);
  if (!upstream.ok) {
    return {
      ok: false,
      status: upstream.status || 502,
      error: data?.error?.message || "OpenAI request failed",
    };
  }

  const content = extractOpenAIStyleContent(data);
  if (!content || typeof content !== "string") {
    return { ok: false, status: 502, error: "OpenAI returned empty content" };
  }
  return { ok: true, status: 200, content };
};

// Groq provides an OpenAI-compatible API.
const callGroq = async (prompt: string) => {
  const groqKey = Deno.env.get("GROQ_API_KEY");
  if (!groqKey) {
    return {
      ok: false,
      status: 500,
      error: "GROQ_API_KEY is not set in Supabase secrets.",
    };
  }

  const model = Deno.env.get("GROQ_MODEL") || "llama-3.1-8b-instant";

  const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    }),
  });

  const data = await readUpstreamJson(upstream);
  if (!upstream.ok) {
    return {
      ok: false,
      status: upstream.status || 502,
      error: data?.error?.message || "Groq request failed",
    };
  }

  const content = extractOpenAIStyleContent(data);
  if (!content || typeof content !== "string") {
    return { ok: false, status: 502, error: "Groq returned empty content" };
  }
  return { ok: true, status: 200, content };
};

const callGemini = async (prompt: string) => {
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiKey) {
    return {
      ok: false,
      status: 500,
      error: "GEMINI_API_KEY is not set in Supabase secrets.",
    };
  }

  const model = Deno.env.get("GEMINI_MODEL") || "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;

  // For compatibility, we embed the system instruction into the user prompt.
  const combinedPrompt = `${SYSTEM_INSTRUCTION}\n\n${prompt}`;

  const upstream = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: combinedPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
      },
    }),
  });

  const data = await readUpstreamJson(upstream);
  if (!upstream.ok) {
    return {
      ok: false,
      status: upstream.status || 502,
      error: data?.error?.message || "Gemini request failed",
    };
  }

  const content = extractGeminiContent(data);
  if (!content || typeof content !== "string") {
    return { ok: false, status: 502, error: "Gemini returned empty content" };
  }
  return { ok: true, status: 200, content };
};

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    let payload: any = {};
    try {
      payload = await req.json();
    } catch {
      payload = {};
    }

    const prompt = payload?.prompt;
    if (!prompt || typeof prompt !== "string") {
      return json({ error: "'prompt' (string) is required" }, 400);
    }

    const provider = (Deno.env.get("LLM_PROVIDER") || "openai").toLowerCase();
    const result =
      provider === "openai"
        ? await callOpenAI(prompt)
        : provider === "groq" || provider === "grok"
          ? await callGroq(prompt)
          : provider === "gemini"
            ? await callGemini(prompt)
            : { ok: false, status: 400, error: `Unsupported LLM_PROVIDER: ${provider}` };

    if (!result.ok) {
      return json(
        { error: result.error, status: result.status, provider },
        result.status
      );
    }

    return json({ content: result.content, provider });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return json({ error: `Unhandled function error: ${message}` }, 500);
  }
});
