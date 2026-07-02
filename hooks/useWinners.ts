"use client";

import { useCallback, useEffect, useState } from "react";

import type { Registrant } from "@/types/registration";

import { listWinners } from "@/services/wheel";

interface UseWinnersResult {
  winners: Registrant[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useWinners(): UseWinnersResult {
  const [winners, setWinners] = useState<Registrant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setWinners(await listWinners());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "โหลดรายชื่อผู้ชนะไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [refresh]);

  return { winners, isLoading, error, refresh };
}
