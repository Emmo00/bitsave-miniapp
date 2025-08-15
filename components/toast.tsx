"use client";

import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import type { ToastData, ToastType } from "../contexts/toastContext";

interface ToastProps {
  toast: ToastData;
  onClose: () => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // close toast after duration
    const timer = setTimeout(() => {
      handleClose();
    }, toast.duration ?? 5000); // Default to 5 seconds if no duration is set
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  const getToastStyle = (type: ToastType) => {
    switch (type) {
      case "success":
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-400" />,
          bgColor: "bg-green-500/20 backdrop-blur-md border-green-400/30",
          textColor: "text-green-100",
          titleColor: "text-green-50",
          accentColor: "border-l-green-400",
        };
      case "error":
        return {
          icon: <XCircle className="w-5 h-5 text-red-400" />,
          bgColor: "bg-red-500/20 backdrop-blur-md border-red-400/30",
          textColor: "text-red-100",
          titleColor: "text-red-50",
          accentColor: "border-l-red-400",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
          bgColor: "bg-yellow-500/20 backdrop-blur-md border-yellow-400/30",
          textColor: "text-yellow-100",
          titleColor: "text-yellow-50",
          accentColor: "border-l-yellow-400",
        };
      case "info":
        return {
          icon: <Info className="w-5 h-5 text-blue-400" />,
          bgColor: "bg-blue-500/20 backdrop-blur-md border-blue-400/30",
          textColor: "text-blue-100",
          titleColor: "text-blue-50",
          accentColor: "border-l-blue-400",
        };
      default:
        return {
          icon: <Info className="w-5 h-5 text-gray-400" />,
          bgColor: "bg-white/20 backdrop-blur-md border-white/30",
          textColor: "text-gray-100",
          titleColor: "text-gray-50",
          accentColor: "border-l-gray-400",
        };
    }
  };

  const style = getToastStyle(toast.type);

  return (
    <div
      className={`
        max-w-sm w-full ${style.bgColor} border ${style.accentColor} border-l-4 rounded-lg shadow-2xl p-4 pointer-events-auto
        transform transition-all duration-300 ease-in-out
        ${
          isVisible && !isLeaving
            ? "translate-y-0 opacity-100 scale-100"
            : isLeaving
              ? "translate-y-[-100%] opacity-0 scale-95"
              : "translate-y-[-100%] opacity-0 scale-95"
        }
      `}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">{toast.icon || style.icon}</div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${style.titleColor}`}>{toast.title}</p>
          {toast.message && <p className={`text-sm mt-1 ${style.textColor}`}>{toast.message}</p>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="flex-shrink-0 h-6 w-6 rounded-full hover:bg-white/20 -mr-1 -mt-1 text-white/70 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
