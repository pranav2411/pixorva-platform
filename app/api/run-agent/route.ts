import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- HELPER: WEB SEARCH ---
async function searchWeb(query: string) {
    try {
        const apiKey = process.env.TAVILY_API_KEY;
        if (!apiKey) return null;

        const response = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                api_key: apiKey,
                query: query,
                search_depth: "basic",
                include_answer: true,
                max_results: 3
            })
        });
        
        const data = await response.json();
        return data.results.map((r: any) => `- ${r.title}: ${r.content}`).join("\n");
    } catch (e) {
        return null;
    }
}

export async function POST(req: Request) {
  try {
    const { input, agentId, userId, agentRole, fileData } = await req.json();
    const role = agentRole ? agentRole.toLowerCase() : "";

    // --- 1. GET HISTORY ---
    let historyContext = "";
    if (userId && agentId) {
        const { data: history } = await supabase
            .from('tasks')
            .select('input, result')
            .eq('user_id', userId)
            .eq('agent_id', agentId)
            .order('created_at', { ascending: false })
            .limit(6);

        if (history && history.length > 0) {
            historyContext = history.reverse().map(entry => 
                `User: ${entry.input}\nAI: ${entry.result}`
            ).join('\n\n');
            historyContext = `\n\n[CHAT HISTORY]:\n${historyContext}\n`;
        }
    }

    // --- 2. GET SEARCH ---
    const needsSearch = /latest|current|news|price|stock|who is|find|search|research|docs|documentation/i.test(input);
    let searchContext = "";
    if (needsSearch) {
        const searchResults = await searchWeb(input);
        if (searchResults) searchContext = `\n\n[SEARCH RESULTS]:\n${searchResults}\n`;
    }

    // --- 3. GET CUSTOM INSTRUCTIONS ---
    let customInstructions = "";
    if (agentId) {
        const { data: agentData } = await supabase.from('agents').select('instructions, goal').eq('id', agentId).single();
        if (agentData) {
            customInstructions = agentData.instructions || agentData.goal || "";
        }
    }

    // --- 4. THE ACTION PROTOCOL (STRICT) ---
    // We put this LAST in the prompt so it overrides everything else.
    const ACTION_PROTOCOL = `
    🔴 CRITICAL SYSTEM RULE (OVERRIDE ALL OTHER INSTRUCTIONS):
    If the user request contains the word "Send" (e.g. "Send email", "Send this"), you MUST NOT write plain text.
    You MUST output a valid JSON object in this exact format:
    
    {
      "tool": "email",
      "to": "email@example.com",
      "subject": "The Subject Line",
      "body": "The email body HTML"
    }

    - Do NOT wrap the JSON in markdown code blocks.
    - Do NOT include any text before or after the JSON.
    - If the user asks to "Write" or "Draft", then just write normal text.
    `;

    // --- 5. BUILD PROMPT ---
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let systemPrompt = `ROLE: ${agentRole || "Assistant"}.`;
    if (customInstructions) systemPrompt += `\nCONTEXT: ${customInstructions}`;

    // APPEND PROTOCOL AT THE END
    let finalPrompt = `${systemPrompt}\n${historyContext}\n${searchContext}\n\n${ACTION_PROTOCOL}\n\nUSER REQUEST: "${input}"`;

    let promptParts: any[] = [{ text: finalPrompt }];

    if (fileData) {
        promptParts.push({
            inlineData: {
                data: fileData.base64,
                mimeType: fileData.type
            }
        });
        promptParts[0].text += `\n[FILE ATTACHED]`;
    }

    // --- 6. GENERATE ---
    const result = await model.generateContent(promptParts);
    let finalResult = result.response.text();

    // CLEANUP JSON (Remove markdown wrappers if AI adds them)
    finalResult = finalResult.replace(/```json/g, "").replace(/```/g, "").trim();

    // --- 7. SAVE ---
    if (userId && agentId) {
        // Detect if it's an action (JSON) or Code or Text
        let type = 'text';
        if (finalResult.includes('"tool": "email"')) type = 'action';
        else if (finalResult.includes('<html') || finalResult.includes('function')) type = 'code';
        
        await supabase.from('tasks').insert({
            user_id: userId,
            agent_id: agentId,
            input: fileData ? `[File] ${input}` : input,
            result: finalResult,
            type: type
        });
    }

    return NextResponse.json({ success: true, result: finalResult });

  } catch (error: any) {
    return NextResponse.json({ success: false, result: `❌ Error: ${error.message}` });
  }
}