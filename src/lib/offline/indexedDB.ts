/**
 * IndexedDB Manager for Offline Forms
 * Handles local storage of forms and pending responses
 */

const DB_NAME = "formbuilder_offline";
const DB_VERSION = 1;

// Object stores
const STORES = {
  FORMS: "forms",
  PENDING_RESPONSES: "pending_responses",
  SYNC_QUEUE: "sync_queue",
  METADATA: "metadata",
};

export interface CachedForm {
  formId: string;
  slug: string;
  version: string;
  title: string;
  description: string;
  questions: any[];
  settings: any;
  theme: any;
  offlineEnabled: boolean;
  lastModified: string;
  cachedAt: number;
}

export interface PendingResponse {
  clientId: string;
  formId: string;
  formSlug: string;
  answers: Array<{
    questionId: string;
    questionType: string;
    questionLabel: string;
    value: any;
  }>;
  metadata: {
    userAgent: string;
    deviceInfo: string;
    timezone: string;
    locale: string;
  };
  timing: {
    startedAt: string;
    completedOfflineAt: string;
  };
  syncStatus: "pending" | "syncing" | "synced" | "failed";
  retryCount: number;
  lastRetryAt?: string;
  error?: string;
  createdAt: number;
}

export interface SyncQueueItem {
  id: string;
  type: "response" | "form_update";
  data: any;
  priority: number;
  status: "queued" | "processing" | "completed" | "failed";
  retryCount: number;
  createdAt: number;
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  /**
   * Initialize the database
   */
  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error("IndexedDB failed to open:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log("✅ IndexedDB initialized");
        resolve(this.db);
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;

        // Forms store
        if (!db.objectStoreNames.contains(STORES.FORMS)) {
          const formStore = db.createObjectStore(STORES.FORMS, {
            keyPath: "formId",
          });
          formStore.createIndex("slug", "slug", { unique: true });
          formStore.createIndex("cachedAt", "cachedAt");
        }

        // Pending responses store
        if (!db.objectStoreNames.contains(STORES.PENDING_RESPONSES)) {
          const responseStore = db.createObjectStore(STORES.PENDING_RESPONSES, {
            keyPath: "clientId",
          });
          responseStore.createIndex("formId", "formId");
          responseStore.createIndex("syncStatus", "syncStatus");
          responseStore.createIndex("createdAt", "createdAt");
        }

        // Sync queue store
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const queueStore = db.createObjectStore(STORES.SYNC_QUEUE, {
            keyPath: "id",
          });
          queueStore.createIndex("status", "status");
          queueStore.createIndex("priority", "priority");
          queueStore.createIndex("createdAt", "createdAt");
        }

        // Metadata store
        if (!db.objectStoreNames.contains(STORES.METADATA)) {
          db.createObjectStore(STORES.METADATA, { keyPath: "key" });
        }

        console.log("✅ IndexedDB schema upgraded to version", DB_VERSION);
      };
    });

    return this.initPromise;
  }

  /**
   * Generic get operation
   */
  private async get<T>(storeName: string, key: string): Promise<T | null> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic put operation
   */
  private async put<T>(storeName: string, data: T): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic delete operation
   */
  private async delete(storeName: string, key: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic getAll operation
   */
  private async getAll<T>(storeName: string, indexName?: string, query?: IDBValidKey): Promise<T[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      
      let request: IDBRequest;
      if (indexName) {
        const index = store.index(indexName);
        request = query ? index.getAll(query) : index.getAll();
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // ============= FORMS =============

  async cacheForm(form: CachedForm): Promise<void> {
    return this.put(STORES.FORMS, form);
  }

  async getForm(formId: string): Promise<CachedForm | null> {
    return this.get<CachedForm>(STORES.FORMS, formId);
  }

  async getFormBySlug(slug: string): Promise<CachedForm | null> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.FORMS, "readonly");
      const store = transaction.objectStore(STORES.FORMS);
      const index = store.index("slug");
      const request = index.get(slug);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllCachedForms(): Promise<CachedForm[]> {
    return this.getAll<CachedForm>(STORES.FORMS);
  }

  async deleteForm(formId: string): Promise<void> {
    return this.delete(STORES.FORMS, formId);
  }

  // ============= PENDING RESPONSES =============

  async savePendingResponse(response: PendingResponse): Promise<void> {
    return this.put(STORES.PENDING_RESPONSES, response);
  }

  async getPendingResponse(clientId: string): Promise<PendingResponse | null> {
    return this.get<PendingResponse>(STORES.PENDING_RESPONSES, clientId);
  }

  async getAllPendingResponses(): Promise<PendingResponse[]> {
    return this.getAll<PendingResponse>(STORES.PENDING_RESPONSES);
  }

  async getPendingResponsesByStatus(status: string): Promise<PendingResponse[]> {
    return this.getAll<PendingResponse>(STORES.PENDING_RESPONSES, "syncStatus", status);
  }

  async getPendingResponsesByForm(formId: string): Promise<PendingResponse[]> {
    return this.getAll<PendingResponse>(STORES.PENDING_RESPONSES, "formId", formId);
  }

  async updatePendingResponseStatus(
    clientId: string,
    status: PendingResponse["syncStatus"],
    error?: string
  ): Promise<void> {
    const response = await this.getPendingResponse(clientId);
    if (response) {
      response.syncStatus = status;
      if (error) response.error = error;
      if (status === "failed") {
        response.retryCount++;
        response.lastRetryAt = new Date().toISOString();
      }
      await this.savePendingResponse(response);
    }
  }

  async deletePendingResponse(clientId: string): Promise<void> {
    return this.delete(STORES.PENDING_RESPONSES, clientId);
  }

  async clearSyncedResponses(): Promise<void> {
    const syncedResponses = await this.getPendingResponsesByStatus("synced");
    const promises = syncedResponses.map((r) => this.deletePendingResponse(r.clientId));
    await Promise.all(promises);
  }

  // ============= SYNC QUEUE =============

  async addToSyncQueue(item: SyncQueueItem): Promise<void> {
    return this.put(STORES.SYNC_QUEUE, item);
  }

  async getFromSyncQueue(id: string): Promise<SyncQueueItem | null> {
    return this.get<SyncQueueItem>(STORES.SYNC_QUEUE, id);
  }

  async getAllQueuedItems(): Promise<SyncQueueItem[]> {
    return this.getAll<SyncQueueItem>(STORES.SYNC_QUEUE, "status", "queued");
  }

  async deleteFromSyncQueue(id: string): Promise<void> {
    return this.delete(STORES.SYNC_QUEUE, id);
  }

  // ============= METADATA =============

  async setMetadata(key: string, value: any): Promise<void> {
    return this.put(STORES.METADATA, { key, value, updatedAt: Date.now() });
  }

  async getMetadata(key: string): Promise<any | null> {
    const result = await this.get<any>(STORES.METADATA, key);
    return result ? result.value : null;
  }

  // ============= UTILITIES =============

  async getStorageEstimate(): Promise<{ usage: number; quota: number; percentage: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = quota > 0 ? (usage / quota) * 100 : 0;
      return { usage, quota, percentage };
    }
    return { usage: 0, quota: 0, percentage: 0 };
  }

  async clearAllData(): Promise<void> {
    const db = await this.init();
    const storeNames = [STORES.FORMS, STORES.PENDING_RESPONSES, STORES.SYNC_QUEUE, STORES.METADATA];
    
    const promises = storeNames.map((storeName) => {
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });

    await Promise.all(promises);
    console.log("✅ All IndexedDB data cleared");
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }
}

// Singleton instance
export const indexedDBManager = new IndexedDBManager();
