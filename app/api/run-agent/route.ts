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

    // --- 1. ACTION PROTOCOL (THE HANDS) 🤚 ---
    const ACTION_PROTOCOL = `
    IMPORTANT INSTRUCTIONS:
    1. You are an AI Employee capable of performing real-world actions.
    2. If the user asks you to SEND AN EMAIL, do NOT just write the text.
    3. Instead, output a JSON object strictly in this format:
    
    {
      "tool": "email",
      "to": "email@example.com",
      "subject": "The Subject Line",
      "body": "The email content (use <br> for new lines)"
    }

    4. Do NOT wrap the JSON in markdown (no \`\`\`). Just raw JSON.
    5. If the request is a question or code task, answer normally (as text).
    `;

    // --- 2. GET CHAT HISTORY (THE MEMORY) 🧠 ---
    let historyContext = "";
    if (userId && agentId) {
        // Fetch last 6 messages
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
            historyContext = `\n\n[PREVIOUS CHAT HISTORY]:\n${historyContext}\n[END HISTORY]\n`;
        }
    }

    // --- 3. WEB SEARCH (THE EYES) 👀 ---
    const needsSearch = /latest|current|news|price|stock|who is|find|search|research|docs|documentation/i.test(input);
    let searchContext = "";
    if (needsSearch) {
        const searchResults = await searchWeb(input);
        if (searchResults) {
            searchContext = `\n\n[REAL-TIME WEB SEARCH RESULTS]:\n${searchResults}\n`;
        }
    }

    // --- 4. FETCH CUSTOM INSTRUCTIONS ---
    let customInstructions = "";
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

    // --- 5. INIT GEMINI ---
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    // Using 1.5-flash to prevent Rate Limit errors
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // --- 6. BUILD SYSTEM PROMPT ---
    let systemPrompt = `${ACTION_PROTOCOL}\n\nROLE: ${agentRole || "Helpful Assistant"}.\n`;

    if (customInstructions) {
        systemPrompt += `\nCUSTOM INSTRUCTIONS: ${customInstructions}`;
    } else {
        if (role.includes('react')) systemPrompt += "OUTPUT: HTML/Tailwind code.";
        else if (role.includes('marketing')) systemPrompt += "OUTPUT: Viral copy.";
    }

    // --- 7. COMPILE FINAL PROMPT ---
    let promptParts: any[] = [
        { text: `${systemPrompt}${historyContext}${searchContext}\n\nUSER REQUEST: "${input}"` }
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

    // --- 8. GENERATE ---
    const result = await model.generateContent(promptParts);
    let finalResult = result.response.text();

    // Clean up JSON or Code blocks
    if (finalResult.includes('```json')) {
        finalResult = finalResult.replace(/```json/g, "").replace(/```/g, "").trim();
    }
    if (finalResult.includes('<!DOCTYPE') || finalResult.includes('import React')) {
        finalResult = finalResult.replace(/```html/g, "").replace(/```/g, "").trim();
    }

    // --- 9. SAVE ---
    if (userId && agentId) {
        const isCode = finalResult.includes('<html') || finalResult.includes('function') || finalResult.includes('CREATE TABLE');
        const isAction = finalResult.includes('"tool": "email"');
        
        await supabase.from('tasks').insert({
            user_id: userId,
            agent_id: agentId,
            input: fileData ? `[File] ${input}` : input,
            result: finalResult,
            type: isAction ? 'action' : (isCode ? 'code' : 'text')
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