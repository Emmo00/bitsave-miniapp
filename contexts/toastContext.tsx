"use client";

import type React from "react";
import { createContext, useState, useCallback, type ReactNode } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  icon?: React.ReactNode;
}

interface ToastContextType {
  toasts: ToastData[];
  showToast: (toast: Omit<ToastData, "id">) => string;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
  success: (title: string, message?: string, duration?: number) => string;
  error: (title: string, message?: string, duration?: number) => string;
  warning: (title: string, message?: string, duration?: number) => string;
  info: (title: string, message?: string, duration?: number) => string;
}

export const ToastContext = createContext<ToastContextType | null>(null);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [idCounter, setIdCounter] = useState(0);

  const generateId = useCallback(() => {
    setIdCounter((prev) => prev + 1);
    return `toast-${idCounter}`;
  }, [idCounter]);

  const showToast = useCallback(
    (toast: Omit<ToastData, "id">) => {
      const id = generateId();
      const newToast: ToastData = {
        id,
        duration: 4000, // Default 4 seconds
        ...toast,
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto-hide toast
      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          hideToast(id);
        }, newToast.duration);
      }

      return id;
    },
    [generateId]
  );

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback(
    (title: string, message?: string, duration?: number) => {
      return showToast({
        type: "success",
        title,
        message,
        duration,
      });
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string, duration?: number) => {
      return showToast({
        type: "error",
        title,
        message,
        duration: duration || 6000, // Errors stay longer
      });
    },
    [showToast]
  );

  const warning = useCallback(
    (title: string, message?: string, duration?: number) => {
      return showToast({
        type: "warning",
        title,
        message,
        duration: duration || 5000,
      });
    },
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string, duration?: number) => {
      return showToast({
        type: "info",
        title,
        message,
        duration,
      });
    },
    [showToast]
  );

  const value: ToastContextType = {
    toasts,
    showToast,
    hideToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}
