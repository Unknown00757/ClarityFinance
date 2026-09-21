import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { Transaction } from '../../types';

interface LayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onViewTransaction?: (tx: Transaction) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  activeTab,
  setActiveTab,
  selectedMonth,
  setSelectedMonth,
  searchQuery,
  setSearchQuery,
  onViewTransaction,
  children,
}) => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Topbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onViewTransaction={onViewTransaction}
        />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};
