import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Execute a simple select query to keep the database awake
    const { data, error } = await supabase
      .from('agents')
      .select('id')
      .limit(1);

    if (error) {
      console.warn("Supabase ping query warning:", error.message);
      return NextResponse.json({ 
        success: true, 
        message: "Database connection reached, but query failed (likely because tables are not yet created).",
        error: error.message 
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Database connection active and queried successfully.",
      data 
    });
  } catch (error: unknown) {
    console.error("Cron ping error:", error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}
