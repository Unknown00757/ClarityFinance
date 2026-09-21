import React from 'react';
import { LayoutDashboard, Receipt, PlusCircle, Target, Sparkles } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'transactions', label: 'History', icon: Receipt },
    { id: 'add-transaction', label: 'Add', icon: PlusCircle, highlight: true },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'ai-insights', label: 'AI Advisor', icon: Sparkles },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#171A23]/90 backdrop-blur-lg border-t border-gray-200 dark:border-[#292D38] px-2 py-1.5 flex items-center justify-around">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        if (item.highlight) {
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center -mt-5"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <PlusCircle className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">{item.label}</span>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-colors ${
              isActive ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-400 dark:text-[#94A3B8]'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
