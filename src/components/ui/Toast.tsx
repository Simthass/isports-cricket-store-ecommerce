"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, MessageCircle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: () => void;
}

const icons = {
  success: <CheckCircle size={20} className="text-green-500" />,
  error: <XCircle size={20} className="text-red-500" />,
  warning: <AlertCircle size={20} className="text-amber-500" />,
  info: <MessageCircle size={20} className="text-blue-500" />,
};

const bgColors = {
  success: "bg-green-50 border-green-200",
  error: "bg-red-50 border-red-200",
  warning: "bg-amber-50 border-amber-200",
  info: "bg-blue-50 border-blue-200",
};

const titleColors = {
  success: "text-green-800",
  error: "text-red-800",
  warning: "text-amber-800",
  info: "text-blue-800",
};

export function Toast({ type, title, message, duration = 4000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 p-4 rounded-xl border shadow-lg max-w-sm ${bgColors[type]}`}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="flex-1 min-w-0">
        <h4 className={`text-[13px] font-bold ${titleColors[type]}`}>{title}</h4>
        {message && <p className="text-[12px] text-gray-600 mt-0.5">{message}</p>}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-colors"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

// Toast container component
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (toast: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    (window as any).showToast = addToast;
    return () => {
      delete (window as any).showToast;
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Helper function to show toast from anywhere
export function showToast(type: ToastType, title: string, message?: string) {
  if (typeof window !== "undefined" && (window as any).showToast) {
    (window as any).showToast({ type, title, message });
  } else {
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
  }
}