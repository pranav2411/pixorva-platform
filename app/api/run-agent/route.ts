import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
  try {
    const { steps, input } = await req.json();
    const logs: string[] = [];
    
    // We keep a "Context" to pass data between steps (Short-term memory)
    let context = `User Input: ${input}`;

    logs.push(`🚀 Starting Workflow for: "${input}"...`);
    
    // Initialize Gemini Model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    for (const step of steps) {
        
        logs.push(`⚡ Executing Step: ${step.name}...`);

        // Skip manual triggers, they are just start points
        if (step.type === 'trigger') continue;

        // ASK GEMINI TO DO THE WORK
        const prompt = `
            You are an AI Agent executing a workflow.
            
            Current Context/Memory: ${context}
            
            YOUR TASK: Execute the step named "${step.name}".
            - If it says "Write Tweet", write a real tweet based on the context.
            - If it says "Summarize", summarize the context.
            - If it says "Extract Email", find an email in the context.
            
            Return ONLY the result of the task. Keep it concise.
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = result.response.text();
            
            // Update Context with the new result so the next step can use it
            context += `\nResult of ${step.name}: ${response}`;
            
            // Log the REAL output
            logs.push(`✅ [RESULT]: ${response}`);
            
            // Simulate processing time for UX
            await new Promise(r => setTimeout(r, 800));

        } catch (aiError) {
            logs.push(`❌ Error executing step: ${step.name}`);
        }
    }

    logs.push("🏁 Workflow Completed.");

    return NextResponse.json({ success: true, logs });

  } catch (error) {
    return NextResponse.json({ success: false, error: "Engine Failure" }, { status: 500 });
  }
}