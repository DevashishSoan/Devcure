import { useState, useEffect } from "react";
import { supabase } from "@/lib/api";

export interface OnboardingSteps {
  github: boolean;
  repo: boolean;
  run: boolean;
  pr: boolean;
}

export function useOnboardingState() {
  const [steps, setSteps] = useState<OnboardingSteps>({
    github: false,
    repo: false,
    run: false,
    pr: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAll() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !isMounted) {
        setLoading(false);
        return;
      }

      const userId = session.user.id;
      
      // Step 1 check - Mark as complete for any authenticated session (Email or Github)
      // This ensures "Identify Gateway" is checked if the user is logged in.
      const isGithubConnected = !!session.user;

      // Other checks across tables
      try {
        const [repoRes, runRes, prRes] = await Promise.all([
          supabase.from("repo_configs").select("id").eq("user_id", userId).limit(1),
          supabase.from("runs").select("id").eq("user_id", userId).limit(1),
          supabase.from("runs").select("pr_url").eq("user_id", userId).not("pr_url", "is", null).limit(1)
        ]);

        if (repoRes.error) console.error("DC_ONBOARDING: repo_configs check failed:", repoRes.error);
        if (runRes.error) console.error("DC_ONBOARDING: runs check failed:", runRes.error);
        if (prRes.error) console.error("DC_ONBOARDING: PR check failed:", prRes.error);

        if (isMounted) {
          setSteps({
            github: isGithubConnected,
            repo: (repoRes.data?.length ?? 0) > 0,
            run: (runRes.data?.length ?? 0) > 0,
            pr: (prRes.data?.length ?? 0) > 0
          });
        }
      } catch (err) {
        console.error("DC_ONBOARDING: Critical error checking state:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkAll();

    // Re-check on a slower interval or when session might have changed
    const interval = setInterval(checkAll, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const completedCount = Object.values(steps).filter(Boolean).length;
  const allComplete = completedCount === 4;

  return { steps, loading, completedCount, allComplete };
}
