import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { EASING } from '../../theme/motion';

export const WelcomeToast: React.FC = () => {
  const { user } = useAuth();
  
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    // Only show once per browser session
    const hasShown = sessionStorage.getItem('clarity_welcome_toast_shown');
    return !hasShown;
  });

  useEffect(() => {
    if (isVisible) {
      sessionStorage.setItem('clarity_welcome_toast_shown', 'true');
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3500); // Auto dismiss after 3.5s
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!user || !isVisible) return null;

  // Dynamic time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = user.name?.split(' ')[0] || user.name || 'User';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.28, ease: EASING.OUT }}
          className="fixed top-20 right-6 z-50 w-80 sm:w-96 bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-4 rounded-2xl shadow-xl shadow-indigo-500/10 dark:shadow-black/40 flex items-start gap-3 text-gray-900 dark:text-white"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold tracking-tight text-gray-900 dark:text-[#F8FAFC]">
              {getGreeting()}, {userName} 👋
            </h4>
            <p className="text-xs text-gray-500 dark:text-[#94A3B8] font-medium mt-0.5 leading-snug">
              Here's your financial overview for today.
            </p>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#292D38] transition-colors"
            aria-label="Dismiss greeting"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
