"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchRepos, createRepo, deleteRepo as apiDeleteRepo, triggerRun as apiTriggerRun } from "@/lib/api";
import { toast } from "@/lib/toast";

export interface Repository {
  id: string;
  repo_url: string;
  branch: string;
  enabled: boolean;
  max_iterations: number;
  framework?: string;
  created_at: string;
}

export function useRepos() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRepos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRepos();
      setRepos(data || []);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch repositories:", err);
      setError(err.message);
      toast.error("Failed to load repo network");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRepos();
  }, [loadRepos]);

  const addRepo = async (config: { repo_url: string; branch: string; max_iterations?: number }) => {
    try {
      const newRepo = await createRepo({
        ...config,
        auto_repair: true // Enabled by default as per user request
      });
      setRepos((prev) => [...prev, newRepo]);
      toast.success("Repository connected successfully");
      return newRepo;
    } catch (err: any) {
      toast.error(err.message || "Failed to connect repository");
      throw err;
    }
  };

  const removeRepo = async (id: string) => {
    try {
      await apiDeleteRepo(id);
      setRepos((prev) => prev.filter((r) => r.id !== id));
      toast.success("Connection terminated");
    } catch (err: any) {
      toast.error("Failed to delete repository");
    }
  };

  const [isTriggering, setIsTriggering] = useState<string | null>(null);

  const triggerRun = async (repoId: string, branch: string) => {
    setIsTriggering(repoId);
    try {
      const result = await apiTriggerRun(repoId, branch);
      toast.success("Autonomous cycle initialized");
      return result;
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize cycle");
      throw err;
    } finally {
      setIsTriggering(null);
    }
  };

  return {
    repos,
    loading,
    error,
    isTriggering,
    refresh: loadRepos,
    addRepo,
    removeRepo,
    triggerRun
  };
}
