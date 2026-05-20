import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export default async function proxy(request: NextRequest) {
  // ============================================
  // MAINTENANCE MODE GUARD
  // ============================================
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === "true";
  const isMaintenancePage = request.nextUrl.pathname === "/maintenance";
  const hasAdminCookie = request.cookies.get("admin")?.value === "true";

  // If maintenance mode is enabled
  if (isMaintenanceMode) {
    const isPwaAsset = 
      request.nextUrl.pathname === "/manifest.json" || 
      request.nextUrl.pathname === "/sw.js" ||
      request.nextUrl.pathname === "/sw.js.map";

    // Allow access to the maintenance page itself or PWA assets
    if (isMaintenancePage || isPwaAsset) {
      return NextResponse.next();
    }

    // Allow admins with the special cookie to bypass maintenance
    if (hasAdminCookie) {
      // Continue to normal middleware flow
    } else {
      // Redirect all other traffic to the maintenance page
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
  } else {
    // If maintenance mode is OFF, redirect away from maintenance page
    if (isMaintenancePage) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // ============================================
  // NORMAL MIDDLEWARE FLOW
  // ============================================
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 1. Authenticate User
  let user = null;
  let authError = null;
  let isLikelyOffline = false;

  try {
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
    user = supabaseUser;
    authError = error;
  } catch (err: any) {
    console.error("Supabase auth check failed (potential offline state):", err.message);
    isLikelyOffline = true;
  }

  // If there's an error and it's a network error/offline
  if (authError) {
    isLikelyOffline = isLikelyOffline || 
      authError.message?.includes("fetch") || 
      authError.message?.includes("network") || 
      authError.message?.includes("fetch failed") ||
      authError.status === 0;
  }

  const hasAuthCookie = request.cookies.getAll().some(c => c.name.startsWith('sb-') && c.name.includes('-auth-token'));

  // ============================================
  // AUTHENTICATION GUARD
  // ============================================
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth");
  const isSelectStorePageP = request.nextUrl.pathname.startsWith("/select-store");
  const isOfflinePage = request.nextUrl.pathname === "/~offline";
  
  const isPwaAsset = 
    request.nextUrl.pathname === "/manifest.json" || 
    request.nextUrl.pathname === "/sw.js" ||
    request.nextUrl.pathname === "/sw.js.map" ||
    request.nextUrl.pathname.startsWith("/punch-icon");

  const isPublicRoute = isLoginPage || isApiRoute || isMaintenancePage || isAuthRoute || isSelectStorePageP || isPwaAsset || isOfflinePage;

  // If user is not logged in and trying to access a protected route
  // [NEW] If we are offline but have an auth cookie, we assume they are logged in to allow PWA to work
  if (!user && !isPublicRoute && !(isLikelyOffline && hasAuthCookie)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user is logged in and trying to access login page, redirect to home
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ============================================
  // ACCOUNT STATUS & PROFILE & SUBSCRIPTION GUARD
  // ============================================
  // Uses JWT custom claims if present (from custom_access_token hook).
  // Falls back to DB queries if the hook hasn't been enabled yet.
  if (user && !isApiRoute && !isLikelyOffline) {
    // getUser() validates auth but returns DB data, not JWT claims.
    // The custom_access_token hook injects data into the JWT, so we
    // need getSession() to read those claims.
    const { data: { session } } = await supabase.auth.getSession();
    
    // session.user.app_metadata returns DB-stored metadata, NOT hook-injected claims.
    // The custom_access_token hook injects claims into the raw JWT, so we decode it directly.
    let claims: Record<string, any> = {};
    if (session?.access_token) {
      try {
        const payload = JSON.parse(Buffer.from(session.access_token.split('.')[1], 'base64').toString());
        claims = payload.app_metadata || {};
      } catch {
        claims = session?.user?.app_metadata || {};
      }
    }
    const hookIsActive = claims.account_status !== undefined;

    let status: string;
    let hasStore: boolean;
    let hasName: boolean;
    let hasJobTitle: boolean;
    let subStatus: string | undefined;
    let subEndDateRaw: string | undefined;

    if (hookIsActive) {
      // ---- FAST PATH: Read from JWT claims (no DB queries) ----
      status = claims.account_status;
      hasStore = claims.store_id !== undefined && claims.store_id !== null;
      hasName = claims.has_name === true;
      hasJobTitle = claims.has_job_title === true;
      subStatus = claims.sub_status;
      subEndDateRaw = claims.sub_end_date;
    } else {
      // ---- FALLBACK PATH: DB queries (until hook is enabled) ----
      console.warn("[middleware] JWT hook not active — falling back to DB queries");

      // Account status check
      const { data: statusData } = await supabase.rpc("check_account_status");
      status = (statusData as any)?.status || "active";

      // Profile & store check
      const { data: userData } = await supabase
        .from("users")
        .select("store_id, first_name, last_name, metadata")
        .eq("user_id", user.id)
        .single();

      hasStore = !!userData?.store_id;
      hasName = !!userData?.first_name && !!userData?.last_name;
      const jobTitle = (userData?.metadata as { job_title?: string })?.job_title;
      hasJobTitle = !!jobTitle;

      // Subscription check
      if (hasStore && userData?.store_id) {
        const { data: sub } = await supabase
          .from("store_subscriptions")
          .select("status, end_date")
          .eq("store_id", userData.store_id)
          .maybeSingle();
        subStatus = sub?.status;
        subEndDateRaw = sub?.end_date;
      }
    }

    const currentPath = request.nextUrl.pathname;
    const isOnboardingPage = currentPath.startsWith("/onboarding");
    const isSelectStorePage = currentPath.startsWith("/select-store");
    const isSettingsPage = currentPath.startsWith("/settings");

    // --- 1. Fatal Account Status (Highest Priority) ---
    if (status === "user_deleted") {
      if (!currentPath.startsWith("/reactivate")) {
         return NextResponse.redirect(new URL("/reactivate", request.url));
      }
      return response;
    }

    // --- 2. Profile Onboarding Guard ---
    // If they haven't set their name or job title, they MUST go to onboarding.
    if (!hasName || !hasJobTitle) {
      if (!isOnboardingPage) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
      return response; // Stay on onboarding to allow setup
    }

    // --- 3. Store Selection Guard ---
    // User is onboarded but has no store.
    if (!hasStore) {
      if (!isSelectStorePage && !isOnboardingPage && !isSettingsPage) {
        return NextResponse.redirect(new URL("/select-store", request.url));
      }
      // Allow them to stay on select-store, onboarding, or settings (to join via code)
    }

    // --- 4. Secondary Account Status Guard ---
    if (status === "store_deleted" || status === "no_store") {
       if (!isSettingsPage && !isSelectStorePage && !isOnboardingPage && !currentPath.startsWith("/login")) {
          const redirectUrl = new URL("/settings", request.url);
          if (status === "store_deleted") {
            redirectUrl.searchParams.set("reason", "store_deleted");
          }
          return NextResponse.redirect(redirectUrl);
       }
    }
    
    if (status === "active" && currentPath.startsWith("/reactivate")) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // --- 5. Subscription Guard (Only for users with a store) ---
    if (hasStore) {
      let isExpired = true; 
      if (subStatus) {
        const now = new Date();
        const endDate = subEndDateRaw ? new Date(subEndDateRaw) : null;
        const normalizedStatus = subStatus.toUpperCase();
        const isPaid = normalizedStatus === "PAID" || normalizedStatus === "TRIAL" || normalizedStatus === "ACTIVE";
        isExpired = !isPaid || !endDate || endDate <= now;
      }

      const isExemptPage =
        isSettingsPage ||
        currentPath.startsWith("/subscribe-required") ||
        isOnboardingPage ||
        isSelectStorePage;

      const isDemoUser = user?.is_anonymous;
      
      if (isExpired && !isExemptPage && !isDemoUser) {
        return NextResponse.redirect(new URL("/subscribe-required", request.url));
      }
    }
  }


  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
