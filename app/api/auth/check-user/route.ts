import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ exists: false, error: "Email is required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Check if user exists in auth.users
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      // Fallback to checking profiles table
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .ilike("email", cleanEmail)
        .maybeSingle();

      return NextResponse.json({ exists: Boolean(profile) });
    }

    const foundUser = data.users.find(
      (u) => u.email?.toLowerCase() === cleanEmail
    );

    return NextResponse.json({ exists: Boolean(foundUser) });
  } catch (err: any) {
    return NextResponse.json({ exists: false, error: err.message }, { status: 500 });
  }
}
