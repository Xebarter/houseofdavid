'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

export type Toast = {
  id: string;
  type: ToastType;
  message: string;
};

export function useAdminToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function toast(type: ToastType, message: string) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => dismiss(id), type === 'success' ? 3200 : 5000);
  }

  return { toasts, toast, dismiss };
}

export function AdminToastStack({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, toast.type === 'success' ? 3200 : 5000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const styles =
    toast.type === 'success'
      ? 'bg-emerald-950/95 border-emerald-700/50 text-emerald-100'
      : 'bg-red-950/95 border-red-800/50 text-red-100';

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md animate-toast-in ${styles}`}
      role="status"
    >
      {toast.type === 'success' ? (
        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400 mt-0.5" />
      ) : (
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400 mt-0.5" />
      )}
      <p className="text-sm flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={onDismiss}
        className="p-1 rounded-md hover:bg-white/10 transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4 opacity-70" />
      </button>
    </div>
  );
}
