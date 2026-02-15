import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- HELPER: WEB SEARCH FUNCTION ---
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
        // Return a clean string of results
        return data.results.map((r: any) => `- ${r.title}: ${r.content}`).join("\n");
    } catch (e) {
        console.error("Search Error:", e);
        return null;
    }
}

export async function POST(req: Request) {
  try {
    const { steps, input, agentId, userId, agentRole, fileData } = await req.json();
    const role = agentRole ? agentRole.toLowerCase() : "";

    // 1. DETECT IF SEARCH IS NEEDED
    // If the user asks for "current", "latest", "news", "price", "who is", etc.
    const needsSearch = /latest|current|news|price|stock|who is|find|search|research|docs|documentation/i.test(input);
    
    let searchContext = "";
    if (needsSearch) {
        console.log("🔍 Searching web for:", input);
        const searchResults = await searchWeb(input);
        if (searchResults) {
            searchContext = `\n\n[REAL-TIME WEB SEARCH RESULTS]:\n${searchResults}\n\n(Use these results to answer the user's question accurately.)`;
        }
    }

    // 2. FETCH CUSTOM INSTRUCTIONS
    let customInstructions = null;
    if (agentId) {
        const { data: agentData } = await supabase.from('agents').select('instructions, goal').eq('id', agentId).single();
        if (agentData) {
            if (agentData.instructions && agentData.instructions.length > 5) {
                customInstructions = agentData.instructions;
            } else if (agentData.goal && agentData.goal.length > 10) {
                customInstructions = agentData.goal;
            }
        }
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 3. DEFINE SYSTEM PROMPT
    let systemInstruction = "You are a helpful AI Employee. Keep answers concise.";

    if (customInstructions) {
        systemInstruction = customInstructions;
    } else {
        if (role.includes('react') || role.includes('frontend')) {
            systemInstruction = "ROLE: Senior React Developer. OUTPUT: HTML/Tailwind code.";
        } else if (role.includes('backend')) {
            systemInstruction = "ROLE: Backend Architect. OUTPUT: SQL/Node.js.";
        } else if (role.includes('marketing')) {
            systemInstruction = "ROLE: Marketing Expert. OUTPUT: Viral copy.";
        }
    }

    // 4. PREPARE PROMPT (Instructions + Context + Search Results)
    let promptParts: any[] = [
        { text: `${systemInstruction}${searchContext}\n\nUSER REQUEST: "${input}"` }
    ];

    if (fileData) {
        promptParts.push({
            inlineData: {
                data: fileData.base64,
                mimeType: fileData.type
            }
        });
        promptParts[0].text += `\n\n[CONTEXT]: File attached.`;
    }

    // 5. GENERATE
    const result = await model.generateContent(promptParts);
    let finalResult = result.response.text();

    if (finalResult.includes('<!DOCTYPE') || finalResult.includes('import React')) {
        finalResult = finalResult.replace(/```html/g, "").replace(/```/g, "").trim();
    }

    // 6. SAVE
    if (userId && agentId) {
        const isCode = finalResult.includes('<html') || finalResult.includes('function') || finalResult.includes('CREATE TABLE');
        const saveInput = fileData ? `[File] ${input}` : input;
        
        await supabase.from('tasks').insert({
            user_id: userId,
            agent_id: agentId,
            input: saveInput,
            result: finalResult,
            type: isCode ? 'code' : 'text'
        });
    }

    return NextResponse.json({ success: true, result: finalResult });

  } catch (error: any) {
    console.error("Agent API Error:", error);
    if (error.message?.includes('429')) {
        return NextResponse.json({ success: true, result: "⚠️ System Busy (Rate Limit). Please wait 30s." });
    }
    return NextResponse.json({ success: false, result: `❌ Error: ${error.message}` });
  }
}