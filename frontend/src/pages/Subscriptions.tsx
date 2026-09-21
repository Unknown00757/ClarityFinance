import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Calendar, 
  RefreshCw, 
  X, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  PauseCircle, 
  PlayCircle,
  Filter,
  DollarSign,
  ChevronRight,
  Info,
  Edit3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SubscriptionItem } from '../types';
import { PageTransition, AnimatedCard, StaggerContainer, StaggerItem, AnimatedModal, AnimatedButton } from '../components/common/MotionWrapper';
import { AnimatedNumber } from '../components/common/AnimatedNumber';

const CATEGORIES = ['Entertainment', 'Music', 'Cloud Storage', 'Developer Tools', 'Utilities', 'Fitness', 'Productivity', 'Other'];
const PAYMENT_METHODS = ['HDFC Credit Card', 'ICICI Debit Card', 'UPI / Paytm', 'Apple Pay', 'PayPal', 'Auto-Debit NetBanking'];
const ICONS = ['🍿', '🎵', '☁️', '🤖', '⚡', '🏋️', '📚', '💼', '🎮', '📰', '🌐', '💳'];

export const Subscriptions: React.FC = () => {
  const { user } = useAuth();
  const currency = user?.currency || '₹';

  const [subs, setSubs] = useState<SubscriptionItem[]>([
    { 
      id: 1, 
      name: 'Netflix 4K Ultra HD', 
      icon: '🍿', 
      cost: 649, 
      billing_cycle: 'Monthly', 
      renewal_date: '2026-09-22',
      category: 'Entertainment',
      payment_method: 'HDFC Credit Card',
      status: 'active',
      notes: 'Family plan shared with brother'
    },
    { 
      id: 2, 
      name: 'Spotify Family Premium', 
      icon: '🎵', 
      cost: 179, 
      billing_cycle: 'Monthly', 
      renewal_date: '2026-09-25',
      category: 'Music',
      payment_method: 'UPI / Paytm',
      status: 'active',
      notes: 'Auto-renews on 25th'
    },
    { 
      id: 3, 
      name: 'iCloud+ 2TB Storage', 
      icon: '☁️', 
      cost: 749, 
      billing_cycle: 'Monthly', 
      renewal_date: '2026-09-28',
      category: 'Cloud Storage',
      payment_method: 'Apple Pay',
      status: 'active',
      notes: 'Storage for photo backup'
    },
    { 
      id: 4, 
      name: 'GitHub Copilot Pro', 
      icon: '🤖', 
      cost: 820, 
      billing_cycle: 'Monthly', 
      renewal_date: '2026-10-01',
      category: 'Developer Tools',
      payment_method: 'ICICI Debit Card',
      status: 'active',
      notes: 'AI autocomplete assistant'
    },
    { 
      id: 5, 
      name: 'Gym Membership', 
      icon: '🏋️', 
      cost: 2500, 
      billing_cycle: 'Monthly', 
      renewal_date: '2026-10-05',
      category: 'Fitness',
      payment_method: 'HDFC Credit Card',
      status: 'paused',
      notes: 'Paused for travel in September'
    }
  ]);

  // Renewal window filter state (7 Days, 30 Days, All)
  const [renewalWindow, setRenewalWindow] = useState<'7days' | '30days' | 'all'>('7days');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSub, setEditingSub] = useState<SubscriptionItem | null>(null);
  const [selectedSubDetails, setSelectedSubDetails] = useState<SubscriptionItem | null>(null);
  const [deletingSubId, setDeletingSubId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    billing_cycle: 'Monthly',
    renewal_date: new Date().toISOString().split('T')[0],
    category: 'Entertainment',
    payment_method: 'HDFC Credit Card',
    icon: '🍿',
    notes: ''
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper: calculate days until renewal relative to 2026-09-20
  const getDaysUntilRenewal = (dateStr: string) => {
    const today = new Date('2026-09-20');
    const target = new Date(dateStr);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Sorted active subscriptions with days remaining
  const enrichedSubs = useMemo(() => {
    return subs.map(s => {
      const daysLeft = getDaysUntilRenewal(s.renewal_date);
      return { ...s, daysLeft };
    }).sort((a, b) => a.daysLeft - b.daysLeft);
  }, [subs]);

  // Filtered upcoming renewals priority list based on selected time window
  const upcomingRenewals = useMemo(() => {
    return enrichedSubs.filter(s => {
      if (s.status !== 'active') return false;
      if (renewalWindow === '7days') return s.daysLeft >= 0 && s.daysLeft <= 7;
      if (renewalWindow === '30days') return s.daysLeft >= 0 && s.daysLeft <= 30;
      return s.daysLeft >= 0;
    });
  }, [enrichedSubs, renewalWindow]);

  // Upcoming renewals total cost for selected window
  const upcomingTotalCost = useMemo(() => {
    return upcomingRenewals.reduce((sum, s) => sum + s.cost, 0);
  }, [upcomingRenewals]);

  // Total active monthly subscription cost
  const activeMonthlyTotal = useMemo(() => {
    return subs.filter(s => s.status === 'active').reduce((sum, s) => sum + s.cost, 0);
  }, [subs]);

  // Open Add Modal
  const openAddModal = () => {
    setEditingSub(null);
    setFormData({
      name: '',
      cost: '',
      billing_cycle: 'Monthly',
      renewal_date: new Date().toISOString().split('T')[0],
      category: 'Entertainment',
      payment_method: PAYMENT_METHODS[0],
      icon: ICONS[0],
      notes: ''
    });
    setShowAddModal(true);
  };

  // Open Edit Modal
  const openEditModal = (sub: SubscriptionItem) => {
    setEditingSub(sub);
    setFormData({
      name: sub.name,
      cost: sub.cost.toString(),
      billing_cycle: sub.billing_cycle,
      renewal_date: sub.renewal_date,
      category: sub.category || 'Entertainment',
      payment_method: sub.payment_method || PAYMENT_METHODS[0],
      icon: sub.icon || '💳',
      notes: sub.notes || ''
    });
    setSelectedSubDetails(null);
    setShowAddModal(true);
  };

  // Save Subscription (Create or Edit)
  const handleSaveSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.cost || isNaN(Number(formData.cost)) || Number(formData.cost) <= 0) {
      showToast('Please enter a valid service name and positive cost.');
      return;
    }

    if (editingSub) {
      setSubs(subs.map(s => s.id === editingSub.id ? {
        ...s,
        name: formData.name.trim(),
        cost: parseFloat(formData.cost),
        billing_cycle: formData.billing_cycle,
        renewal_date: formData.renewal_date,
        category: formData.category,
        payment_method: formData.payment_method,
        icon: formData.icon,
        notes: formData.notes
      } : s));
      showToast(`Updated subscription "${formData.name.trim()}"`);
    } else {
      const newSub: SubscriptionItem = {
        id: Date.now(),
        name: formData.name.trim(),
        cost: parseFloat(formData.cost),
        billing_cycle: formData.billing_cycle,
        renewal_date: formData.renewal_date,
        category: formData.category,
        payment_method: formData.payment_method,
        icon: formData.icon,
        status: 'active',
        notes: formData.notes
      };
      setSubs([...subs, newSub]);
      showToast(`Added subscription "${formData.name.trim()}"`);
    }
    setShowAddModal(false);
  };

  // Toggle Pause/Active state
  const handleToggleStatus = (sub: SubscriptionItem) => {
    const newStatus = sub.status === 'active' ? 'paused' : 'active';
    setSubs(subs.map(s => s.id === sub.id ? { ...s, status: newStatus } : s));
    if (selectedSubDetails && selectedSubDetails.id === sub.id) {
      setSelectedSubDetails({ ...selectedSubDetails, status: newStatus });
    }
    showToast(`${sub.name} is now ${newStatus}`);
  };

  // Delete Subscription
  const confirmDelete = () => {
    if (deletingSubId !== null) {
      const target = subs.find(s => s.id === deletingSubId);
      setSubs(subs.filter(s => s.id !== deletingSubId));
      if (selectedSubDetails?.id === deletingSubId) {
        setSelectedSubDetails(null);
      }
      setDeletingSubId(null);
      showToast(`Deleted ${target?.name || 'subscription'}`);
    }
  };

  return (
    <PageTransition className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 text-xs font-bold mb-1">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Recurring Outflows</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#F8FAFC] tracking-tight">Active Subscriptions</h1>
          <p className="text-xs text-gray-500 dark:text-[#94A3B8] font-medium">
            Monitor, prioritize, and optimize all your recurring digital services and software subscriptions.
          </p>
        </div>
        <AnimatedButton
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subscription</span>
        </AnimatedButton>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-5 rounded-3xl shadow-sm space-y-1">
          <span className="text-xs font-semibold text-gray-400">Total Monthly Outflow</span>
          <div className="text-2xl font-bold text-gray-900 dark:text-[#F8FAFC]">
            <AnimatedNumber value={activeMonthlyTotal} prefix={currency} />
          </div>
          <p className="text-[11px] text-gray-400">Across {subs.filter(s => s.status === 'active').length} active services</p>
        </div>

        <div className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-5 rounded-3xl shadow-sm space-y-1">
          <span className="text-xs font-semibold text-gray-400">Annualized Total Outflow</span>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            <AnimatedNumber value={activeMonthlyTotal * 12} prefix={currency} />
          </div>
          <p className="text-[11px] text-gray-400">Projected yearly expenditure</p>
        </div>

        <div className="bg-white dark:bg-[#171A23] border border-gray-100 dark:border-[#292D38] p-5 rounded-3xl shadow-sm space-y-1">
          <span className="text-xs font-semibold text-gray-400">Upcoming Renewals Cost ({renewalWindow === '7days' ? '7 Days' : renewalWindow === '30days' ? '30 Days' : 'All'})</span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            <AnimatedNumber value={upcomingTotalCost} prefix={currency} />
          </div>
          <p className="text-[11px] text-gray-400">{upcomingRenewals.length} services due soon</p>
        </div>
      </div>

      {/* Mandatory Priority Feature: UPCOMING RENEWALS SECTION */}
      <div className="bg-gradient-to-br from-indigo-900/90 to-purple-950 text-white rounded-3xl p-6 shadow-xl space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Upcoming Renewals Priority Feed</h2>
              <p className="text-xs text-indigo-200">Sorted chronologically so you never miss a payment or trial expiry</p>
            </div>
          </div>

          {/* Time Window Filters */}
          <div className="flex items-center bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/10 text-xs font-bold">
            <button
              onClick={() => setRenewalWindow('7days')}
              className={`px-3 py-1.5 rounded-xl transition-all ${renewalWindow === '7days' ? 'bg-white text-indigo-900 shadow-md' : 'text-indigo-200 hover:text-white'}`}
            >
              7 Days
            </button>
            <button
              onClick={() => setRenewalWindow('30days')}
              className={`px-3 py-1.5 rounded-xl transition-all ${renewalWindow === '30days' ? 'bg-white text-indigo-900 shadow-md' : 'text-indigo-200 hover:text-white'}`}
            >
              30 Days
            </button>
            <button
              onClick={() => setRenewalWindow('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${renewalWindow === 'all' ? 'bg-white text-indigo-900 shadow-md' : 'text-indigo-200 hover:text-white'}`}
            >
              All Active
            </button>
          </div>
        </div>

        {upcomingRenewals.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center text-indigo-200 text-xs font-medium">
            ✨ No active subscription renewals due in this time window!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {upcomingRenewals.map((s) => (
              <div 
                key={s.id}
                onClick={() => setSelectedSubDetails(s)}
                className="bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md p-4 rounded-2xl transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-white/10">{s.icon}</span>
                    <div>
                      <h4 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">{s.name}</h4>
                      <p className="text-[11px] text-indigo-200 font-medium">{s.category || 'Subscription'}</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-white text-base">{currency}{s.cost}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-indigo-200 text-[11px] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                    {s.renewal_date}
                  </span>
                  
                  {/* Status Badge */}
                  {s.daysLeft === 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/80 text-white font-extrabold text-[10px] animate-pulse">
                      Renews Today
                    </span>
                  ) : s.daysLeft === 1 ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/80 text-white font-extrabold text-[10px]">
                      Renews Tomorrow
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/60 text-indigo-100 font-bold text-[10px]">
                      Renews in {s.daysLeft} days
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Subscriptions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-[#F8FAFC]">All Subscriptions ({subs.length})</h2>
          <span className="text-xs text-gray-400">Click card for detailed view & controls</span>
        </div>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enrichedSubs.map((s) => (
            <StaggerItem key={s.id}>
              <AnimatedCard 
                onClick={() => setSelectedSubDetails(s)}
                className={`bg-white dark:bg-[#171A23] border p-5 rounded-3xl shadow-sm transition-all cursor-pointer flex items-center justify-between hover:shadow-md ${
                  s.status === 'paused' 
                    ? 'border-dashed border-gray-300 dark:border-gray-700 opacity-70' 
                    : 'border-gray-100 dark:border-[#292D38] hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-[#0F1117] flex items-center justify-center text-2xl shadow-inner relative">
                    {s.icon}
                    {s.status === 'paused' && (
                      <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-0.5" title="Paused">
                        <PauseCircle className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 dark:text-[#F8FAFC] text-sm">{s.name}</h3>
                      {s.status === 'paused' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                          Paused
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400 font-medium">
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 text-indigo-500" />
                        {s.billing_cycle}
                      </span>
                      <span>•</span>
                      <span>Renews {s.renewal_date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-extrabold text-gray-900 dark:text-[#F8FAFC] text-base">{currency}{s.cost}</span>
                    <p className="text-[10px] text-gray-400">/mo</p>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openEditModal(s)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                      title="Edit Subscription"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingSubId(s.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Subscription"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </AnimatedCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      {/* SUBSCRIPTION DETAILS MODAL */}
      <AnimatedModal
        isOpen={!!selectedSubDetails}
        onClose={() => setSelectedSubDetails(null)}
        maxWidth="max-w-md"
      >
        {selectedSubDetails && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#292D38] pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-2xl bg-gray-50 dark:bg-[#0F1117]">{selectedSubDetails.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-[#F8FAFC] text-lg">{selectedSubDetails.name}</h3>
                  <p className="text-xs text-gray-400">{selectedSubDetails.category || 'General Service'}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSubDetails(null)} 
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-[#292D38]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-[#0F1117] rounded-2xl space-y-0.5">
                  <span className="text-gray-400 font-semibold text-[10px]">Monthly Charge</span>
                  <p className="text-lg font-bold text-gray-900 dark:text-[#F8FAFC]">{currency}{selectedSubDetails.cost}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-[#0F1117] rounded-2xl space-y-0.5">
                  <span className="text-gray-400 font-semibold text-[10px]">Annualized Outflow</span>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{currency}{selectedSubDetails.cost * 12}</p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-[#0F1117] rounded-2xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Billing Cycle</span>
                  <span className="font-bold text-gray-900 dark:text-[#F8FAFC]">{selectedSubDetails.billing_cycle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Next Renewal Date</span>
                  <span className="font-bold text-gray-900 dark:text-[#F8FAFC]">{selectedSubDetails.renewal_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Payment Method</span>
                  <span className="font-bold text-gray-900 dark:text-[#F8FAFC]">{selectedSubDetails.payment_method || 'Default Card'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Current Status</span>
                  <span className={`font-bold capitalize ${selectedSubDetails.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {selectedSubDetails.status || 'Active'}
                  </span>
                </div>
              </div>

              {selectedSubDetails.notes && (
                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl">
                  <span className="font-bold text-indigo-700 dark:text-indigo-300 block mb-0.5">Notes:</span>
                  <p className="text-indigo-950 dark:text-indigo-200">{selectedSubDetails.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between gap-2 border-t border-gray-100 dark:border-[#292D38]">
              <button
                onClick={() => handleToggleStatus(selectedSubDetails)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedSubDetails.status === 'active' 
                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300' 
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300'
                }`}
              >
                {selectedSubDetails.status === 'active' ? (
                  <><PauseCircle className="w-4 h-4" /> Pause Subscription</>
                ) : (
                  <><PlayCircle className="w-4 h-4" /> Resume Subscription</>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(selectedSubDetails)}
                  className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#0F1117] dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 text-xs font-bold"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    const id = selectedSubDetails.id;
                    setSelectedSubDetails(null);
                    setDeletingSubId(id);
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-400 text-xs font-bold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatedModal>

      {/* CREATE / EDIT SUBSCRIPTION MODAL */}
      <AnimatedModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#292D38] pb-3">
            <h3 className="font-bold text-gray-900 dark:text-[#F8FAFC] text-lg">
              {editingSub ? 'Edit Subscription' : 'Add New Subscription'}
            </h3>
            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveSub} className="space-y-3.5 text-xs font-medium">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Service Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Disney+ Hotstar, Notion Pro"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#292D38] bg-gray-50 dark:bg-[#0F1117] text-gray-900 dark:text-[#F8FAFC] font-bold focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Monthly Cost ({currency}) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="299"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#292D38] bg-gray-50 dark:bg-[#0F1117] text-gray-900 dark:text-[#F8FAFC] font-bold focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Billing Cycle</label>
                <select
                  value={formData.billing_cycle}
                  onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#292D38] bg-gray-50 dark:bg-[#0F1117] text-gray-900 dark:text-[#F8FAFC] font-bold"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Renewal Date</label>
                <input
                  type="date"
                  value={formData.renewal_date}
                  onChange={(e) => setFormData({ ...formData, renewal_date: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#292D38] bg-gray-50 dark:bg-[#0F1117] text-gray-900 dark:text-[#F8FAFC] font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#292D38] bg-gray-50 dark:bg-[#0F1117] text-gray-900 dark:text-[#F8FAFC] font-bold"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#292D38] bg-gray-50 dark:bg-[#0F1117] text-gray-900 dark:text-[#F8FAFC] font-bold"
              >
                {PAYMENT_METHODS.map(pm => <option key={pm} value={pm}>{pm}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Icon Emoji</label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {ICONS.map(ic => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: ic })}
                    className={`p-2 rounded-xl text-xl transition-all ${formData.icon === ic ? 'bg-indigo-600 text-white scale-110 shadow-md' : 'bg-gray-100 dark:bg-[#0F1117]'}`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Notes (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Plan details, renewal reminder notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#292D38] bg-gray-50 dark:bg-[#0F1117] text-gray-900 dark:text-[#F8FAFC]"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-gray-100 dark:border-[#292D38]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-[#292D38] font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <AnimatedButton
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
              >
                {editingSub ? 'Save Changes' : 'Create Subscription'}
              </AnimatedButton>
            </div>
          </form>
        </div>
      </AnimatedModal>

      {/* DELETE CONFIRMATION DIALOG */}
      <AnimatedModal
        isOpen={deletingSubId !== null}
        onClose={() => setDeletingSubId(null)}
        maxWidth="max-w-sm"
      >
        <div className="space-y-4 text-center p-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 mx-auto flex items-center justify-center">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-[#F8FAFC] text-base">Delete Subscription?</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This action cannot be undone. Are you sure you want to remove this subscription from your tracker?
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setDeletingSubId(null)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-[#292D38] text-xs font-bold text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20"
            >
              Delete
            </button>
          </div>
        </div>
      </AnimatedModal>
    </PageTransition>
  );
};
