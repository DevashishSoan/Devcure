import { useState, useEffect } from "react";
import { fetchRuns, supabase } from "@/lib/api";

export function useRuns(limit: number = 10) {
  const [runs, setRuns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initialLoad() {
      try {
        const data = await fetchRuns(); // fetchRuns already orders and limits to 50
        if (isMounted) {
          setRuns(data.slice(0, limit));
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load runs");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initialLoad();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("runs-live-dashboard")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "runs",
        },
        async (payload) => {
          if (!isMounted) return;

          if (payload.eventType === "INSERT") {
            setRuns((prev) => [payload.new, ...prev].slice(0, limit));
          } else if (payload.eventType === "UPDATE") {
            setRuns((prev) => 
              prev.map((run) => (run.id === payload.new.id ? payload.new : run))
            );
          } else if (payload.eventType === "DELETE") {
            setRuns((prev) => prev.filter((run) => run.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [limit]);

  return { runs, isLoading, error };
}
