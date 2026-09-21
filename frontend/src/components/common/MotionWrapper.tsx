import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { VARIANTS, DURATION, EASING } from '../../theme/motion';

// 1. Page Transition Wrapper
export const PageTransition: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : VARIANTS.page.initial}
      animate={shouldReduceMotion ? { opacity: 1 } : VARIANTS.page.animate}
      exit={shouldReduceMotion ? { opacity: 0 } : VARIANTS.page.exit}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 2. Animated Card
export const AnimatedCard: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  delay?: number;
  onClick?: () => void;
}> = ({ children, className = '', delay = 0, onClick }) => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      whileHover={shouldReduceMotion ? undefined : { y: -3, transition: { duration: DURATION.FAST } }}
      transition={{ duration: DURATION.NORMAL, ease: EASING.OUT, delay }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 3. Stagger Container & Items
export const StaggerContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <motion.div
    variants={VARIANTS.staggerContainer}
    initial="initial"
    animate="animate"
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerItem: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      variants={shouldReduceMotion ? { initial: { opacity: 0 }, animate: { opacity: 1 } } : VARIANTS.listRow}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 4. Animated Modal
export const AnimatedModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  children: React.ReactNode;
  maxWidth?: string;
}> = ({ isOpen, onClose, children, maxWidth = 'max-w-md' }) => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            variants={VARIANTS.modalOverlay}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            variants={shouldReduceMotion ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } : VARIANTS.modalContent}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`relative z-10 w-full ${maxWidth} bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] rounded-3xl p-6 shadow-2xl overflow-hidden`}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// 5. Animated Dropdown
export const AnimatedDropdown: React.FC<{ 
  isOpen: boolean; 
  children: React.ReactNode; 
  className?: string; 
}> = ({ isOpen, children, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={shouldReduceMotion ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } : VARIANTS.dropdown}
          initial="initial"
          animate="animate"
          exit="exit"
          className={`absolute z-30 bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] rounded-2xl shadow-xl overflow-hidden ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 6. Animated Button
export const AnimatedButton: React.FC<{ 
  children: React.ReactNode; 
  onClick?: (e: React.MouseEvent) => void; 
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  title?: string;
}> = ({ children, onClick, type = 'button', disabled = false, className = '', title }) => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      title={title}
      whileHover={shouldReduceMotion || disabled ? undefined : { y: -1 }}
      whileTap={shouldReduceMotion || disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: DURATION.MICRO }}
      className={className}
    >
      {children}
    </motion.button>
  );
};

// 7. Animated Progress Bar
export const AnimatedProgressBar: React.FC<{ 
  percentage: number; 
  colorClass?: string;
  className?: string;
}> = ({ percentage, colorClass = 'bg-[#10B981]', className = '' }) => {
  const shouldReduceMotion = useReducedMotion();
  const clampedPct = Math.min(100, Math.max(0, percentage));

  return (
    <div className={`w-full bg-gray-100 dark:bg-[#0F1117] rounded-full overflow-hidden ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${clampedPct}%` }}
        viewport={{ once: true }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: DURATION.SLOW, ease: EASING.OUT }}
        className={`h-full rounded-full ${colorClass}`}
      />
    </div>
  );
};

// 8. Animated Skeleton Placeholder
export const AnimatedSkeleton: React.FC<{ className?: string }> = ({ className = 'h-12 w-full' }) => (
  <div className={`bg-gray-200 dark:bg-[#171A23] rounded-2xl animate-pulse ${className}`} />
);
