import { createServerClient, type CookieOptions } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const next = searchParams.get("next") ?? "/dashboard";

  // If Supabase returned an error (e.g. from the provider), log it and redirect
  if (error) {
    console.error("DC_AUTH: Callback received error from provider:", { error, errorDescription });
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDescription || error)}`);
  }

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
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
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    const userId = session?.user?.id;
    const githubToken = session?.provider_token;
    const githubUsername = session?.user?.user_metadata?.user_name;

    if (!exchangeError && userId) {
      console.log("DC_AUTH: Session established, upserting profile for", userId);
      
      // Upsert GitHub token and username into user_profiles
      await supabase.from("user_profiles").upsert({
        user_id: userId,
        github_access_token: githubToken,
        github_username: githubUsername,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });

      // --- Experiment Identity Bridging ---
      const anonymousId = cookieStore.get('devcure_anon_id')?.value;
      if (anonymousId) {
        console.log("DC_AUTH: Linking anonymous_id to user_id", { anonymousId, userId });
        await supabase
          .from('ab_events')
          .update({ user_id: userId })
          .eq('anonymous_id', anonymousId)
          .is('user_id', null);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }

    if (exchangeError) {
      console.error("DC_AUTH: Code exchange failed:", exchangeError.message);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(exchangeError.message)}`);
    }
  }

  // No code and no error — shouldn't happen
  return NextResponse.redirect(`${origin}/login`);
}
