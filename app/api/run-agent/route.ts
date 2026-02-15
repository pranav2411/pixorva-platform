import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js'; // Import Supabase
import { NextResponse } from 'next/server';

// Create Supabase Client for the API
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { steps, input, agentId, userId } = await req.json(); // Accept IDs
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // --- SMART PROMPT INJECTION ---
    // If the input asks for code/website, force HTML output for the previewer
    let systemInstruction = "";
    if (input.toLowerCase().includes('code') || input.toLowerCase().includes('website') || input.toLowerCase().includes('html')) {
        systemInstruction = " IMPORTANT: If asking for code/website, return ONLY a single index.html file with embedded Tailwind CSS scripts. Do not use Markdown backticks. Just raw HTML.";
    }

    let logs: string[] = [];
    let finalResult = "";

    logs.push(`🚀 Starting Workflow for: "${input}"...`);
    
    // ... (Your existing step loop logic here) ...
    // For simplicity in this demo, we will just do a Direct Execution for the result
    // In a real app, you would loop through steps. Let's simulate the final output:
    
    const prompt = `
        Context: ${input}
        Role: You are an expert AI Agent.
        ${systemInstruction}
        Task: Perform the requested work.
    `;

    const result = await model.generateContent(prompt);
    finalResult = result.response.text();

    // --- SAVE TO DATABASE (MEMORY) ---
    if (agentId && userId) {
        await supabase.from('tasks').insert({
            agent_id: agentId,
            user_id: userId,
            input: input,
            result: finalResult,
            type: finalResult.includes('<html') ? 'code' : 'text'
        });
    }

    return NextResponse.json({ success: true, logs: ["✅ Work Saved to Memory."], result: finalResult });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}