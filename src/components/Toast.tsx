import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-5 right-5 z-50 bg-zinc-900 border border-amber-500/30 text-zinc-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md"
      >
        <div className="p-1 bg-amber-500/10 text-amber-400 rounded-lg">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <span className="text-xs font-bold text-white">{message}</span>
      </motion.div>
    </AnimatePresence>
  );
};
