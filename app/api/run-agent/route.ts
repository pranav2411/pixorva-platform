import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 1. Setup Supabase Client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { steps, input, agentId, userId } = await req.json();
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 2. DETECT IF USER WANTS CODE
    // If input mentions "landing page", "website", "code", "html", etc.
    const isCodingTask = /code|html|website|landing page|app|react/i.test(input);

    let systemInstruction = "";
    if (isCodingTask) {
        systemInstruction = `
            CRITICAL INSTRUCTION:
            You are a Senior Frontend Engineer.
            The user wants a FUNCTIONAL WEBSITE.
            
            1. Return ONLY a single 'index.html' file.
            2. Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
            3. Use FontAwesome or Lucide for icons if needed.
            4. Make it look modern, professional, and mobile-responsive.
            5. DO NOT wrap the code in markdown backticks (like \`\`\`html). 
            6. Just return the raw HTML string starting with <!DOCTYPE html>.
        `;
    } else {
        systemInstruction = "You are a helpful AI Assistant. Provide a clear, professional text response.";
    }

    // 3. GENERATE CONTENT
    const prompt = `
        ${systemInstruction}
        
        USER REQUEST: "${input}"
    `;

    const result = await model.generateContent(prompt);
    let finalResult = result.response.text();

    // CLEANUP: Remove markdown backticks if the AI added them by mistake
    if (isCodingTask) {
        finalResult = finalResult.replace(/```html/g, "").replace(/```/g, "").trim();
    }

    // 4. SAVE TO DATABASE (Force Save)
    if (userId && agentId) {
        const { error } = await supabase.from('tasks').insert({
            user_id: userId,
            agent_id: agentId,
            input: input,
            result: finalResult,
            type: isCodingTask ? 'code' : 'text'
        });

        if (error) {
            console.error("❌ DB Save Failed:", error.message);
        } else {
            console.log("✅ DB Save Success");
        }
    }

    return NextResponse.json({ success: true, result: finalResult });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}