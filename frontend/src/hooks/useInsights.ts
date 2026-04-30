import { useMemo } from "react";
import { formatMTTR } from "@/lib/utils";

export interface InsightCard {
  title: string;
  body: string;
  type: "error" | "performance" | "time" | "mttr";
}

export function useInsights(runs: any[]) {
  const insights = useMemo(() => {
    if (!runs || runs.length === 0) return [];

    const result: InsightCard[] = [];

    // 1. Most common error class
    const errorCounts: Record<string, number> = {};
    let totalFailures = 0;
    runs.forEach(run => {
      if (run.status === "failed" || run.status === "escalated") {
        totalFailures++;
        (run.error_classes || []).forEach((cls: string) => {
          errorCounts[cls] = (errorCounts[cls] || 0) + 1;
        });
      }
    });

    const topError = Object.entries(errorCounts).sort((a, b) => b[1] - a[1])[0];
    if (topError && totalFailures > 0) {
      const percentage = Math.round((topError[1] / totalFailures) * 100);
      result.push({
        title: "Anomaly Detection",
        body: `${topError[0]} errors account for ${percentage}% of all failures this week.`,
        type: "error"
      });
    } else if (runs.length >= 3) {
      // Aggregate system health fallback
      const resolvedCount = runs.filter(r => r.status === "completed").length;
      const totalCount = runs.length;
      const healthPct = Math.round((resolvedCount / totalCount) * 100);
      result.push({
        title: "System Health",
        body: `${resolvedCount} of ${totalCount} recent runs resolved autonomously (${healthPct}% success rate).`,
        type: "performance"
      });
    }

    // 2. Resolution Efficiency (Refined)
    const repoStats: Record<string, { total: number; fixed: number; recentFixed: number }> = {};
    runs.forEach((r, i) => {
      if (!repoStats[r.repo]) repoStats[r.repo] = { total: 0, fixed: 0, recentFixed: 0 };
      repoStats[r.repo].total++;
      if (r.status === "completed") {
        repoStats[r.repo].fixed++;
        // Weight recent runs more heavily
        if (i < 5) repoStats[r.repo].recentFixed += 2;
        else repoStats[r.repo].recentFixed += 1;
      }
    });

    const topRepo = Object.entries(repoStats)
      .filter(([_, stats]) => stats.total >= 2)
      .sort((a, b) => b[1].recentFixed - a[1].recentFixed)[0];

    if (topRepo) {
      const rate = Math.round((topRepo[1].fixed / topRepo[1].total) * 100);
      result.push({
        title: "Resolution Efficiency",
        body: `${topRepo[0]} has a ${rate}% autonomous resolution rate over ${topRepo[1].total} cycles.`,
        type: "performance"
      });
    }

    // 4. Complexity Warning (NEW)
    const complexRuns = runs.filter(r => r.status === "escalated" && r.trajectory?.some((t: any) => t.log?.includes("npm install") && t.log?.includes("timeout")));
    if (complexRuns.length > 0) {
      result.push({
        title: "Complexity Warning",
        body: `Detected timeouts during environment setup for ${complexRuns[0].repo}. Consider splitting the repo or increasing sandbox RAM.`,
        type: "performance"
      });
    }

    // 3. Peak failure time
    if (runs.filter(r => r.status === "failed" || r.status === "escalated").length >= 5) {
      const hours = runs.filter(r => r.status === "failed")
        .map(r => new Date(r.created_at).getUTCHours());
      const hourCounts: Record<number, number> = {};
      hours.forEach(h => hourCounts[h] = (hourCounts[h] || 0) + 1);
      const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
      if (peakHour) {
        const h = parseInt(peakHour[0]);
        result.push({
          title: "Peak Stress Periods",
          body: `Most failures occur between ${h.toString().padStart(2, '0')}:00-${(h + 2).toString().padStart(2, '0')}:00 UTC.`,
          type: "time"
        });
      }
    }

    return result;
  }, [runs]);

  return insights;
}
