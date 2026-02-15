import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { steps, input, agentId, userId } = await req.json();
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 1. DETECT CODE REQUEST
    const isCodingTask = /code|html|website|landing page|app|react|ui/i.test(input);

    let systemInstruction = "";
    if (isCodingTask) {
        systemInstruction = `
            ROLE: Senior Frontend Developer.
            TASK: Build a modern, beautiful website based on the user request.
            
            RULES:
            1. Return a SINGLE 'index.html' file.
            2. MUST include: <script src="[https://cdn.tailwindcss.com](https://cdn.tailwindcss.com)"></script> inside the <head>.
            3. Use vibrant colors, large fonts, and good padding (p-10, gap-8).
            4. Do NOT use Markdown backticks. Return RAW HTML only.
            5. Ensure the design is fully responsive and looks like a real SaaS/Product site.
        `;
    } else {
        systemInstruction = "You are a helpful AI Assistant. Provide a clear, professional text response.";
    }

    const prompt = `
        ${systemInstruction}
        USER REQUEST: "${input}"
    `;

    const result = await model.generateContent(prompt);
    let finalResult = result.response.text();

    // --- FIX: CLEAN THE CODE ---
    // If the AI adds backticks (which it often does), remove them.
    if (isCodingTask) {
        finalResult = finalResult
            .replace(/```html/g, "")  // Remove start tag
            .replace(/```/g, "")      // Remove end tag
            .trim();                  // Remove extra whitespace
    }

    // 2. SAVE TO DATABASE
    if (userId && agentId) {
        await supabase.from('tasks').insert({
            user_id: userId,
            agent_id: agentId,
            input: input,
            result: finalResult,
            type: isCodingTask ? 'code' : 'text'
        });
    }

    return NextResponse.json({ success: true, result: finalResult });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}