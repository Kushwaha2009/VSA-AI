import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string, duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, type, title, message, duration };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <div
        id="toast-container"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const iconMap = {
              success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />,
              error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />,
              warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
              info: <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />,
            };

            const borderMap = {
              success: 'border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/40',
              error: 'border-rose-500/30 bg-rose-500/10 dark:bg-rose-950/40',
              warning: 'border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/40',
              info: 'border-blue-500/30 bg-blue-500/10 dark:bg-blue-950/40',
            };

            return (
              <motion.div
                key={toast.id}
                id={`toast-${toast.id}`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md text-slate-800 dark:text-slate-100 ${borderMap[toast.type]}`}
              >
                {iconMap[toast.type]}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold leading-tight">{toast.title}</h4>
                  {toast.message && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {toast.message}
                    </p>
                  )}
                </div>
                <button
                  id={`btn-close-toast-${toast.id}`}
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                  aria-label="Close Notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
