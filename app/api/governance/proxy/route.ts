import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, provider, endpoint, model, apiKey } = await req.json();

    if (!prompt) {
        return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    const startTime = Date.now();
    let text = "";
    let inTokens = 0;
    let outTokens = 0;
    let cost = 0.0;

    let activeKey = apiKey;
    
    // Determine provider and call target endpoint
    if (provider === "p-1") { // OpenAI
        const keyToUse = (activeKey && !activeKey.includes('•••') && activeKey.trim() !== "") ? activeKey : process.env.OPENAI_API_KEY;
        if (!keyToUse) throw new Error("OpenAI API Key not configured.");

        const response = await fetch(`${endpoint}/chat/completions`, {
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
        text = data.choices[0].message.content;
        inTokens = data.usage?.prompt_tokens || Math.floor(prompt.length / 4);
        outTokens = data.usage?.completion_tokens || Math.floor(text.length / 4);
        
        // Cost estimation: gpt-4o is $2.50 / 1M input, $10.00 / 1M output
        cost = (inTokens * 0.0000025) + (outTokens * 0.00001);

    } else if (provider === "p-2") { // Anthropic
        const keyToUse = (activeKey && !activeKey.includes('•••') && activeKey.trim() !== "") ? activeKey : process.env.ANTHROPIC_API_KEY;
        if (!keyToUse) throw new Error("Anthropic API Key not configured.");

        const response = await fetch(`${endpoint}/messages`, {
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
        text = data.content[0].text;
        inTokens = data.usage?.input_tokens || Math.floor(prompt.length / 4);
        outTokens = data.usage?.output_tokens || Math.floor(text.length / 4);
        
        // Cost estimation: Claude 3.5 Sonnet is $3.00 / 1M input, $15.00 / 1M output
        cost = (inTokens * 0.000003) + (outTokens * 0.000015);

    } else if (provider === "p-3") { // Gemini
        const keyToUse = (activeKey && !activeKey.includes('•••') && activeKey.trim() !== "") ? activeKey : process.env.GOOGLE_API_KEY;
        if (!keyToUse) throw new Error("Google API Key not configured.");

        const targetModel = model || "gemini-1.5-flash";
        const response = await fetch(`${endpoint}/v1beta/models/${targetModel}:generateContent?key=${keyToUse}`, {
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
        text = data.candidates[0].content.parts[0].text;
        
        inTokens = Math.floor(prompt.length / 4) + 5;
        outTokens = Math.floor(text.length / 4) + 10;
        
        // Gemini 1.5 Flash is $0.075 / 1M input, $0.30 / 1M output
        cost = (inTokens * 0.000000075) + (outTokens * 0.0000003);

    } else { // Custom vLLM / Ollama Node
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (activeKey && activeKey.trim() !== "") {
            headers["Authorization"] = `Bearer ${activeKey}`;
        }

        const response = await fetch(`${endpoint}/chat/completions`, {
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
        text = data.choices[0].message.content;
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
