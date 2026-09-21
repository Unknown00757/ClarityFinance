import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { AddTransaction } from './pages/AddTransaction';
import { Budgets } from './pages/Budgets';
import { Goals } from './pages/Goals';
import { Subscriptions } from './pages/Subscriptions';
import { Analytics } from './pages/Analytics';
import { Categories } from './pages/Categories';
import { AiInsights } from './pages/AiInsights';
import { Settings } from './pages/Settings';
import { Auth } from './pages/Auth';
import { TransactionDetailsModal } from './components/transactions/TransactionDetailsModal';
import { PageTransition } from './components/common/MotionWrapper';
import { WelcomeToast } from './components/common/WelcomeToast';
import { Transaction } from './types';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Editing states
  const [viewingTx, setViewingTx] = useState<Transaction | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1117] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold tracking-widest uppercase text-indigo-400">Loading ClarityFinance...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const handleEditClick = (tx: Transaction) => {
    setEditingTx(tx);
    setActiveTab('add-transaction');
  };

  const handleViewClick = (tx: Transaction) => {
    setViewingTx(tx);
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      selectedMonth={selectedMonth}
      setSelectedMonth={setSelectedMonth}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      onViewTransaction={handleViewClick}
    >
      <WelcomeToast />
      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <PageTransition key="dashboard">
            <Dashboard
              selectedMonth={selectedMonth}
              setActiveTab={setActiveTab}
              onViewTransaction={handleViewClick}
            />
          </PageTransition>
        )}

        {activeTab === 'transactions' && (
          <PageTransition key="transactions">
            <Transactions
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setActiveTab={setActiveTab}
              onEditTransaction={handleEditClick}
              onViewTransaction={handleViewClick}
            />
          </PageTransition>
        )}

        {activeTab === 'add-transaction' && (
          <PageTransition key="add-transaction">
            <AddTransaction
              setActiveTab={setActiveTab}
              editingTransaction={editingTx}
              onSuccess={() => setEditingTx(null)}
            />
          </PageTransition>
        )}

        {activeTab === 'budgets' && (
          <PageTransition key="budgets">
            <Budgets />
          </PageTransition>
        )}

        {activeTab === 'goals' && (
          <PageTransition key="goals">
            <Goals />
          </PageTransition>
        )}

        {activeTab === 'subscriptions' && (
          <PageTransition key="subscriptions">
            <Subscriptions />
          </PageTransition>
        )}

        {activeTab === 'analytics' && (
          <PageTransition key="analytics">
            <Analytics />
          </PageTransition>
        )}

        {activeTab === 'categories' && (
          <PageTransition key="categories">
            <Categories setActiveTab={setActiveTab} />
          </PageTransition>
        )}

        {activeTab === 'ai-insights' && (
          <PageTransition key="ai-insights">
            <AiInsights />
          </PageTransition>
        )}

        {activeTab === 'settings' && (
          <PageTransition key="settings">
            <Settings />
          </PageTransition>
        )}
      </AnimatePresence>

      {/* Transaction Details Modal */}
      {viewingTx && (
        <TransactionDetailsModal
          transaction={viewingTx}
          onClose={() => setViewingTx(null)}
          onEdit={(tx) => { setViewingTx(null); handleEditClick(tx); }}
          onDelete={() => { setViewingTx(null); setActiveTab('transactions'); }}
        />
      )}
    </Layout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
