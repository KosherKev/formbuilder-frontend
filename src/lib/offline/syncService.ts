/**
 * Sync Service - Handles syncing offline responses with the server
 */

import { indexedDBManager, PendingResponse } from "./indexedDB";
import api from "../api/client";

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  conflicts: number;
  details: Array<{
    clientId: string;
    status: "synced" | "failed" | "conflict";
    responseId?: string;
    error?: string;
  }>;
}

class SyncService {
  private isSyncing = false;
  private syncListeners: Array<(result: SyncResult) => void> = [];

  /**
   * Check if currently online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Get pending responses count
   */
  async getPendingCount(): Promise<number> {
    const pending = await indexedDBManager.getAllPendingResponses();
    return pending.filter((r) => r.syncStatus === "pending").length;
  }

  /**
   * Sync all pending responses
   */
  async syncPendingResponses(): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log("⏳ Sync already in progress");
      return {
        success: false,
        synced: 0,
        failed: 0,
        conflicts: 0,
        details: [],
      };
    }

    if (!this.isOnline()) {
      console.log("📴 Cannot sync - offline");
      return {
        success: false,
        synced: 0,
        failed: 0,
        conflicts: 0,
        details: [],
      };
    }

    this.isSyncing = true;
    console.log("🔄 Starting sync...");

    let pendingResponses: PendingResponse[] = [];

    try {
      pendingResponses = await indexedDBManager.getPendingResponsesByStatus("pending");

      if (pendingResponses.length === 0) {
        console.log("✅ No pending responses to sync");
        this.isSyncing = false;
        return {
          success: true,
          synced: 0,
          failed: 0,
          conflicts: 0,
          details: [],
        };
      }

      console.log(`📤 Syncing ${pendingResponses.length} pending responses...`);

      // Prepare batch sync request
      const syncData = {
        responses: pendingResponses.map((r) => ({
          clientId: r.clientId,
          formId: r.formId,
          answers: r.answers,
          timing: r.timing,
          metadata: r.metadata,
        })),
      };

      // Send to server
      const response = await api.post("/responses/sync", syncData);
      const result: SyncResult = response.data;

      // Update local status based on server response
      await Promise.all(
        result.details.map(async (detail) => {
          if (detail.status === "synced") {
            await indexedDBManager.updatePendingResponseStatus(detail.clientId, "synced");
            // Optionally delete synced responses after a delay
            setTimeout(() => {
              indexedDBManager.deletePendingResponse(detail.clientId);
            }, 30000); // Keep for 30 seconds for confirmation
          } else if (detail.status === "failed") {
            await indexedDBManager.updatePendingResponseStatus(
              detail.clientId,
              "failed",
              detail.error
            );
          } else if (detail.status === "conflict") {
            await indexedDBManager.updatePendingResponseStatus(
              detail.clientId,
              "failed",
              "Conflict detected"
            );
          }
        })
      );

      console.log("✅ Sync complete:", result);

      // Notify listeners
      this.notifyListeners(result);

      this.isSyncing = false;
      return result;
    } catch (error: any) {
      console.error("❌ Sync failed:", error);
      this.isSyncing = false;

      return {
        success: false,
        synced: 0,
        failed: pendingResponses.length,
        conflicts: 0,
        details: pendingResponses.map((r) => ({
          clientId: r.clientId,
          status: "failed",
          error: error.message || "Network error",
        })),
      };
    }
  }

  /**
   * Sync a single response
   */
  async syncSingleResponse(clientId: string): Promise<boolean> {
    const response = await indexedDBManager.getPendingResponse(clientId);
    if (!response || response.syncStatus !== "pending") {
      return false;
    }

    try {
      await indexedDBManager.updatePendingResponseStatus(clientId, "syncing");

      const syncData = {
        responses: [
          {
            clientId: response.clientId,
            formId: response.formId,
            answers: response.answers,
            timing: response.timing,
            metadata: response.metadata,
          },
        ],
      };

      const result = await api.post("/responses/sync", syncData);

      if (result.data.success && result.data.synced > 0) {
        await indexedDBManager.updatePendingResponseStatus(clientId, "synced");
        setTimeout(() => {
          indexedDBManager.deletePendingResponse(clientId);
        }, 30000);
        return true;
      } else {
        await indexedDBManager.updatePendingResponseStatus(
          clientId,
          "failed",
          "Sync failed on server"
        );
        return false;
      }
    } catch (error: any) {
      await indexedDBManager.updatePendingResponseStatus(
        clientId,
        "failed",
        error.message || "Network error"
      );
      return false;
    }
  }

  /**
   * Check sync status for specific client IDs
   */
  async checkSyncStatus(clientIds: string[]): Promise<
    Array<{
      clientId: string;
      status: "synced" | "pending" | "failed";
      responseId?: string;
      syncedAt?: string;
    }>
  > {
    try {
      const response = await api.get("/responses/sync-status", {
        params: { clientIds: clientIds.join(",") },
      });

      return response.data.statuses;
    } catch (error) {
      console.error("Failed to check sync status:", error);
      // Fallback to local status
      const statuses = await Promise.all(
        clientIds.map(async (clientId) => {
          const localResponse = await indexedDBManager.getPendingResponse(clientId);
          return {
            clientId,
            status: localResponse?.syncStatus || "pending",
          };
        })
      );
      return statuses as any;
    }
  }

  /**
   * Retry failed syncs
   */
  async retryFailedSyncs(): Promise<SyncResult> {
    const failedResponses = await indexedDBManager.getPendingResponsesByStatus("failed");

    // Filter responses that haven't exceeded retry limit
    const retriableResponses = failedResponses.filter((r) => r.retryCount < 3);

    if (retriableResponses.length === 0) {
      return {
        success: true,
        synced: 0,
        failed: 0,
        conflicts: 0,
        details: [],
      };
    }

    // Reset to pending
    await Promise.all(
      retriableResponses.map((r) => indexedDBManager.updatePendingResponseStatus(r.clientId, "pending"))
    );

    // Attempt sync
    return this.syncPendingResponses();
  }

  /**
   * Auto-sync when coming back online
   */
  enableAutoSync(): void {
    window.addEventListener("online", () => {
      console.log("📶 Back online - auto-syncing...");
      setTimeout(() => {
        this.syncPendingResponses();
      }, 2000); // Wait 2 seconds to ensure connection is stable
    });

    // Also check periodically if online
    setInterval(() => {
      if (this.isOnline() && !this.isSyncing) {
        this.syncPendingResponses();
      }
    }, 60000); // Every minute
  }

  /**
   * Subscribe to sync events
   */
  onSync(callback: (result: SyncResult) => void): () => void {
    this.syncListeners.push(callback);

    // Return unsubscribe function
    return () => {
      this.syncListeners = this.syncListeners.filter((cb) => cb !== callback);
    };
  }

  private notifyListeners(result: SyncResult): void {
    this.syncListeners.forEach((callback) => {
      try {
        callback(result);
      } catch (error) {
        console.error("Error in sync listener:", error);
      }
    });
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(): Promise<{
    total: number;
    pending: number;
    synced: number;
    failed: number;
    oldestPending?: Date;
  }> {
    const allResponses = await indexedDBManager.getAllPendingResponses();

    const stats = {
      total: allResponses.length,
      pending: allResponses.filter((r) => r.syncStatus === "pending").length,
      synced: allResponses.filter((r) => r.syncStatus === "synced").length,
      failed: allResponses.filter((r) => r.syncStatus === "failed").length,
      oldestPending: undefined as Date | undefined,
    };

    const pendingResponses = allResponses.filter((r) => r.syncStatus === "pending");
    if (pendingResponses.length > 0) {
      const oldest = pendingResponses.reduce((oldest, current) =>
        current.createdAt < oldest.createdAt ? current : oldest
      );
      stats.oldestPending = new Date(oldest.createdAt);
    }

    return stats;
  }

  /**
   * Clear all synced responses older than specified days
   */
  async clearOldSyncedResponses(daysOld: number = 7): Promise<number> {
    const syncedResponses = await indexedDBManager.getPendingResponsesByStatus("synced");
    const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;

    const oldResponses = syncedResponses.filter((r) => r.createdAt < cutoffTime);

    await Promise.all(oldResponses.map((r) => indexedDBManager.deletePendingResponse(r.clientId)));

    console.log(`🗑️ Cleared ${oldResponses.length} old synced responses`);
    return oldResponses.length;
  }
}

// Singleton instance
export const syncService = new SyncService();
