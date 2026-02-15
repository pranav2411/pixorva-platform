import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    if (!process.env.GOOGLE_API_KEY) {
        throw new Error("Missing GOOGLE_API_KEY in .env.local");
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const { steps, input } = await req.json();
    const logs: string[] = [];
    
    // Initial Context
    let context = `User Input: ${input}`;
    logs.push(`🚀 Starting Workflow for: "${input}"...`);
    
    // --- FIX: USE NEW MODEL NAME ---
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    for (const step of steps) {
        // Skip triggers (they just start the flow)
        if (step.type === 'trigger') {
            logs.push(`⚡ Trigger: ${step.name}`);
            continue;
        }

        logs.push(`⚡ Executing Step: ${step.name}...`);

        try {
            // We tell the AI what to do based on the step name
            const prompt = `
                You are an AI Workflow Engine.
                
                CURRENT CONTEXT: ${context}
                
                YOUR TASK: Perform the action: "${step.name}".
                - If "Write Tweet", write a tweet.
                - If "Summarize", summarize the context.
                - If "Extract Email", find the email.
                
                OUTPUT: Return ONLY the result text. Do not add "Here is the result".
            `;
            
            const result = await model.generateContent(prompt);
            const response = result.response.text();
            
            // Update context so next steps know what happened
            context += `\nResult of ${step.name}: ${response}`;
            
            // Log the result for the user
            logs.push(`✅ [RESULT]: ${response}`); 
            
        } catch (aiError: any) {
            console.error("Gemini Error:", aiError);
            logs.push(`❌ Error: ${aiError.message || "AI Processing Failed"}`);
        }
    }

    logs.push("🏁 Workflow Completed.");
    return NextResponse.json({ success: true, logs });

  } catch (error: any) {
    console.error("Engine Failure:", error);
    return NextResponse.json({ 
        success: false, 
        logs: [`❌ CRITICAL ERROR: ${error.message}`] 
    });
  }
}