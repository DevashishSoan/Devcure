import { useState, useEffect } from "react";
import { fetchStats } from "@/lib/api";

export function useStats() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        const data = await fetchStats();
        console.log('Stats response:', data); // Diagnostic log for data shape
        if (isMounted) {
          setStats(data?.data || data); // Correctly handle nested or flat response
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load stats");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadStats();

    // Refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { stats, isLoading, error };
}
