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
      
      // Step 1 check - GitHub OAuth provider match
      const isGithubConnected = session.user.app_metadata.provider === "github" || 
                               session.provider_token != null;

      // Other checks across tables
      try {
        const [repoRes, runRes, prRes] = await Promise.all([
          supabase.from("repo_configs").select("id").eq("user_id", userId).limit(1),
          supabase.from("runs").select("id").eq("user_id", userId).limit(1),
          supabase.from("runs").select("pr_url").eq("user_id", userId).not("pr_url", "is", null).limit(1)
        ]);

        if (isMounted) {
          setSteps({
            github: isGithubConnected,
            repo: (repoRes.data?.length ?? 0) > 0,
            run: (runRes.data?.length ?? 0) > 0,
            pr: (prRes.data?.length ?? 0) > 0
          });
        }
      } catch (err) {
        console.error("DC_ONBOARDING: Error checking state:", err);
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
