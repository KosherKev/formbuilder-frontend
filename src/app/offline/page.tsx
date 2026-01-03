/**
 * Offline Page - Shows cached forms and pending responses
 */

"use client";

import { useState, useEffect } from "react";
import { useOffline } from "@/hooks/useOffline";
import { CachedForm } from "@/lib/offline/indexedDB";
import { SyncStatus } from "@/components/offline/SyncStatus";
import {
  WifiOff,
  FileText,
  Clock,
  Download,
  ExternalLink,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default function OfflinePage() {
  const { isOnline, stats, getCachedForms, storageInfo } = useOffline();
  const [cachedForms, setCachedForms] = useState<CachedForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCachedForms();
  }, []);

  const loadCachedForms = async () => {
    setIsLoading(true);
    const forms = await getCachedForms();
    setCachedForms(forms);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isOnline ? 'bg-green-100' : 'bg-red-100'}`}>
              <WifiOff className={`w-6 h-6 ${isOnline ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Offline Mode</h1>
          </div>
          <p className="text-gray-600">
            View cached forms and manage offline responses
          </p>
        </div>

        {/* Storage Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Usage</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Used: {storageInfo.usageFormatted}</span>
                <span className="text-gray-600">Quota: {storageInfo.quotaFormatted}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    storageInfo.percentage > 80
                      ? "bg-red-500"
                      : storageInfo.percentage > 50
                      ? "bg-amber-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {storageInfo.percentage.toFixed(1)}% used
              </p>
            </div>
          </div>
        </div>

        {/* Sync Status */}
        <div className="mb-6">
          <SyncStatus />
        </div>

        {/* Cached Forms */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Cached Forms</h3>
            <button
              onClick={loadCachedForms}
              className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-3 animate-spin" />
              <p className="text-gray-600">Loading cached forms...</p>
            </div>
          ) : cachedForms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cachedForms.map((form) => (
                <CachedFormCard key={form.formId} form={form} onDelete={loadCachedForms} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">No cached forms</p>
              <p className="text-sm text-gray-400">
                Forms you visit will be automatically cached for offline use
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CachedFormCard({
  form,
  onDelete,
}: {
  form: CachedForm;
  onDelete: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Remove "${form.title}" from offline cache?`)) {
      setIsDeleting(true);
      const { offlineManager } = await import("@/lib/offline/offlineManager");
      await offlineManager.removeCachedForm(form.formId);
      onDelete();
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{form.title}</h4>
          {form.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{form.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <FileText className="w-4 h-4" />
          <span>{form.questions.length} questions</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Cached {formatDistanceToNow(new Date(form.cachedAt), { addSuffix: true })}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Download className="w-4 h-4" />
          <span>v{form.version.slice(0, 8)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={`/f/${form.slug}`}
          className="flex-1 bg-indigo-600 text-white text-sm font-medium py-2 px-3 
                   rounded-lg hover:bg-indigo-700 transition-colors flex items-center 
                   justify-center gap-1"
        >
          <ExternalLink className="w-4 h-4" />
          Open
        </Link>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 
                   transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
