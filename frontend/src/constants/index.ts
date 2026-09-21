export const CURRENCIES = [
  { symbol: '₹', label: '₹ INR - Indian Rupee' },
  { symbol: '$', label: '$ USD - US Dollar' },
  { symbol: '€', label: '€ EUR - Euro' },
  { symbol: '£', label: '£ GBP - British Pound' }
];

export const DATE_FORMATS = [
  { format: 'MMM DD, YYYY', example: '17 Sep 2026' },
  { format: 'YYYY-MM-DD', example: '2026-09-17' },
  { format: 'DD/MM/YYYY', example: '17/09/2026' }
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'transactions', label: 'Transactions', icon: 'ArrowLeftRight' },
  { id: 'add-transaction', label: 'Add Transaction', icon: 'PlusCircle' },
  { id: 'budgets', label: 'Budgets', icon: 'PiggyBank' },
  { id: 'goals', label: 'Goals', icon: 'Target' },
  { id: 'subscriptions', label: 'Subscriptions', icon: 'CreditCard' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
  { id: 'categories', label: 'Categories', icon: 'Tags' },
  { id: 'ai-insights', label: 'AI Insights', icon: 'Sparkles', badge: 'AI' },
  { id: 'settings', label: 'Settings', icon: 'Settings' }
];

export const ANIMATION_TOKENS = {
  FAST: 0.18,
  NORMAL: 0.25,
  MEDIUM: 0.35,
  SLOW: 0.45,
  COUNTER: 1000,
  PROGRESS: 800
};

export const DEFAULT_MONTH = '2026-09';
