import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- HELPER: WEB SEARCH (Optional, keeps your search feature) ---
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

    // --- 1. GET CHAT HISTORY (THE MEMORY FIX) ---
    let historyContext = "";
    if (userId && agentId) {
        // Fetch last 6 messages (3 turns)
        const { data: history } = await supabase
            .from('tasks')
            .select('input, result')
            .eq('user_id', userId)
            .eq('agent_id', agentId)
            .order('created_at', { ascending: false }) // Get newest first
            .limit(6);

        if (history && history.length > 0) {
            // Reverse to Chronological Order (Oldest -> Newest)
            // Format: "User: Hi \n AI: Hello!"
            historyContext = history.reverse().map(entry => 
                `User: ${entry.input}\nAI: ${entry.result}`
            ).join('\n\n');
            
            historyContext = `\n\n[PREVIOUS CHAT HISTORY - USE FOR CONTEXT]:\n${historyContext}\n[END HISTORY]\n`;
        }
    }

    // --- 2. DETECT IF SEARCH IS NEEDED ---
    const needsSearch = /latest|current|news|price|stock|who is|find|search|research|docs|documentation/i.test(input);
    let searchContext = "";
    if (needsSearch) {
        const searchResults = await searchWeb(input);
        if (searchResults) {
            searchContext = `\n\n[REAL-TIME WEB SEARCH RESULTS]:\n${searchResults}\n`;
        }
    }

    // --- 3. FETCH CUSTOM INSTRUCTIONS ---
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

    // --- 4. INIT GEMINI ---
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // --- 5. DEFINE SYSTEM PROMPT ---
    let systemInstruction = "You are a helpful AI Employee. Keep answers concise.";

    if (customInstructions) {
        systemInstruction = customInstructions;
    } else {
        // Fallbacks for Marketplace Agents
        if (role.includes('react') || role.includes('frontend')) {
            systemInstruction = "ROLE: Senior React Developer. OUTPUT: HTML/Tailwind code.";
        } else if (role.includes('backend')) {
            systemInstruction = "ROLE: Backend Architect. OUTPUT: SQL/Node.js.";
        } else if (role.includes('marketing')) {
            systemInstruction = "ROLE: Marketing Expert. OUTPUT: Viral copy.";
        }
    }

    // --- 6. BUILD FINAL PROMPT (Instructions + History + Search + Input) ---
    // We combine everything into one massive context block for the AI
    let promptParts: any[] = [
        { text: `${systemInstruction}${historyContext}${searchContext}\n\nUSER REQUEST: "${input}"` }
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

    // --- 7. GENERATE ---
    const result = await model.generateContent(promptParts);
    let finalResult = result.response.text();

    if (finalResult.includes('<!DOCTYPE') || finalResult.includes('import React')) {
        finalResult = finalResult.replace(/```html/g, "").replace(/```/g, "").trim();
    }

    // --- 8. SAVE ---
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