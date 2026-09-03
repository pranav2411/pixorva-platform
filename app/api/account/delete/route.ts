import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();

    // 1. Authenticate requesting user
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // 2. Initialize Supabase Admin with Service Role Key for permanent erasure
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

    // 3. Purge all related user data in public tables
    await supabaseAdmin.from("agents").delete().eq("user_id", userId);
    await supabaseAdmin.from("orders").delete().eq("user_id", userId);
    await supabaseAdmin.from("audit_logs").delete().eq("user_id", userId);
    await supabaseAdmin.from("api_keys").delete().eq("user_id", userId);
    await supabaseAdmin.from("profiles").delete().eq("id", userId);

    // 4. Completely delete the user from auth.users so they can start 100% fresh if they return
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error("Error deleting auth user:", deleteUserError);
      return NextResponse.json({ error: deleteUserError.message }, { status: 500 });
    }

    // 5. Sign out and clear cookies
    await supabaseUser.auth.signOut();

    return NextResponse.json({ success: true, message: "Account and all associated data permanently erased." });
  } catch (err: any) {
    console.error("Failed to erase user account:", err);
    return NextResponse.json({ error: err.message || "Failed to erase account" }, { status: 500 });
  }
}
