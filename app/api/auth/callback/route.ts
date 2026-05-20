import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  console.log("=== Auth Callback Debug ===");
  console.log("Received code:", code ? "YES" : "NO");
  console.log("Next redirect:", next);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth Callback Error - exchangeCodeForSession failed:", error);
    } else {
      console.log("Successfully exchanged code for session.");
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("Authenticated User ID:", user?.id);

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  } else {
    console.error("Auth Callback Error - No code was present in the URL.");
    // also log any other params like error_description that supabase might have sent
    console.log("Other search params:", Object.fromEntries(searchParams.entries()));
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
