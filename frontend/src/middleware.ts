import { createServerClient, type CookieOptions } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { calculateVariant } from "./lib/ab-core";

// Helper for server-side onboarding check (simplified for middleware)
async function checkOnboardingCompleteBasic(supabase: any, userId: string): Promise<boolean> {
  const { data: repos } = await supabase.from("repo_configs").select("id").eq("user_id", userId).limit(1);
  const { data: runs } = await supabase.from("runs").select("id").eq("user_id", userId).limit(1);
  return (repos?.length ?? 0) > 0 && (runs?.length ?? 0) > 0;
}

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set(name, value);
          res.cookies.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set(name, "");
          res.cookies.set(name, "", options);
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected roots
  const isProtectedPath = req.nextUrl.pathname.startsWith("/dashboard") ||
                          req.nextUrl.pathname.startsWith("/repos") ||
                          req.nextUrl.pathname.startsWith("/runs") ||
                          req.nextUrl.pathname.startsWith("/sandbox") ||
                          req.nextUrl.pathname.startsWith("/settings");

  if (isProtectedPath && !session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // --- Experiment 2: Onboarding Flow Variant B ---
  if (session && req.nextUrl.pathname === "/dashboard") {
    let variant = calculateVariant('onboarding-flow-v1', session.user.id);
    
    // Allow URL override for testing
    const override = req.nextUrl.searchParams.get('ab_variant');
    if (override === 'A' || override === 'B') {
      variant = override as 'A' | 'B';
    }

    if (variant === 'B') {
      const isComplete = await checkOnboardingCompleteBasic(supabase, session.user.id);
      if (!isComplete) {
        const onboardingUrl = req.nextUrl.clone();
        onboardingUrl.pathname = "/dashboard/onboarding";
        return NextResponse.redirect(onboardingUrl);
      }
    }
  }

  // If user is logged in and trying to access auth pages, redirect to dashboard
  const isAuthPage = req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup";
  if (session && isAuthPage) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/repos/:path*", "/runs/:path*", "/login", "/signup", "/dashboard/onboarding"],
};
