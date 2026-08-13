import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ToastNotification } from '../types';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-12 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isDanger = toast.type === 'danger';
          const isWarning = toast.type === 'warning';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto p-4 rounded-xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 text-xs ${
                isSuccess
                  ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                  : isDanger
                  ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                  : isWarning
                  ? 'bg-amber-950/90 border-amber-500/40 text-amber-200'
                  : 'bg-sky-950/90 border-sky-500/40 text-sky-200'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 size={18} className="text-emerald-400" />}
                {isDanger && <XCircle size={18} className="text-rose-400" />}
                {isWarning && <AlertTriangle size={18} className="text-amber-400" />}
                {!isSuccess && !isDanger && !isWarning && <Info size={18} className="text-sky-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-bold tracking-tight text-white">{toast.title}</h4>
                <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed font-mono">{toast.message}</p>
              </div>

              <button
                onClick={() => onDismiss(toast.id)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
