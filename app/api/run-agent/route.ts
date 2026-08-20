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
        return data.results.map((r: { title: string; content: string }) => `- ${r.title}: ${r.content}`).join("\n");
    } catch {
        return null;
    }
}

export async function POST(req: Request) {
  try {
    const { input, agentId, userId, agentRole, fileData } = await req.json();

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

    // --- 3. GET CUSTOM INSTRUCTIONS & CHECK TRIAL LOCK ---
    let customInstructions = "";
    if (agentId) {
        const { data: agentData } = await supabase.from('agents').select('instructions, goal').eq('id', agentId).single();
        if (agentData) {
            customInstructions = agentData.instructions || agentData.goal || "";
        }

        if (userId) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('trial_agent_id, trial_ends_at')
                .eq('id', userId)
                .single();

            if (profile && profile.trial_agent_id === agentId) {
                const isExpired = profile.trial_ends_at && new Date() > new Date(profile.trial_ends_at);
                if (isExpired) {
                    return NextResponse.json({ 
                        success: false, 
                        result: "⚠️ Your 3-day free trial for this agent has expired. Please purchase the agent to unlock it and continue using it." 
                    });
                }
            }
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

    // Fetch user's other agents for collaboration
    let collaborationPrompt = "";
    if (userId) {
        const { data: otherAgents } = await supabase
            .from('agents')
            .select('id, name, goal')
            .eq('user_id', userId)
            .neq('id', agentId || "");

        if (otherAgents && otherAgents.length > 0) {
            collaborationPrompt = `
            🤖 WORKSPACE COLLABORATION PROTOCOL:
            You are operating in a multi-agent environment. The user has hired other specialized agents that you can consult or delegate tasks to if you need their capabilities (e.g. Ruby backend developer, Marketing coordinator, Legal assistant, etc.) for a better user experience.
            
            Hired Agents Available:
            ${otherAgents.map(a => `- Name: "${a.name}" (ID: ${a.id}). Goal: ${a.goal}`).join('\n')}

            If you need to consult one of these agents to solve the user's request, you can delegate a specific subtask to them by returning a JSON command.
            You MUST output this exact JSON format (and nothing else):
            {
              "tool": "delegate",
              "agentId": "THE_TARGET_AGENT_UUID",
              "task": "The specific query or task instructions you want this agent to perform"
            }

            - Do NOT include any other text. Once they return their result, the system will inject it and you will finalize the answer.
            `;
        }
    }

    // --- 5. BUILD PROMPT ---
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let systemPrompt = `ROLE: ${agentRole || "Assistant"}.`;
    if (customInstructions) systemPrompt += `\nCONTEXT: ${customInstructions}`;
    if (collaborationPrompt) systemPrompt += `\n${collaborationPrompt}`;

    // APPEND PROTOCOL AT THE END
    let finalPrompt = `${systemPrompt}\n${historyContext}\n${searchContext}\n\n${ACTION_PROTOCOL}\n\nUSER REQUEST: "${input}"`;

    if (fileData) {
        finalPrompt += `\n[FILE ATTACHED]`;
    }

    const promptParts: ({ text: string } | { inlineData: { data: string; mimeType: string } })[] = [{ text: finalPrompt }];

    if (fileData) {
        promptParts.push({
            inlineData: {
                data: fileData.base64,
                mimeType: fileData.type
            }
        });
    }

    // --- 6. GENERATE ---
    const result = await model.generateContent(promptParts);
    let finalResult = result.response.text();

    // CLEANUP JSON (Remove markdown wrappers if AI adds them)
    finalResult = finalResult.replace(/```json/g, "").replace(/```/g, "").trim();

    // Check for delegation request
    try {
        if (finalResult.includes('"tool": "delegate"') || finalResult.includes('"tool":"delegate"')) {
            const parsed = JSON.parse(finalResult);
            if (parsed.tool === "delegate" && parsed.agentId && parsed.task) {
                const { data: targetAgent } = await supabase
                    .from('agents')
                    .select('name, instructions, goal')
                    .eq('id', parsed.agentId)
                    .single();

                if (targetAgent) {
                    const targetRole = targetAgent.name || "Assistant";
                    const targetInstructions = targetAgent.instructions || targetAgent.goal || "";
                    const targetPrompt = `ROLE: ${targetRole}.\nCONTEXT: ${targetInstructions}\n\nUSER REQUEST: "${parsed.task}"`;
                    
                    const targetResult = await model.generateContent([{ text: targetPrompt }]);
                    const targetResponse = targetResult.response.text();

                    const synthesisPrompt = `
                    You delegated a subtask to "${targetRole}" and they responded with:
                    ---
                    ${targetResponse}
                    ---
                    
                    Now, synthesize their work and output the final, complete response to the user's original request: "${input}"
                    (Make sure to mention in your final reply that you collaborated with ${targetRole} to achieve this).
                    `;
                    
                    const finalSynthesisResult = await model.generateContent([{ text: `${systemPrompt}\n\n${synthesisPrompt}` }]);
                    finalResult = finalSynthesisResult.response.text();
                }
            }
        }
    } catch (e) {
        // Ignore parsing errors
    }

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

  } catch (error: unknown) {
    return NextResponse.json({ success: false, result: `❌ Error: ${(error as Error).message}` });
  }
}