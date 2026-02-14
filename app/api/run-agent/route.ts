import { NextResponse } from 'next/server';

// This is the "Engine" that runs your agent
export async function POST(req: Request) {
  try {
    const { steps } = await req.json();
    const logs: string[] = [];

    // 1. Start the Engine
    logs.push("🚀 Starting Agent Workflow...");
    
    // 2. Loop through every step in the blueprint
    for (const step of steps) {
        
        // Simulate "Thinking" time (500ms)
        await new Promise(r => setTimeout(r, 500));

        // 3. Execute logic based on the Icon/Type
        switch (step.name.toLowerCase()) {
            case 'manual trigger':
                logs.push(`✅ [TRIGGER] Workflow started manually.`);
                break;
            
            case 'scrape twitter':
            case 'twitter':
                logs.push(`🐦 [ACTION] Scraping Twitter... Found 3 new tweets about "AI".`);
                break;
            
            case 'check gmail':
            case 'gmail':
            case 'mail':
                logs.push(`📧 [ACTION] Checking Inbox... found 1 unread email from "Boss".`);
                break;
            
            case 'send email':
                logs.push(`📤 [ACTION] Sending Reply... Email sent successfully!`);
                break;

            default:
                logs.push(`⚡ [STEP] Executing ${step.name}... Done.`);
                break;
        }
    }

    logs.push("🏁 Workflow Completed Successfully.");

    return NextResponse.json({ success: true, logs });

  } catch (error) {
    return NextResponse.json({ success: false, error: "Engine Failure" }, { status: 500 });
  }
}