"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { DashboardCounts } from "@/types/sheet";
import type { ImportRegistrant, ImportResult, Registrant } from "@/types/registration";

import {
  importRegistrants as importRegistrantsService,
  listRegistrants,
  resetDatabase as resetDatabaseService,
} from "@/services/sheet";

interface UseRegistrantsResult {
  registrants: Registrant[];
  counts: DashboardCounts;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  resetDatabase: () => Promise<number>;
  importRows: (rows: ImportRegistrant[]) => Promise<ImportResult>;
}

export function useRegistrants(): UseRegistrantsResult {
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setRegistrants(await listRegistrants());
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "โหลดข้อมูลไม่สำเร็จ";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetDatabase = useCallback(async () => {
    const result = await resetDatabaseService();
    await refresh();
    return result.cleared;
  }, [refresh]);

  const importRows = useCallback(
    async (rows: ImportRegistrant[]) => {
      const result = await importRegistrantsService(rows);
      await refresh();
      return result;
    },
    [refresh],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [refresh]);

  const counts = useMemo<DashboardCounts>(() => {
    const winnerCount = registrants.filter((registrant) => registrant.winner).length;
    return {
      totalRegistered: registrants.length,
      remaining: registrants.length - winnerCount,
      winnerCount,
    };
  }, [registrants]);

  return {
    registrants,
    counts,
    isLoading,
    error,
    refresh,
    resetDatabase,
    importRows,
  };
}
