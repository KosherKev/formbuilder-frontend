/**
 * SyncStatus - Detailed sync status panel
 */

"use client";

import { useState, useEffect } from "react";
import { useOffline } from "@/hooks/useOffline";
import { PendingResponse } from "@/lib/offline/indexedDB";
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Download,
  AlertTriangle,
  WifiOff,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function SyncStatus() {
  const { isOnline, stats, syncAll, retryFailed, getPendingResponses, clearAllData } = useOffline();
  const [pendingResponses, setPendingResponses] = useState<PendingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadPendingResponses = async () => {
    const responses = await getPendingResponses();
    setPendingResponses(responses);
  };

  useEffect(() => {
    loadPendingResponses();
  }, [stats]);

  const handleSync = async () => {
    setIsLoading(true);
    await syncAll();
    await loadPendingResponses();
    setIsLoading(false);
  };

  const handleRetryFailed = async () => {
    setIsLoading(true);
    await retryFailed();
    await loadPendingResponses();
    setIsLoading(false);
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to clear all offline data? This cannot be undone.")) {
      await clearAllData();
      setPendingResponses([]);
    }
  };

  const pendingOnly = pendingResponses.filter((r) => r.syncStatus === "pending");
  const syncedOnly = pendingResponses.filter((r) => r.syncStatus === "synced");
  const failedOnly = pendingResponses.filter((r) => r.syncStatus === "failed");

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Sync Status</h3>
          <p className="text-sm text-gray-500 mt-1">
            {isOnline ? (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                Online
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600">
                <WifiOff className="w-4 h-4" />
                Offline
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={!isOnline || isLoading || stats.isSyncing}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${(isLoading || stats.isSyncing) && "animate-spin"}`} />
            Sync Now
          </button>

          {stats.failedCount > 0 && (
            <button
              onClick={handleRetryFailed}
              disabled={!isOnline || isLoading}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Failed
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total"
          value={stats.totalPending}
          icon={<Download className="w-5 h-5 text-gray-500" />}
          color="gray"
        />
        <StatCard
          label="Pending"
          value={stats.pendingCount}
          icon={<Clock className="w-5 h-5 text-blue-500" />}
          color="blue"
        />
        <StatCard
          label="Synced"
          value={stats.syncedCount}
          icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
          color="green"
        />
        <StatCard
          label="Failed"
          value={stats.failedCount}
          icon={<XCircle className="w-5 h-5 text-red-500" />}
          color="red"
        />
      </div>

      {/* Response List */}
      {pendingResponses.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Pending Responses</h4>
            <button
              onClick={handleClearAll}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>

          <div className="space-y-2">
            {pendingOnly.map((response) => (
              <ResponseCard key={response.clientId} response={response} />
            ))}
            {failedOnly.map((response) => (
              <ResponseCard key={response.clientId} response={response} />
            ))}
            {syncedOnly.slice(0, 5).map((response) => (
              <ResponseCard key={response.clientId} response={response} />
            ))}
          </div>

          {syncedOnly.length > 5 && (
            <p className="text-sm text-gray-500 text-center">
              + {syncedOnly.length - 5} more synced responses
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-600">No pending responses</p>
          <p className="text-sm text-gray-400 mt-1">All data is synced!</p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  const colors: Record<string, string> = {
    gray: "bg-gray-50 border-gray-200",
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    red: "bg-red-50 border-red-200",
  };

  return (
    <div className={`${colors[color]} border rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-2">
        {icon}
        <span className="text-2xl font-bold text-gray-900">{value}</span>
      </div>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}

function ResponseCard({ response }: { response: PendingResponse }) {
  const statusConfig = {
    pending: {
      icon: <Clock className="w-4 h-4 text-blue-500" />,
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      label: "Pending",
    },
    syncing: {
      icon: <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />,
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      text: "text-indigo-700",
      label: "Syncing...",
    },
    synced: {
      icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      label: "Synced",
    },
    failed: {
      icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      label: "Failed",
    },
  };

  const config = statusConfig[response.syncStatus];

  return (
    <div className={`${config.bg} ${config.border} border rounded-lg p-3`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {config.icon}
            <span className={`text-sm font-medium ${config.text}`}>{config.label}</span>
          </div>
          <p className="text-sm text-gray-600">Form: {response.formSlug}</p>
          <p className="text-xs text-gray-500 mt-1">
            {formatDistanceToNow(new Date(response.createdAt), { addSuffix: true })}
          </p>
          {response.error && (
            <p className="text-xs text-red-600 mt-1">Error: {response.error}</p>
          )}
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500">{response.answers.length} answers</p>
          {response.retryCount > 0 && (
            <p className="text-xs text-amber-600 mt-1">Retry: {response.retryCount}/3</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SyncStatus;
