"use client";

import { motion } from "framer-motion";
import { CursorPosition } from "@/hooks/useCollaboration";

interface UserCursorProps {
  cursor: CursorPosition;
  color: string;
}

function getUserColor(userId: string): string {
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
  
  const hash = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function UserCursor({ cursor, color }: UserCursorProps) {
  const cursorColor = color || getUserColor(cursor.userId);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "fixed",
        left: cursor.position.x,
        top: cursor.position.y,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      {/* Cursor pointer */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
      >
        <path
          d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
          fill={cursorColor}
        />
      </svg>

      {/* User name label */}
      <div
        className="absolute top-5 left-5 px-2 py-1 rounded-md text-xs font-medium text-white whitespace-nowrap"
        style={{
          backgroundColor: cursorColor,
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
      >
        {cursor.userName}
      </div>
    </motion.div>
  );
}

interface UserCursorsProps {
  cursors: CursorPosition[];
}

export function UserCursors({ cursors }: UserCursorsProps) {
  return (
    <>
      {cursors.map((cursor) => (
        <UserCursor key={cursor.userId} cursor={cursor} color={getUserColor(cursor.userId)} />
      ))}
    </>
  );
}
