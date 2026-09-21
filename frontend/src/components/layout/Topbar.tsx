import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Sun, Moon, Calendar, ChevronDown, LogOut, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AnimatedDropdown, AnimatedButton } from '../common/MotionWrapper';
import { api } from '../../services/api';
import { Transaction } from '../../types';

interface TopbarProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onViewTransaction?: (tx: Transaction) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  activeTab,
  setActiveTab,
  selectedMonth,
  setSelectedMonth,
  searchQuery,
  setSearchQuery,
  onViewTransaction,
}) => {
  const { user, logout } = useAuth();
  const { setTheme, isDark } = useTheme();
  const currency = user?.currency || '₹';
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Search Results Popover State
  const [searchResults, setSearchResults] = useState<Transaction[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSearchPopover, setShowSearchPopover] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search results on input change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchPopover(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.getTransactions({ search: searchQuery.trim(), limit: 5 });
        setSearchResults(res.items || []);
        setShowSearchPopover(true);
      } catch (err) {
        console.error('Failed to search transactions', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && setActiveTab) {
      setActiveTab('transactions');
      setShowSearchPopover(false);
    }
  };

  const handleSelectTransaction = (tx: Transaction) => {
    setShowSearchPopover(false);
    if (onViewTransaction) {
      onViewTransaction(tx);
    } else if (setActiveTab) {
      setActiveTab('transactions');
    }
  };

  const handleViewAllResults = () => {
    setShowSearchPopover(false);
    if (setActiveTab) {
      setActiveTab('transactions');
    }
  };

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard';
      case 'transactions': return 'Transactions';
      case 'add-transaction': return 'Add Transaction';
      case 'budgets': return 'Budgets';
      case 'goals': return 'Goals';
      case 'subscriptions': return 'Subscriptions';
      case 'analytics': return 'Analytics';
      case 'categories': return 'Categories';
      case 'ai-insights': return 'AI Insights';
      case 'settings': return 'Settings';
      default: return 'Overview';
    }
  };

  const months = [
    { value: '2026-09', label: 'September 2026' },
    { value: '2026-08', label: 'August 2026' },
    { value: '2026-07', label: 'July 2026' },
    { value: '2026-06', label: 'June 2026' },
  ];

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#171A23]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#292D38] px-4 md:px-8 py-3.5 flex items-center justify-between gap-4 transition-colors duration-300">
      {/* Title & Month Selector */}
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-[#F8FAFC] capitalize tracking-tight">
          {getPageTitle(activeTab)}
        </h2>

        {/* Date Month Selector */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#292D38] bg-gray-50 dark:bg-[#0F1117] text-xs font-medium text-gray-700 dark:text-[#F8FAFC] transition-colors">
          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent border-none focus:outline-none cursor-pointer text-xs font-semibold text-gray-800 dark:text-[#F8FAFC]"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value} className="bg-white dark:bg-[#171A23] text-gray-900 dark:text-[#F8FAFC]">
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center Global Search Input */}
      <div ref={searchContainerRef} className="flex-1 max-w-md hidden md:block relative">
        <form onSubmit={handleSearchSubmit} className="relative group">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search transactions, categories..."
            value={searchQuery}
            onFocus={() => { if (searchQuery.trim()) setShowSearchPopover(true); }}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-[#292D38] bg-gray-50 dark:bg-[#0F1117] text-gray-900 dark:text-[#F8FAFC] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setShowSearchPopover(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Global Search Popover Overlay */}
        <AnimatedDropdown isOpen={showSearchPopover} className="left-0 right-0 top-full mt-2 p-2 shadow-2xl z-50">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100 dark:border-[#292D38] text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            <span>Search Results</span>
            {isSearching ? <span className="text-indigo-500 animate-pulse">Searching...</span> : <span>{searchResults.length} found</span>}
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-[#292D38]/50 my-1">
            {searchResults.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400">
                {isSearching ? 'Searching database...' : `No transactions found matching "${searchQuery}"`}
              </div>
            ) : (
              searchResults.map((tx) => (
                <button
                  key={tx.id}
                  onClick={() => handleSelectTransaction(tx)}
                  className="w-full text-left p-2.5 hover:bg-gray-50 dark:hover:bg-[#292D38]/50 rounded-xl transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-[#292D38] flex items-center justify-center text-sm shrink-0">
                      {tx.category?.icon || '📦'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {tx.description}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {tx.date} · {tx.category?.name || 'Uncategorized'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-extrabold shrink-0 ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                    {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount.toLocaleString('en-IN')}
                  </span>
                </button>
              ))
            )}
          </div>

          <button
            onClick={handleViewAllResults}
            className="w-full mt-1 py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View all results in Transactions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </AnimatedDropdown>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Theme Toggle Button */}
        <AnimatedButton
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="p-2 rounded-xl text-gray-500 dark:text-[#94A3B8] hover:bg-gray-100 dark:hover:bg-[#292D38]/60 transition-colors"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </AnimatedButton>

        {/* Notifications */}
        <div className="relative">
          <AnimatedButton
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-gray-500 dark:text-[#94A3B8] hover:bg-gray-100 dark:hover:bg-[#292D38]/60 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
          </AnimatedButton>

          <AnimatedDropdown isOpen={showNotifications} className="right-0 mt-2 w-72 p-3">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-[#292D38]">
              <span className="text-xs font-bold text-gray-900 dark:text-[#F8FAFC]">Notifications</span>
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-semibold">2 New</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300">
                ⚠️ <strong>Budget Warning:</strong> You've used 85% of Food budget.
              </div>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300">
                🎉 <strong>Income Received:</strong> ₹65,000 deposited.
              </div>
            </div>
          </AnimatedDropdown>
        </div>

        {/* Profile Menu Dropdown */}
        <div className="relative">
          <AnimatedButton
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-[#292D38]/60 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </AnimatedButton>

          <AnimatedDropdown isOpen={showProfileMenu} className="right-0 mt-2 w-48 p-1.5">
            <div className="px-3 py-2 border-b border-gray-100 dark:border-[#292D38]">
              <p className="text-xs font-semibold text-gray-900 dark:text-[#F8FAFC]">{user?.name}</p>
              <p className="text-[10px] text-gray-500 dark:text-[#94A3B8]">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors mt-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </AnimatedDropdown>
        </div>
      </div>
    </header>
  );
};
