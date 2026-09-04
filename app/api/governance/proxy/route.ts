import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function isSafeUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname === '169.254.169.254' ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local')
    ) {
      return false;
    }
    // Check private IPv4 ranges
    const parts = hostname.split('.').map(Number);
    if (parts.length === 4 && parts.every(p => !isNaN(p) && p >= 0 && p <= 255)) {
      if (parts[0] === 10) return false;
      if (parts[0] === 127) return false;
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return false;
      if (parts[0] === 192 && parts[1] === 168) return false;
      if (parts[0] === 169 && parts[1] === 254) return false;
      if (parts[0] === 0) return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    // 1. Authenticate the caller session
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized: Please log in." }, { status: 401 });
    }

    const { prompt, provider, endpoint, model, apiKey } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
        return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    const startTime = Date.now();
    let text = "";
    let inTokens = 0;
    let outTokens = 0;
    let cost = 0.0;

    let activeKey = apiKey;
    const keyToUse = (activeKey && !activeKey.includes('•••') && activeKey.trim() !== "") ? activeKey.trim() : null;
    
    // Canonical safe endpoints
    const openAiBase = (endpoint && isSafeUrl(endpoint)) ? endpoint.replace(/\/+$/, '') : "https://api.openai.com/v1";
    const anthropicBase = (endpoint && isSafeUrl(endpoint)) ? endpoint.replace(/\/+$/, '') : "https://api.anthropic.com/v1";
    const geminiBase = (endpoint && isSafeUrl(endpoint)) ? endpoint.replace(/\/+$/, '') : "https://generativelanguage.googleapis.com";
    
    // Determine provider and call target endpoint using strictly client key
    if (provider === "p-1") { // OpenAI
        if (!keyToUse) throw new Error("OpenAI API Key not configured in the LLM Registry. Please enter your API Key.");

        const response = await fetch(`${openAiBase}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${keyToUse}`
            },
            body: JSON.stringify({
                model: model || "gpt-4o",
                messages: [{ role: "user", content: prompt }]
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`OpenAI Error: ${response.statusText} - ${errBody}`);
        }

        const data = await response.json();
        text = data.choices?.[0]?.message?.content || "";
        inTokens = data.usage?.prompt_tokens || Math.floor(prompt.length / 4);
        outTokens = data.usage?.completion_tokens || Math.floor(text.length / 4);
        
        // Cost estimation: gpt-4o is $2.50 / 1M input, $10.00 / 1M output
        cost = (inTokens * 0.0000025) + (outTokens * 0.00001);

    } else if (provider === "p-2") { // Anthropic
        if (!keyToUse) throw new Error("Anthropic API Key not configured in the LLM Registry. Please enter your API Key.");

        const response = await fetch(`${anthropicBase}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": keyToUse,
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
                model: model || "claude-3-5-sonnet-20241022",
                max_tokens: 1024,
                messages: [{ role: "user", content: prompt }]
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Anthropic Error: ${response.statusText} - ${errBody}`);
        }

        const data = await response.json();
        text = data.content?.[0]?.text || "";
        inTokens = data.usage?.input_tokens || Math.floor(prompt.length / 4);
        outTokens = data.usage?.output_tokens || Math.floor(text.length / 4);
        
        // Cost estimation: Claude 3.5 Sonnet is $3.00 / 1M input, $15.00 / 1M output
        cost = (inTokens * 0.000003) + (outTokens * 0.000015);

    } else if (provider === "p-3") { // Gemini
        if (!keyToUse) throw new Error("Gemini API Key not configured in the LLM Registry. Please enter your API Key.");

        const targetModel = model || "gemini-1.5-flash";
        const response = await fetch(`${geminiBase}/v1beta/models/${targetModel}:generateContent?key=${keyToUse}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Gemini Error: ${response.statusText} - ${errBody}`);
        }

        const data = await response.json();
        text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        inTokens = Math.floor(prompt.length / 4) + 5;
        outTokens = Math.floor(text.length / 4) + 10;
        
        // Gemini 1.5 Flash is $0.075 / 1M input, $0.30 / 1M output
        cost = (inTokens * 0.000000075) + (outTokens * 0.0000003);

    } else { // Custom vLLM / Ollama Node
        if (!endpoint || !isSafeUrl(endpoint)) {
            return NextResponse.json({ success: false, error: "Invalid or restricted custom LLM endpoint." }, { status: 400 });
        }

        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (activeKey && activeKey.trim() !== "") {
            headers["Authorization"] = `Bearer ${activeKey}`;
        }

        const cleanEndpoint = endpoint.replace(/\/+$/, '');
        const response = await fetch(`${cleanEndpoint}/chat/completions`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                model: model,
                messages: [{ role: "user", content: prompt }]
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Custom Endpoint Error: ${response.statusText} - ${errBody}`);
        }

        const data = await response.json();
        text = data.choices?.[0]?.message?.content || "";
        inTokens = data.usage?.prompt_tokens || Math.floor(prompt.length / 4);
        outTokens = data.usage?.completion_tokens || Math.floor(text.length / 4);
        cost = 0.0;
    }

    const latency = Date.now() - startTime;

    return NextResponse.json({
        success: true,
        text,
        meta: {
            inTokens,
            outTokens,
            cost,
            latency
        }
    });

  } catch (error: any) {
    console.error("Proxy Endpoint Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
