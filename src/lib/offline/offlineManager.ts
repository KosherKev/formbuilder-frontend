/**
 * Offline Manager - Main orchestrator for offline functionality
 */

import { indexedDBManager, CachedForm, PendingResponse } from "./indexedDB";
import { syncService } from "./syncService";
import { formService } from "../api/forms";
import { responseService } from "../api/responses";
import { v4 as uuidv4 } from "uuid";

export interface OfflineConfig {
  enableAutoSync: boolean;
  syncInterval: number; // in minutes
  maxRetries: number;
  cacheExpiration: number; // in days
}

const DEFAULT_CONFIG: OfflineConfig = {
  enableAutoSync: true,
  syncInterval: 5,
  maxRetries: 3,
  cacheExpiration: 30,
};

class OfflineManager {
  private config: OfflineConfig = DEFAULT_CONFIG;
  private initialized = false;

  /**
   * Initialize offline manager
   */
  async init(config?: Partial<OfflineConfig>): Promise<void> {
    if (this.initialized) return;

    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize IndexedDB
    await indexedDBManager.init();

    // Enable auto-sync if configured
    if (this.config.enableAutoSync) {
      syncService.enableAutoSync();
    }

    // Set up periodic cleanup
    this.setupPeriodicCleanup();

    this.initialized = true;
    console.log("✅ Offline Manager initialized");
  }

  /**
   * Check if offline mode is supported
   */
  isSupported(): boolean {
    return (
      "indexedDB" in window &&
      "serviceWorker" in navigator &&
      "caches" in window
    );
  }

  /**
   * Check if currently offline
   */
  isOffline(): boolean {
    return !navigator.onLine;
  }

  /**
   * Cache a form for offline use
   */
  async cacheForm(formIdOrSlug: string): Promise<CachedForm> {
    try {
      // Fetch form from API
      const response = await formService.getFormBySlug(formIdOrSlug);
      const form = response.data;

      // Check if form has offline enabled
      if (!form.offlineConfig?.enabled) {
        throw new Error("Offline mode not enabled for this form");
      }

      // Prepare cached form
      const cachedForm: CachedForm = {
        formId: form._id,
        slug: form.slug,
        version: form.updatedAt,
        title: form.title,
        description: form.description || "",
        questions: form.questions,
        settings: form.settings,
        theme: form.theme,
        offlineEnabled: true,
        lastModified: form.updatedAt,
        cachedAt: Date.now(),
      };

      // Save to IndexedDB
      await indexedDBManager.cacheForm(cachedForm);

      console.log(`✅ Form cached: ${form.title}`);
      return cachedForm;
    } catch (error: any) {
      console.error("Failed to cache form:", error);
      throw error;
    }
  }

  /**
   * Get form (from cache or network)
   */
  async getForm(slug: string, forceNetwork = false): Promise<CachedForm> {
    if (!forceNetwork) {
      // Try cache first
      const cached = await indexedDBManager.getFormBySlug(slug);
      if (cached) {
        console.log("📦 Using cached form");
        return cached;
      }
    }

    // Fetch from network and cache
    console.log("🌐 Fetching form from network");
    return this.cacheForm(slug);
  }

  /**
   * Save response (offline or online)
   */
  async saveResponse(
    formSlug: string,
    answers: Array<{
      questionId: string;
      questionType: string;
      questionLabel: string;
      value: any;
    }>
  ): Promise<{ clientId: string; savedOffline: boolean }> {
    const clientId = uuidv4();
    const form = await this.getForm(formSlug);

    // Get device info
    const metadata = {
      userAgent: navigator.userAgent,
      deviceInfo: this.getDeviceInfo(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: navigator.language,
    };

    const timing = {
      startedAt: new Date().toISOString(),
      completedOfflineAt: new Date().toISOString(),
    };

    // Try to submit online first if possible
    if (!this.isOffline()) {
      try {
        const submitData = {
          answers,
          clientId,
          offlineMetadata: {
            wasOffline: false,
            completedOfflineAt: timing.completedOfflineAt,
          },
        };
        
        await responseService.submitForm(formSlug, submitData as any);
        console.log("✅ Response submitted online");
        return { clientId, savedOffline: false };
      } catch (error: any) {
        console.log("⚠️ Online submission failed, saving offline");
        // Fall through to offline save
      }
    }

    // Save offline
    const pendingResponse: PendingResponse = {
      clientId,
      formId: form.formId,
      formSlug: form.slug,
      answers,
      metadata,
      timing,
      syncStatus: "pending",
      retryCount: 0,
      createdAt: Date.now(),
    };

    await indexedDBManager.savePendingResponse(pendingResponse);
    console.log("💾 Response saved offline");

    // Try to sync immediately if online
    if (!this.isOffline()) {
      setTimeout(() => {
        syncService.syncSingleResponse(clientId);
      }, 1000);
    }

    return { clientId, savedOffline: true };
  }

  /**
   * Get all cached forms
   */
  async getCachedForms(): Promise<CachedForm[]> {
    return indexedDBManager.getAllCachedForms();
  }

  /**
   * Get pending responses
   */
  async getPendingResponses(): Promise<PendingResponse[]> {
    return indexedDBManager.getAllPendingResponses();
  }

  /**
   * Sync all pending responses
   */
  async syncAll(): Promise<void> {
    await syncService.syncPendingResponses();
  }

  /**
   * Get sync statistics
   */
  async getSyncStats() {
    return syncService.getSyncStats();
  }

  /**
   * Get storage information
   */
  async getStorageInfo(): Promise<{
    usage: number;
    quota: number;
    percentage: number;
    usageFormatted: string;
    quotaFormatted: string;
  }> {
    const estimate = await indexedDBManager.getStorageEstimate();

    return {
      ...estimate,
      usageFormatted: this.formatBytes(estimate.usage),
      quotaFormatted: this.formatBytes(estimate.quota),
    };
  }

  /**
   * Clear all offline data
   */
  async clearAllData(): Promise<void> {
    await indexedDBManager.clearAllData();
    console.log("🗑️ All offline data cleared");
  }

  /**
   * Remove a cached form
   */
  async removeCachedForm(formId: string): Promise<void> {
    await indexedDBManager.deleteForm(formId);
    console.log(`🗑️ Form removed from cache: ${formId}`);
  }

  /**
   * Refresh a cached form
   */
  async refreshCachedForm(slug: string): Promise<CachedForm> {
    return this.cacheForm(slug);
  }

  /**
   * Setup periodic cleanup
   */
  private setupPeriodicCleanup(): void {
    // Clear old synced responses every hour
    setInterval(() => {
      syncService.clearOldSyncedResponses(this.config.cacheExpiration);
    }, 60 * 60 * 1000); // 1 hour

    // Clear old cached forms every day
    setInterval(() => {
      this.cleanOldCachedForms();
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  /**
   * Clean old cached forms
   */
  private async cleanOldCachedForms(): Promise<void> {
    const forms = await indexedDBManager.getAllCachedForms();
    const cutoffTime = Date.now() - this.config.cacheExpiration * 24 * 60 * 60 * 1000;

    const oldForms = forms.filter((f) => f.cachedAt < cutoffTime);

    await Promise.all(oldForms.map((f) => indexedDBManager.deleteForm(f.formId)));

    if (oldForms.length > 0) {
      console.log(`🗑️ Cleaned ${oldForms.length} old cached forms`);
    }
  }

  /**
   * Get device information
   */
  private getDeviceInfo(): string {
    const screen = window.screen;
    const ua = navigator.userAgent;

    let device = "Desktop";
    if (/mobile/i.test(ua)) device = "Mobile";
    else if (/tablet/i.test(ua)) device = "Tablet";

    return `${device} (${screen.width}x${screen.height})`;
  }

  /**
   * Format bytes to human-readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  }

  /**
   * Subscribe to online/offline events
   */
  onConnectionChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }
}

// Singleton instance
export const offlineManager = new OfflineManager();

// Auto-initialize if supported
if (typeof window !== "undefined" && offlineManager.isSupported()) {
  offlineManager.init().catch(console.error);
}
