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

    // --- 1. FETCH CUSTOM INSTRUCTIONS (SMART FIX) ---
    let customInstructions = null;
    
    if (agentId) {
        // Fetch both instructions AND goal
        const { data: agentData } = await supabase
            .from('agents')
            .select('instructions, goal')
            .eq('id', agentId)
            .single();
            
        if (agentData) {
            // Priority 1: Use the Brain (Instructions)
            if (agentData.instructions && agentData.instructions.length > 5) {
                customInstructions = agentData.instructions;
            } 
            // Priority 2: Fallback to Goal (If user put instructions in the wrong box)
            else if (agentData.goal && agentData.goal.length > 10) {
                customInstructions = agentData.goal;
            }
        }
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // --- 2. DEFINE SYSTEM PROMPT ---
    let systemInstruction = "You are a helpful AI Employee. Keep answers concise.";

    if (customInstructions) {
        // Use the Custom Brain
        systemInstruction = customInstructions;
    } else {
        // FALLBACK: Use Role-Based Logic (Marketplace Agents)
        if (role.includes('react') || role.includes('frontend')) {
            systemInstruction = "ROLE: Senior React Developer. OUTPUT: Single HTML file with Tailwind. RAW HTML ONLY.";
        } else if (role.includes('backend') || role.includes('architect')) {
            systemInstruction = "ROLE: Backend Architect. OUTPUT: SQL Schema or Node.js code blocks.";
        } else if (role.includes('legal')) {
            systemInstruction = "ROLE: Senior Legal Counsel. OUTPUT: Formal legal analysis.";
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

    // Clean up code formatting
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
    console.error("Agent API Error:", error);
    
    // Handle Rate Limits
    if (error.message?.includes('429')) {
        return NextResponse.json({ success: true, result: "⚠️ System Busy (Rate Limit). Please wait 30s." });
    }
    
    // RETURN THE ACTUAL ERROR (So you don't see "No response")
    return NextResponse.json({ success: false, result: `❌ Error: ${error.message}` });
  }
}