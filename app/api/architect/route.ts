import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 1. Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: You must be logged in to build workflows." },
        { status: 401 }
      );
    }

    const { message } = await req.json();
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message prompt is required." }, { status: 400 });
    }

    // Limit input length to prevent prompt stuffing and token burn
    const cleanMessage = message.trim().slice(0, 500);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 3. The "System Prompt" - Teaching the AI how to behave
    const prompt = `
      You are the PIXORVA Architect. Your job is to listen to the user and generate a "Workflow Step" for their AI Agent.
      
      User Input: "${cleanMessage}"
      
      You must return a STRICT JSON object (no markdown, no backticks) with two fields:
      1. "reply": A short, professional confirmation message (e.g., "I've added a LinkedIn Scraper to your workflow.").
      2. "step": An object containing:
         - "type": either "trigger" (if it starts the flow) or "action" (if it does something).
         - "name": A short title for the step (e.g., "Scrape LinkedIn", "Send Email").
         - "icon": Choose the best icon name from this list: ["Zap", "Send", "MessageSquare", "Play", "Search", "Database", "Clock", "Globe", "Mail", "Twitter"].

      Example Response:
      {
        "reply": "I've added a step to check for new emails every hour.",
        "step": { "type": "trigger", "name": "Check Gmail", "icon": "Clock" }
      }
    `;

    // 4. Ask Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 5. Clean up the response (Gemini sometimes adds \`\`\`json ... \`\`\` wrappers)
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // 6. Parse and Return
    let data;
    try {
        data = JSON.parse(cleanJson);
    } catch (parseError) {
        // Fallback if AI returns bad JSON
        console.error("JSON Parse Error:", parseError);
        return NextResponse.json({ 
            reply: "I understood that, but I had trouble formatting the blueprint. Try again?",
            step: null 
        });
    }
    
    return NextResponse.json(data);

  } catch (error) {
    console.error("AI Brain Error:", error);
    return NextResponse.json({ 
        reply: "I'm having trouble connecting to my neural network. Please try again.",
        step: null 
    }, { status: 500 });
  }
}