/**
 * useOffline Hook - Manage offline state and functionality
 */

import { useState, useEffect, useCallback } from "react";
import { offlineManager } from "../lib/offline/offlineManager";
import { syncService } from "../lib/offline/syncService";
import { indexedDBManager, PendingResponse, CachedForm } from "../lib/offline/indexedDB";

export interface OfflineStats {
  isOnline: boolean;
  pendingCount: number;
  syncedCount: number;
  failedCount: number;
  totalPending: number;
  isSyncing: boolean;
  lastSyncTime?: Date;
  oldestPending?: Date;
}

export interface StorageInfo {
  usage: number;
  quota: number;
  percentage: number;
  usageFormatted: string;
  quotaFormatted: string;
}

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true);
  const [stats, setStats] = useState<OfflineStats>({
    isOnline: true,
    pendingCount: 0,
    syncedCount: 0,
    failedCount: 0,
    totalPending: 0,
    isSyncing: false,
  });
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    usage: 0,
    quota: 0,
    percentage: 0,
    usageFormatted: "0 Bytes",
    quotaFormatted: "0 Bytes",
  });

  // Update stats
  const updateStats = useCallback(async () => {
    try {
      const syncStats = await syncService.getSyncStats();
      const storage = await offlineManager.getStorageInfo();

      setStats((prev) => ({
        ...prev,
        pendingCount: syncStats.pending,
        syncedCount: syncStats.synced,
        failedCount: syncStats.failed,
        totalPending: syncStats.total,
        oldestPending: syncStats.oldestPending,
      }));

      setStorageInfo(storage);
    } catch (error) {
      console.error("Failed to update offline stats:", error);
    }
  }, []);

  // Initialize
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      updateStats();

      // Listen for connection changes
      const unsubscribe = offlineManager.onConnectionChange((online) => {
        setIsOnline(online);
        setStats((prev) => ({ ...prev, isOnline: online }));

        if (online) {
          // Auto-sync when coming back online
          setTimeout(() => {
            syncAll();
          }, 2000);
        }
      });

      // Listen for sync events
      const unsubscribeSync = syncService.onSync((result) => {
        setStats((prev) => ({
          ...prev,
          isSyncing: false,
          lastSyncTime: new Date(),
        }));
        updateStats();
      });

      // Update stats periodically
      const interval = setInterval(updateStats, 30000); // Every 30 seconds

      return () => {
        unsubscribe();
        unsubscribeSync();
        clearInterval(interval);
      };
    }
  }, [updateStats]);

  // Sync all pending responses
  const syncAll = useCallback(async () => {
    setStats((prev) => ({ ...prev, isSyncing: true }));
    try {
      await syncService.syncPendingResponses();
      await updateStats();
    } catch (error) {
      console.error("Sync failed:", error);
      setStats((prev) => ({ ...prev, isSyncing: false }));
    }
  }, [updateStats]);

  // Retry failed syncs
  const retryFailed = useCallback(async () => {
    setStats((prev) => ({ ...prev, isSyncing: true }));
    try {
      await syncService.retryFailedSyncs();
      await updateStats();
    } catch (error) {
      console.error("Retry failed:", error);
      setStats((prev) => ({ ...prev, isSyncing: false }));
    }
  }, [updateStats]);

  // Get pending responses
  const getPendingResponses = useCallback(async () => {
    return indexedDBManager.getAllPendingResponses();
  }, []);

  // Get cached forms
  const getCachedForms = useCallback(async () => {
    return indexedDBManager.getAllCachedForms();
  }, []);

  // Clear all offline data
  const clearAllData = useCallback(async () => {
    await offlineManager.clearAllData();
    await updateStats();
  }, [updateStats]);

  return {
    isOnline,
    stats,
    storageInfo,
    syncAll,
    retryFailed,
    getPendingResponses,
    getCachedForms,
    clearAllData,
    updateStats,
  };
}

export default useOffline;
