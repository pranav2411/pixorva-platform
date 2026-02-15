import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Check for API Key immediately
    if (!process.env.GOOGLE_API_KEY) {
        throw new Error("Missing GOOGLE_API_KEY in .env.local");
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const { steps, input } = await req.json();
    const logs: string[] = [];
    
    let context = `User Input: ${input}`;
    logs.push(`🚀 Starting Workflow for: "${input}"...`);
    
    // Use the standard model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    for (const step of steps) {
        // Skip triggers
        if (step.type === 'trigger') {
            logs.push(`⚡ Trigger: ${step.name}`);
            continue;
        }

        logs.push(`⚡ Executing Step: ${step.name}...`);

        try {
            const prompt = `
                You are an AI Agent.
                Context: ${context}
                Task: ${step.name}
                Output: Just the result.
            `;
            
            const result = await model.generateContent(prompt);
            const response = result.response.text();
            
            context += `\nResult: ${response}`;
            logs.push(`✅ [RESULT]: ${response.substring(0, 100)}...`); // Show preview
            
        } catch (aiError: any) {
            // LOG THE REAL ERROR
            console.error("Gemini Error:", aiError);
            logs.push(`❌ Error: ${aiError.message || "AI Connection Failed"}`);
        }
    }

    logs.push("🏁 Workflow Completed.");
    return NextResponse.json({ success: true, logs });

  } catch (error: any) {
    console.error("Engine Failure:", error);
    return NextResponse.json({ 
        success: false, 
        // This will send the specific error back to your screen
        logs: [`❌ CRITICAL ERROR: ${error.message}`] 
    });
  }
}