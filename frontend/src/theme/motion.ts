import { TargetAndTransition } from 'framer-motion';

export const DURATION = {
  MICRO: 0.18,
  FAST: 0.22,
  NORMAL: 0.35,
  MEDIUM: 0.5,
  SLOW: 1.0,
};

export const EASING = {
  OUT: [0.16, 1, 0.3, 1] as [number, number, number, number],
  IN_OUT: [0.4, 0, 0.2, 1] as [number, number, number, number],
  SPRING_GENTLE: { type: 'spring' as const, stiffness: 350, damping: 25 },
  SPRING_SNAPPY: { type: 'spring' as const, stiffness: 450, damping: 30 },
};

export const VARIANTS = {
  // Page Transition Variants
  page: {
    initial: { opacity: 0, y: 8 } as TargetAndTransition,
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: DURATION.NORMAL, ease: EASING.OUT }
    } as TargetAndTransition,
    exit: { 
      opacity: 0, 
      y: -4,
      transition: { duration: DURATION.FAST, ease: EASING.IN_OUT }
    } as TargetAndTransition
  },

  // Card Variants
  card: {
    initial: { opacity: 0, y: 12, scale: 0.98 } as TargetAndTransition,
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: DURATION.NORMAL, ease: EASING.OUT }
    } as TargetAndTransition,
    hover: { 
      y: -3,
      transition: { duration: DURATION.FAST, ease: EASING.OUT }
    } as TargetAndTransition
  },

  // Stagger Container
  staggerContainer: {
    initial: {} as TargetAndTransition,
    animate: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05
      }
    } as TargetAndTransition
  },

  // Modal Overlay & Container
  modalOverlay: {
    initial: { opacity: 0 } as TargetAndTransition,
    animate: { opacity: 1, transition: { duration: DURATION.FAST } } as TargetAndTransition,
    exit: { opacity: 0, transition: { duration: DURATION.MICRO } } as TargetAndTransition
  },

  modalContent: {
    initial: { opacity: 0, scale: 0.97, y: 8 } as TargetAndTransition,
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { duration: DURATION.NORMAL, ease: EASING.OUT }
    } as TargetAndTransition,
    exit: { 
      opacity: 0, 
      scale: 0.97, 
      y: 6,
      transition: { duration: DURATION.FAST, ease: EASING.IN_OUT }
    } as TargetAndTransition
  },

  // Dropdown Popover
  dropdown: {
    initial: { opacity: 0, y: -6, scale: 0.98 } as TargetAndTransition,
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: DURATION.FAST, ease: EASING.OUT }
    } as TargetAndTransition,
    exit: { 
      opacity: 0, 
      y: -4, 
      scale: 0.98,
      transition: { duration: DURATION.MICRO, ease: EASING.IN_OUT }
    } as TargetAndTransition
  },

  // List Row (e.g. Transactions)
  listRow: {
    initial: { opacity: 0, y: 8 } as TargetAndTransition,
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: DURATION.FAST, ease: EASING.OUT }
    } as TargetAndTransition,
    exit: { 
      opacity: 0, 
      x: -16, 
      height: 0,
      transition: { duration: DURATION.FAST, ease: EASING.IN_OUT }
    } as TargetAndTransition
  },
};
