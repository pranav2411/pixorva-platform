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

    // --- 1. FETCH CUSTOM INSTRUCTIONS (The Fix) ---
    // We fetch the agent to see if it has a custom brain
    let customInstructions = null;
    if (agentId) {
        const { data: agentData } = await supabase.from('agents').select('instructions').eq('id', agentId).single();
        if (agentData && agentData.instructions) {
            customInstructions = agentData.instructions;
        }
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // --- 2. DEFINE SYSTEM PROMPT ---
    let systemInstruction = "You are a helpful AI Employee.";

    if (customInstructions) {
        // PRIORITY: Use the Custom Brain if it exists (Studio Agent)
        systemInstruction = customInstructions;
    } else {
        // FALLBACK: Use Role-Based Logic (Marketplace Agent)
        if (role.includes('react') || role.includes('frontend')) {
            systemInstruction = "ROLE: Senior React Developer. OUTPUT: Single HTML file with Tailwind. RAW HTML ONLY (No markdown).";
        } else if (role.includes('backend') || role.includes('architect')) {
            systemInstruction = "ROLE: Backend Architect. OUTPUT: SQL Schema or Node.js code blocks.";
        } else if (role.includes('legal')) {
            systemInstruction = "ROLE: Senior Legal Counsel. OUTPUT: Formal legal analysis or document.";
        } else if (role.includes('marketing')) {
            systemInstruction = "ROLE: Marketing Expert. OUTPUT: Viral, engaging copy.";
        }
    }

    // --- 3. PREPARE PROMPT ---
    let promptParts: any[] = [
        { text: `${systemInstruction}\n\nUSER REQUEST: "${input}"` }
    ];

    if (fileData) {
        promptParts.push({
            inlineData: {
                data: fileData.base64,
                mimeType: fileData.type
            }
        });
        promptParts[0].text += `\n\n[CONTEXT]: File attached.`;
    }

    // --- 4. GENERATE ---
    const result = await model.generateContent(promptParts);
    let finalResult = result.response.text();

    // Clean up if it's code
    if (finalResult.includes('<!DOCTYPE') || finalResult.includes('import React')) {
        finalResult = finalResult.replace(/```html/g, "").replace(/```/g, "").trim();
    }

    // --- 5. SAVE ---
    if (userId && agentId) {
        const isCode = finalResult.includes('<html') || finalResult.includes('function') || finalResult.includes('CREATE TABLE');
        const saveInput = fileData ? `[File] ${input}` : input;
        
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
    if (error.message?.includes('429')) {
        return NextResponse.json({ success: true, result: "⚠️ System Busy (Rate Limit). Please wait 30s." });
    }
    return NextResponse.json({ success: false, error: error.message });
  }
}