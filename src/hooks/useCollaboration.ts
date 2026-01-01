"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:5000";

export interface ActiveUser {
  userId: string;
  userName: string;
  userEmail: string;
  cursor?: {
    position: { x: number; y: number };
    questionId: string;
    timestamp: Date;
  };
  lastActivity?: Date;
}

export interface CursorPosition {
  userId: string;
  userName: string;
  position: { x: number; y: number };
  questionId: string;
  timestamp: Date;
}

export interface QuestionEdit {
  userId: string;
  userName: string;
  questionId: string;
  editing: boolean;
  timestamp: Date;
}

export interface FormUpdate {
  userId: string;
  userName: string;
  update: any;
  field: string;
  timestamp: Date;
}

export interface UserTyping {
  userId: string;
  userName: string;
  questionId: string;
  field: string;
  typing: boolean;
}

interface UseCollaborationOptions {
  formId: string;
  onUserJoined?: (user: { userId: string; userName: string; userEmail: string }) => void;
  onUserLeft?: (user: { userId: string; userName: string }) => void;
  onCursorMove?: (cursor: CursorPosition) => void;
  onQuestionEditing?: (edit: QuestionEdit) => void;
  onQuestionUpdate?: (update: any) => void;
  onFormUpdate?: (update: FormUpdate) => void;
  onUserTyping?: (typing: UserTyping) => void;
  enabled?: boolean;
}

export function useCollaboration({
  formId,
  onUserJoined,
  onUserLeft,
  onCursorMove,
  onQuestionEditing,
  onQuestionUpdate,
  onFormUpdate,
  onUserTyping,
  enabled = true,
}: UseCollaborationOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!enabled || !formId) return;

    const token = Cookies.get("token");
    if (!token) {
      console.error("No auth token found");
      return;
    }

    const socket = io(WS_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Socket connected");
      setIsConnected(true);
      socket.emit("join_form", formId);

      // Start heartbeat
      heartbeatInterval.current = setInterval(() => {
        socket.emit("heartbeat", { formId });
      }, 30000); // Every 30 seconds
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    // Active users
    socket.on("active_users", (users: ActiveUser[]) => {
      console.log("👥 Active users:", users);
      setActiveUsers(users);
    });

    // User joined
    socket.on("user_joined", (user) => {
      console.log("👋 User joined:", user.userName);
      setActiveUsers((prev) => [...prev, user]);
      onUserJoined?.(user);
    });

    // User left
    socket.on("user_left", (user) => {
      console.log("👋 User left:", user.userName);
      setActiveUsers((prev) => prev.filter((u) => u.userId !== user.userId));
      onUserLeft?.(user);
    });

    // Cursor movement
    socket.on("cursor_moved", (cursor: CursorPosition) => {
      setActiveUsers((prev) =>
        prev.map((u) =>
          u.userId === cursor.userId
            ? { ...u, cursor: { position: cursor.position, questionId: cursor.questionId, timestamp: cursor.timestamp } }
            : u
        )
      );
      onCursorMove?.(cursor);
    });

    // Question editing
    socket.on("question_editing", (edit: QuestionEdit) => {
      onQuestionEditing?.(edit);
    });

    // Question locked/unlocked
    socket.on("question_locked", (data) => {
      console.log(`🔒 Question ${data.questionId} locked by ${data.userName}`);
    });

    socket.on("question_unlocked", (data) => {
      console.log(`🔓 Question ${data.questionId} unlocked by ${data.userName}`);
    });

    // Question updates
    socket.on("question_updated", (update) => {
      onQuestionUpdate?.(update);
    });

    // Form updates
    socket.on("form_updated", (update: FormUpdate) => {
      onFormUpdate?.(update);
    });

    // Typing indicators
    socket.on("user_typing", (typing: UserTyping) => {
      onUserTyping?.(typing);
    });

    return () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
      socket.emit("leave_form", formId);
      socket.disconnect();
    };
  }, [formId, enabled]);

  // Send cursor position
  const sendCursorPosition = useCallback(
    (position: { x: number; y: number }, questionId: string) => {
      socketRef.current?.emit("cursor_move", { formId, position, questionId });
    },
    [formId]
  );

  // Start editing question
  const startEditingQuestion = useCallback(
    (questionId: string) => {
      socketRef.current?.emit("question_editing_start", { formId, questionId });
    },
    [formId]
  );

  // End editing question
  const endEditingQuestion = useCallback(
    (questionId: string) => {
      socketRef.current?.emit("question_editing_end", { formId, questionId });
    },
    [formId]
  );

  // Send question update
  const sendQuestionUpdate = useCallback(
    (questionId: string, updates: any) => {
      socketRef.current?.emit("question_update", { formId, questionId, updates });
    },
    [formId]
  );

  // Send form update
  const sendFormUpdate = useCallback(
    (update: any, field: string) => {
      socketRef.current?.emit("form_update", { formId, update, field });
    },
    [formId]
  );

  // Start typing
  const startTyping = useCallback(
    (questionId: string, field: string) => {
      socketRef.current?.emit("typing_start", { formId, questionId, field });
    },
    [formId]
  );

  // End typing
  const endTyping = useCallback(
    (questionId: string, field: string) => {
      socketRef.current?.emit("typing_end", { formId, questionId, field });
    },
    [formId]
  );

  // Lock question
  const lockQuestion = useCallback(
    (questionId: string) => {
      socketRef.current?.emit("lock_question", { formId, questionId });
    },
    [formId]
  );

  // Unlock question
  const unlockQuestion = useCallback(
    (questionId: string) => {
      socketRef.current?.emit("unlock_question", { formId, questionId });
    },
    [formId]
  );

  return {
    isConnected,
    activeUsers,
    sendCursorPosition,
    startEditingQuestion,
    endEditingQuestion,
    sendQuestionUpdate,
    sendFormUpdate,
    startTyping,
    endTyping,
    lockQuestion,
    unlockQuestion,
  };
}
