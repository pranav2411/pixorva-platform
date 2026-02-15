import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 1. Setup Supabase Client (Server-Side)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    // 2. Get Data from Client
    const { steps, input, agentId, userId } = await req.json();
    
    // 3. Setup Gemini
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 4. Smart Prompt (Detect if user wants code)
    let systemInstruction = "";
    if (input.toLowerCase().includes('code') || input.toLowerCase().includes('website') || input.toLowerCase().includes('html')) {
        systemInstruction = " IMPORTANT: The user wants code. Return ONLY a single index.html file with embedded Tailwind CSS scripts. Do not use Markdown backticks. Just raw HTML.";
    }

    // 5. Generate Content
    const prompt = `
        Role: You are an expert AI Employee.
        Task Input: ${input}
        Instructions: ${systemInstruction}
        
        Execute the task perfectly.
    `;

    const result = await model.generateContent(prompt);
    const finalResult = result.response.text();

    // --- THE CRITICAL PART: SAVE TO DATABASE ---
    // We only save if we have the User ID and Agent ID
    if (userId && agentId) {
        const { error } = await supabase.from('tasks').insert({
            user_id: userId,
            agent_id: agentId,
            input: input,
            result: finalResult,
            type: finalResult.includes('<html') ? 'code' : 'text'
        });

        if (error) {
            console.error("Supabase Save Error:", error);
        }
    }
    // -------------------------------------------

    return NextResponse.json({ success: true, result: finalResult });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}