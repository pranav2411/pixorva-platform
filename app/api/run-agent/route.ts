import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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
    // --- API KEY AUTHORIZATION CHECK ---
    const authHeader = req.headers.get("Authorization");
    let activeKeyToken = null;
    let resolvedUserId = null;
    
    if (authHeader && authHeader.startsWith("Bearer px_live_")) {
      activeKeyToken = authHeader.replace("Bearer ", "").trim();
      // Initialize server client early to allow token database validation
      const cookieStore = await cookies();
      const earlySupabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll() { return cookieStore.getAll(); },
              setAll() {}
            },
          }
      );
      const { LocalDb } = require('../../utils/LocalDatabase');
      const apiKeyRecord = await LocalDb.validateKey(earlySupabase, activeKeyToken);
      if (!apiKeyRecord) {
        return NextResponse.json({ success: false, result: "❌ Unauthorized: Invalid API Key." }, { status: 401 });
      }
      resolvedUserId = apiKeyRecord.userId;
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                );
              } catch {
                // Ignore if called from Server Component context
              }
            },
          },
        }
    );

    const { input, agentId, userId, agentRole, fileData } = await req.json();
    const finalUserId = resolvedUserId || userId;

    // --- 1. GET HISTORY ---
    let historyContext = "";
    if (finalUserId && agentId) {
        const { data: history } = await supabase
            .from('tasks')
            .select('input, result')
            .eq('user_id', finalUserId)
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

        if (finalUserId) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('trial_agent_id, trial_ends_at')
                .eq('id', finalUserId)
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
    if (finalUserId) {
        const { data: hiredAgents } = await supabase
            .from('agents')
            .select('id, name, goal')
            .eq('user_id', finalUserId);

        const allTemplates = [
            { name: "Devon", role: "React Developer", goal: "Builds UI components, fixes React hooks, and sets up Next.js projects." },
            { name: "Ruby", role: "Backend Architect", goal: "Designs SQL database schemas, writes Node.js/Postgres API endpoints, and optimizes queries." },
            { name: "Quinn", role: "QA Tester", goal: "Writes Jest/Cypress unit tests and finds edge cases in backend/frontend logic." },
            { name: "Cy", role: "Security Analyst", goal: "Audits code for vulnerabilities, secure coding, compliance & security policies." },
            { name: "Marcus", role: "Growth Hacker", goal: "Writes viral threads, LinkedIn hooks, and ad copy." },
            { name: "Stella", role: "Social Media Manager", goal: "Creates Instagram captions, TikTok scripts, and visual marketing plans." },
            { name: "Gordon", role: "SEO Blog Writer", goal: "Writes ranking articles with perfect SEO keyword structures." },
            { name: "Vic", role: "Video Scripter", goal: "Turns blog posts into engaging YouTube/video scripts." },
            { name: "Sarah", role: "SDR / Outreach Specialist", goal: "Finds email leads and writes personalized cold outreach emails." },
            { name: "Larry", role: "Lead Enricher", goal: "Finds contact emails, LinkedIn profiles, and company enrichment data." },
            { name: "Holly", role: "HR Manager", goal: "Drafts job descriptions, screens resumes, and writes employee policies." },
            { name: "Finn", role: "Finance Analyst", goal: "Analyzes P&L sheets, revenue data, and drafts tax summaries." },
            { name: "Lawson", role: "Legal Assistant", goal: "Drafts NDAs, legal contracts, privacy policies & reviews terms." },
            { name: "Pat", role: "Product Manager", goal: "Writes user stories, specs, roadmap items, and feature specs." },
            { name: "Sam", role: "Customer Support Agent", goal: "Drafts empathetic replies to support complaints and customer emails." }
        ];

        const agentListText = allTemplates.map(tpl => {
            const hired = hiredAgents?.find(a => a.name.toLowerCase().includes(tpl.name.toLowerCase()) || a.goal?.toLowerCase().includes(tpl.role.toLowerCase()));
            return `- Name: "${tpl.name}" (${tpl.role})
  Goal/Capability: ${tpl.goal}
  Status: ${hired ? `Hired (ID: "${hired.id}")` : 'Not Hired (Use ID: "' + tpl.name.toLowerCase() + '-placeholder")'}`;
        }).join('\n\n');

        collaborationPrompt = `
        🤖 WORKSPACE COLLABORATION PROTOCOL:
        You are in a multi-agent workspace. You can consult or delegate subtasks to other specialized template agents listed below to provide a better user experience (e.g. asking CY the Ruby Developer to connect a database).
        
        Other Workspace Agents:
        ${agentListText}

        🔴 DELEGATION TRIGGER RULE:
        If the user asks you to "Ask [Agent Name]", "Consult [Agent Name]", "Delegate to [Agent Name]", or if they ask a question directed at another agent (e.g. "Ask Ruby how to connect backend"), you MUST NOT respond in plain text.
        You MUST output this exact JSON delegation block (and absolutely NOTHING else):
        {
          "tool": "delegate",
          "agentId": "THE_TARGET_AGENT_UUID_OR_PLACEHOLDER_ID_FROM_LIST",
          "agentName": "THE_TARGET_AGENT_NAME",
          "task": "The specific query or instructions you want this agent to perform"
        }

        - Find the closest matching agent from the list above. E.g. "Ruby" matches CY (Ruby Developer).
        - Do NOT include any other text before or after the JSON. Once the user approves or purchases, the system will execute it and give you the output.
        `;
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
                const isPlaceholder = parsed.agentId.includes('-placeholder');
                
                let targetAgent = null;
                if (!isPlaceholder) {
                    const { data } = await supabase
                        .from('agents')
                        .select('*')
                        .eq('id', parsed.agentId)
                        .eq('user_id', finalUserId)
                        .maybeSingle();
                    targetAgent = data;
                }

                if (targetAgent) {
                    parsed.hired = true;
                    parsed.agentName = targetAgent.name;
                } else {
                    parsed.hired = false;
                    const nameMap: Record<string, string> = {
                        "ruby": "Ruby (Backend Architect)",
                        "quinn": "Quinn (QA Tester)",
                        "cy": "Cy (Security Analyst)",
                        "marcus": "Marcus (Growth Hacker)",
                        "stella": "Stella (Social Media Mgr)",
                        "gordon": "Gordon (SEO Blog Writer)",
                        "vic": "Vic (Video Scripter)",
                        "sarah": "Sarah (SDR / Outreach)",
                        "larry": "Larry (Lead Enricher)",
                        "holly": "Holly (HR Manager)",
                        "finn": "Finn (Finance Analyst)",
                        "lawson": "Lawson (Legal Assistant)",
                        "pat": "Pat (Product Manager)",
                        "sam": "Sam (Customer Support)"
                    };
                    const key = parsed.agentId.replace('-placeholder', '').toLowerCase();
                    parsed.agentName = nameMap[key] || parsed.agentName || "Specialist Agent";
                }
                
                finalResult = JSON.stringify(parsed);
            }
        }
    } catch (e) {
        // Ignore parsing errors
    }

    // --- 7. SAVE ---
    if (finalUserId && agentId) {
        // Detect if it's an action (JSON) or Code or Text
        let type = 'text';
        if (finalResult.includes('"tool": "email"') || finalResult.includes('"tool": "delegate"')) type = 'action';
        else if (finalResult.includes('<html') || finalResult.includes('function')) type = 'code';
        
        await supabase.from('tasks').insert({
            user_id: finalUserId,
            agent_id: agentId,
            input: fileData ? `[File] ${input}` : input,
            result: finalResult,
            type: type
        });
    }

    // --- 8. TELEMETRY LOGGING ---
    try {
        const estimatedTokens = Math.ceil(finalResult.length / 4) + Math.ceil(input.length / 4);
        const { LocalDb } = require('../../utils/LocalDatabase');
        if (activeKeyToken) {
            await LocalDb.incrementKeyUsage(supabase, activeKeyToken, estimatedTokens, input, finalResult);
        }
    } catch (telemetryError) {
        console.error("Telemetry increment failed:", telemetryError);
    }

    return NextResponse.json({ success: true, result: finalResult });

  } catch (error: unknown) {
    return NextResponse.json({ success: false, result: `❌ Error: ${(error as Error).message}` });
  }
}