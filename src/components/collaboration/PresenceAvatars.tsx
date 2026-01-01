"use client";

import { ActiveUser } from "@/hooks/useCollaboration";
import { Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PresenceAvatarsProps {
  activeUsers: ActiveUser[];
  isConnected: boolean;
}

const colors = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-indigo-500",
  "bg-teal-500",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getUserColor(userId: string): string {
  const hash = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function PresenceAvatars({ activeUsers, isConnected }: PresenceAvatarsProps) {
  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-xs text-red-400">Disconnected</span>
      </div>
    );
  }

  if (activeUsers.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Only you</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Connection Indicator */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
        <div className="h-2 w-2 rounded-full bg-green-500" />
        <span className="text-xs text-green-400">Live</span>
      </div>

      {/* Active Users */}
      <div className="flex items-center">
        <AnimatePresence mode="popLayout">
          {activeUsers.slice(0, 5).map((user, index) => (
            <motion.div
              key={user.userId}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`relative ${index > 0 ? "-ml-2" : ""}`}
              style={{ zIndex: activeUsers.length - index }}
            >
              <div
                className={`
                  h-8 w-8 rounded-full border-2 border-background flex items-center justify-center
                  text-xs font-semibold text-white cursor-pointer
                  hover:scale-110 transition-transform
                  ${getUserColor(user.userId)}
                `}
                title={`${user.userName} (${user.userEmail})`}
              >
                {getInitials(user.userName)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Overflow count */}
        {activeUsers.length > 5 && (
          <div className="h-8 w-8 rounded-full bg-white/10 border-2 border-background flex items-center justify-center text-xs font-semibold text-muted-foreground -ml-2">
            +{activeUsers.length - 5}
          </div>
        )}
      </div>

      {/* User count */}
      <span className="text-xs text-muted-foreground ml-1">
        {activeUsers.length} {activeUsers.length === 1 ? "other" : "others"} editing
      </span>
    </div>
  );
}
