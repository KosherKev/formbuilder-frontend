"use client";

import { motion } from "framer-motion";
import { Edit3 } from "lucide-react";

interface EditingIndicatorProps {
  userName: string;
  color?: string;
}

function getUserColor(userName: string): string {
  const colors = [
    "#3B82F6", // blue
    "#8B5CF6", // purple
    "#EC4899", // pink
    "#10B981", // green
    "#F59E0B", // yellow
    "#EF4444", // red
    "#6366F1", // indigo
    "#14B8A6", // teal
  ];
  
  const hash = userName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function EditingIndicator({ userName, color }: EditingIndicatorProps) {
  const indicatorColor = color || getUserColor(userName);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="absolute -top-8 left-0 z-10 flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium text-white"
      style={{
        backgroundColor: indicatorColor,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      <Edit3 className="h-3 w-3 animate-pulse" />
      <span>{userName} is editing...</span>
    </motion.div>
  );
}

interface TypingIndicatorProps {
  userName: string;
  field: string;
  color?: string;
}

export function TypingIndicator({ userName, field, color }: TypingIndicatorProps) {
  const indicatorColor = color || getUserColor(userName);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex items-center gap-1.5 text-xs"
      style={{ color: indicatorColor }}
    >
      <span className="font-medium">{userName}</span>
      <span className="text-muted-foreground">is typing</span>
      <div className="flex gap-1">
        <motion.div
          className="h-1 w-1 rounded-full"
          style={{ backgroundColor: indicatorColor }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="h-1 w-1 rounded-full"
          style={{ backgroundColor: indicatorColor }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="h-1 w-1 rounded-full"
          style={{ backgroundColor: indicatorColor }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
        />
      </div>
    </motion.div>
  );
}
