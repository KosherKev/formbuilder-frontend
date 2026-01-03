/**
 * OfflineIndicator - Shows connection status and pending sync count
 */

"use client";

import { useOffline } from "@/hooks/useOffline";
import { Wifi, WifiOff, Cloud, CloudOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function OfflineIndicator() {
  const { isOnline, stats } = useOffline();

  if (isOnline && stats.pendingCount === 0) {
    return null; // Hide when online with nothing to sync
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
      >
        <div
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full shadow-lg backdrop-blur-md
            border transition-all duration-300
            ${
              !isOnline
                ? "bg-red-500/90 border-red-600 text-white"
                : stats.isSyncing
                ? "bg-blue-500/90 border-blue-600 text-white"
                : stats.failedCount > 0
                ? "bg-amber-500/90 border-amber-600 text-white"
                : "bg-green-500/90 border-green-600 text-white"
            }
          `}
        >
          {/* Icon */}
          <div className="animate-pulse">
            {!isOnline ? (
              <WifiOff className="w-5 h-5" />
            ) : stats.isSyncing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : stats.failedCount > 0 ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>

          {/* Message */}
          <span className="text-sm font-medium">
            {!isOnline ? (
              "You're offline"
            ) : stats.isSyncing ? (
              `Syncing ${stats.pendingCount} response${stats.pendingCount !== 1 ? "s" : ""}...`
            ) : stats.failedCount > 0 ? (
              `${stats.failedCount} failed to sync`
            ) : stats.pendingCount > 0 ? (
              `${stats.pendingCount} pending sync`
            ) : (
              "All synced!"
            )}
          </span>

          {/* Pending count badge */}
          {stats.pendingCount > 0 && !stats.isSyncing && (
            <div className="bg-white/30 px-2 py-0.5 rounded-full text-xs font-bold">
              {stats.pendingCount}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default OfflineIndicator;
