import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check for registration cookie
        const cookieStore = await cookies();
        const registrationDataCookie = cookieStore.get("registration_data");

        console.log("Auth Callback: User found:", user.id);
        console.log("Auth Callback: Cookie found:", !!registrationDataCookie);

        if (registrationDataCookie) {
          try {
            const registrationData = JSON.parse(registrationDataCookie.value);
            console.log("Auth Callback: Registration Data:", registrationData);
            
            const { firstName, lastName, jobTitle, enrollmentId } =
              registrationData;

            // Use the secure RPC to join the store
            const { data: rpcData, error: rpcError } = await supabase.rpc("join_store", {
              provided_enrollment_id: enrollmentId,
            });

            if (rpcError) {
              console.error("Auth Callback: RPC failed:", rpcError);
              return NextResponse.redirect(`${origin}/onboarding?error=invalid_code`);
            }

            const result = rpcData as { success: boolean; error?: string; store_id?: string };

            if (!result.success) {
               console.error("Auth Callback: Join store failed:", result.error);
               return NextResponse.redirect(`${origin}/onboarding?error=invalid_code`);
            }

            console.log("Auth Callback: User successfully linked via RPC.");

            // 3. Clear cookie
            cookieStore.delete("registration_data");
          } catch (e) {
            console.error("Error processing registration cookie:", e);
            return NextResponse.redirect(`${origin}/auth/auth-code-error?error=cookie_processing`);
          }
        } else {
          console.log("Auth Callback: No registration cookie. Checking existing user status.");
          // Normal login flow: Check if user has a store_id
          const { data: userData } = await supabase
            .from("users")
            .select("store_id")
            .eq("user_id", user.id)
            .single();

          if (!userData?.store_id) {
            console.log("Auth Callback: User has no store_id. Redirecting to onboarding.");
            return NextResponse.redirect(`${origin}/onboarding`);
          }
        }
      }

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
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
