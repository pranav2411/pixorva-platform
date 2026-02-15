import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { steps, input, agentId, userId, agentRole } = await req.json();
    const role = agentRole ? agentRole.toLowerCase() : "";

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    // --- SMART SYSTEM INSTRUCTIONS ---
    let systemInstruction = "You are a helpful AI Employee.";

    // 1. CODING ROLES (Frontend, Backend, Fullstack)
    if (role.includes('react') || role.includes('frontend')) {
        systemInstruction = "ROLE: Senior React Developer. OUTPUT: Single HTML file with Tailwind. RAW HTML ONLY (No markdown).";
    } else if (role.includes('backend') || role.includes('architect') || role.includes('database')) {
        systemInstruction = "ROLE: Backend Architect. OUTPUT: Professional SQL Schema or Node.js API code blocks. Use comments to explain.";
    } else if (role.includes('qa') || role.includes('tester')) {
        systemInstruction = "ROLE: QA Engineer. OUTPUT: A detailed test plan or Jest unit test code.";
    } 
    // 2. TEXT ROLES (Legal, HR, Marketing)
    else if (role.includes('legal')) {
        systemInstruction = "ROLE: Senior Legal Counsel. OUTPUT: Formal legal document with clear sections.";
    } else if (role.includes('marketing') || role.includes('social')) {
        systemInstruction = "ROLE: Marketing Expert. OUTPUT: Engaging, viral-ready copy with hashtags.";
    } else if (role.includes('hr')) {
        systemInstruction = "ROLE: HR Manager. OUTPUT: Professional, empathetic, and compliant corporate documents.";
    }

    const prompt = `
        ${systemInstruction}
        USER REQUEST: "${input}"
    `;

    const result = await model.generateContent(prompt);
    let finalResult = result.response.text();

    // Clean up if it's a frontend task
    if (role.includes('react') || role.includes('frontend')) {
        finalResult = finalResult.replace(/```html/g, "").replace(/```/g, "").trim();
    }

    // Save to DB
    if (userId && agentId) {
        const isCode = finalResult.includes('<html') || finalResult.includes('function') || finalResult.includes('CREATE TABLE');
        await supabase.from('tasks').insert({
            user_id: userId,
            agent_id: agentId,
            input: input,
            result: finalResult,
            type: isCode ? 'code' : 'text'
        });
    }

    return NextResponse.json({ success: true, result: finalResult });

  } catch (error: any) {
    // Graceful error handling for Rate Limits
    return NextResponse.json({ success: true, result: "⚠️ System Busy (Rate Limit). Please wait 30s." });
  }
}