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
    } else if (runs.length >= 5) {
      result.push({
        title: "Anomaly Detection",
        body: "No patterns detected yet. Run more fixes to reveal insights.",
        type: "error"
      });
    }

    // 2. Best performing repo
    const repoStats: Record<string, { total: number; fixed: number }> = {};
    runs.forEach(run => {
      if (!repoStats[run.repo]) repoStats[run.repo] = { total: 0, fixed: 0 };
      repoStats[run.repo].total++;
      if (run.status === "completed") repoStats[run.repo].fixed++;
    });

    const topRepo = Object.entries(repoStats)
      .filter(([_, stats]) => stats.total >= 3)
      .sort((a, b) => (b[1].fixed / b[1].total) - (a[1].fixed / a[1].total))[0];

    if (topRepo) {
      const rate = Math.round((topRepo[1].fixed / topRepo[1].total) * 100);
      result.push({
        title: "Resolution Efficiency",
        body: `${topRepo[0]} has a ${rate}% autonomous resolution rate.`,
        type: "performance"
      });
    }

    // 3. Peak failure time
    if (runs.filter(r => r.status === "failed" || r.status === "escalated").length >= 10) {
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
