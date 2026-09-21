import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Receipt, 
  PlusCircle, 
  PieChart, 
  TrendingUp, 
  Tags, 
  Settings, 
  LogOut, 
  Wallet,
  Target,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AnimatedButton } from '../common/MotionWrapper';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'add-transaction', label: 'Add Transaction', icon: PlusCircle },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'goals', label: 'Goals', icon: Target, badge: 'New' },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, badge: 'New' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'ai-insights', label: 'AI Insights', icon: Sparkles, badge: 'AI' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 dark:border-[#292D38] bg-white dark:bg-[#171A23] h-screen sticky top-0 z-30 transition-colors duration-300">
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-100 dark:border-[#292D38] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-gray-900 dark:text-[#F8FAFC] text-base tracking-tight leading-tight">ClarityFinance</h1>
          <p className="text-xs text-gray-500 dark:text-[#94A3B8] font-medium">Fintech Analytics</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-colors duration-150 group ${
                isActive ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-600 dark:text-[#94A3B8] hover:text-gray-900 dark:hover:text-[#F8FAFC]'
              }`}
            >
              {/* Animated Gliding Active Background Pill */}
              {isActive && (
                <motion.div
                  layoutId="sidebarActivePill"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  className="absolute inset-0 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-100 dark:border-indigo-900/40 shadow-sm"
                />
              )}

              <div className="relative z-10 flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'
                }`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`relative z-10 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase transition-transform group-hover:scale-105 ${
                  item.badge === 'AI' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile & Logout at Bottom */}
      <div className="p-4 border-t border-gray-100 dark:border-[#292D38]">
        <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-[#0F1117]/60 border border-transparent dark:border-[#292D38]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-xs flex items-center justify-center shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-gray-900 dark:text-[#F8FAFC] truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-gray-500 dark:text-[#94A3B8] truncate">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
          <AnimatedButton
            onClick={logout}
            title="Logout"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </AnimatedButton>
        </div>
      </div>
    </aside>
  );
};
