import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { steps, input, agentId, userId, agentRole, fileData } = await req.json();
    const role = agentRole ? agentRole.toLowerCase() : "";

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    // Use 'flash' for speed, or 'pro' if you want deep reasoning.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    // --- 1. SYSTEM INSTRUCTIONS ---
    let systemInstruction = "You are a helpful AI Employee.";

    // Detect Role for better output
    if (role.includes('react') || role.includes('frontend')) {
        systemInstruction = "ROLE: Senior React Developer. OUTPUT: Single HTML file with Tailwind. RAW HTML ONLY (No markdown).";
    } else if (role.includes('backend') || role.includes('architect')) {
        systemInstruction = "ROLE: Backend Architect. OUTPUT: SQL Schema or Node.js code blocks.";
    } else if (role.includes('legal')) {
        systemInstruction = "ROLE: Senior Legal Counsel. OUTPUT: Formal legal analysis or document.";
    }

    // --- 2. PREPARE CONTENT ---
    let promptParts: any[] = [
        { text: `${systemInstruction}\n\nUSER REQUEST: "${input}"` }
    ];

    // --- 3. ATTACH FILE (If exists) ---
    if (fileData) {
        promptParts.push({
            inlineData: {
                data: fileData.base64,
                mimeType: fileData.type
            }
        });
        promptParts[0].text += `\n\n[CONTEXT]: A file has been attached. Please analyze it based on the user request.`;
    }

    // --- 4. GENERATE ---
    const result = await model.generateContent(promptParts);
    let finalResult = result.response.text();

    // Clean up if it's a frontend task
    if (role.includes('react') || role.includes('frontend')) {
        finalResult = finalResult.replace(/```html/g, "").replace(/```/g, "").trim();
    }

    // --- 5. SAVE TO DB ---
    if (userId && agentId) {
        const isCode = finalResult.includes('<html') || finalResult.includes('function') || finalResult.includes('CREATE TABLE');
        const saveInput = fileData ? `[File: ${fileData.name}] ${input}` : input;
        
        await supabase.from('tasks').insert({
            user_id: userId,
            agent_id: agentId,
            input: saveInput,
            result: finalResult,
            type: isCode ? 'code' : 'text'
        });
    }

    return NextResponse.json({ success: true, result: finalResult });

  } catch (error: any) {
    console.error("API Error:", error);
    // Handle Rate Limits gracefully
    if (error.message?.includes('429')) {
        return NextResponse.json({ success: true, result: "⚠️ System Busy (Rate Limit). Please wait 30s." });
    }
    return NextResponse.json({ success: false, error: error.message });
  }
}