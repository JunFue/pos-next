import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  let next = requestUrl.searchParams.get("next") ?? "/";

  // Sanitize redirect target to avoid redirecting back to callback or error loops
  if (
    !next.startsWith("/") ||
    next.includes("callback") ||
    next.includes("auth-code-error") ||
    next.startsWith("/api/")
  ) {
    next = "/";
  }

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
    console.error("Auth Callback Error - exchangeCodeForSession failed:", error);
  }

  // Check if session already exists
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}
