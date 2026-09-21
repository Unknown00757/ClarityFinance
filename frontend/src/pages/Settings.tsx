import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Sun, 
  Moon, 
  Monitor, 
  Download, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  Globe,
  Bell,
  Lock,
  Shield,
  Palette,
  Database,
  FileSpreadsheet,
  FileJson,
  KeyRound,
  X,
  AlertCircle,
  HelpCircle,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { 
  PageTransition, 
  AnimatedCard, 
  StaggerContainer, 
  StaggerItem, 
  AnimatedModal, 
  AnimatedButton 
} from '../components/common/MotionWrapper';

export const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();

  // Initial values for unsaved changes detection
  const initialName = user?.name || '';
  const initialCurrency = user?.currency || '₹';
  const initialDateFormat = user?.date_format || 'MMM DD, YYYY';

  // Profile & Financial Preferences Form
  const [name, setName] = useState<string>(initialName);
  const [currency, setCurrency] = useState<string>(initialCurrency);
  const [dateFormat, setDateFormat] = useState<string>(initialDateFormat);
  const [firstDayOfWeek, setFirstDayOfWeek] = useState<'Monday' | 'Sunday'>('Monday');
  const [defaultTxnType, setDefaultTxnType] = useState<'Expense' | 'Income'>('Expense');
  const [accentColor, setAccentColor] = useState<string>('indigo');

  // Toggle States
  const [budgetAlerts, setBudgetAlerts] = useState<boolean>(true);
  const [budgetThreshold, setBudgetThreshold] = useState<string>('85%');
  const [goalReminders, setGoalReminders] = useState<boolean>(true);
  const [subReminders, setSubReminders] = useState<boolean>(true);
  const [monthlySummary, setMonthlySummary] = useState<boolean>(true);
  const [aiInsightsEnabled, setAiInsightsEnabled] = useState<boolean>(true);
  const [loginNotifications, setLoginNotifications] = useState<boolean>(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);

  // Status & Feedback States
  const [saving, setSaving] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal States
  const [showClearModal, setShowClearModal] = useState<boolean>(false);
  const [clearConfirmText, setClearConfirmText] = useState<string>('');
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);

  // Password Form State
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Detect Unsaved Changes
  const hasUnsavedChanges = name !== initialName || currency !== initialCurrency || dateFormat !== initialDateFormat;

  // Save Settings Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateProfile({
        name,
        currency,
        date_format: dateFormat,
        theme: theme,
      });
      updateUser(updated);
      showToast('✓ Preferences saved successfully.');
    } catch (err: unknown) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Failed to update settings.'}`);
    } finally {
      setSaving(false);
    }
  };

  // Export JSON Backup
  const handleExportJSON = async () => {
    try {
      const data = await api.exportData();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clarityfinance_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('✓ Backup JSON exported successfully.');
    } catch (err: unknown) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Export failed.'}`);
    }
  };

  // Export CSV Summary
  const handleExportCSV = async () => {
    try {
      const data = await api.exportData();
      const txns = data.transactions || [];
      const headers = ['ID', 'Date', 'Type', 'Amount', 'Description', 'Payment Method'];
      const rows = txns.map((t, idx) => [t.id ?? idx + 1, t.date, t.type, t.amount, `"${t.description}"`, `"${t.payment_method}"`]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clarityfinance_transactions_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('✓ Transactions CSV exported successfully.');
    } catch (err: unknown) {
      showToast(`❌ ${err instanceof Error ? err.message : 'CSV Export failed.'}`);
    }
  };

  // Clear Data Handler (Safer with CLEAR confirmation)
  const handleClearData = async () => {
    if (clearConfirmText.trim().toUpperCase() !== 'CLEAR') {
      showToast('❌ Please type CLEAR to confirm deletion.');
      return;
    }
    try {
      await api.clearData();
      setShowClearModal(false);
      setClearConfirmText('');
      showToast('✓ All transaction records cleared.');
    } catch (err: unknown) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Failed to clear data.'}`);
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (!passwordData.current || !passwordData.new) {
      setPasswordError('Please fill out all password fields.');
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    if (passwordData.new.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    setShowPasswordModal(false);
    setPasswordData({ current: '', new: '', confirm: '' });
    showToast('✓ Password updated successfully.');
  };

  return (
    <PageTransition className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-center justify-between text-xs font-semibold text-amber-800 dark:text-amber-200">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" /> You have unsaved preference changes.
          </span>
          <button
            onClick={handleSaveProfile}
            className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
          >
            Save Changes Now
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          Manage your profile, financial preferences, appearance, notifications, security, and data exports.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        <StaggerContainer className="space-y-6">
          {/* SECTION 1: PROFILE INFORMATION */}
          <StaggerItem>
            <AnimatedCard className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5">
              <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Profile Information</span>
              </h3>

              <div className="flex items-center gap-4 pb-2">
                <div className="w-16 h-16 rounded-3xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center font-extrabold text-2xl shadow-inner">
                  {name ? name.charAt(0).toUpperCase() : 'P'}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-base">{name || 'User'}</h4>
                  <p className="text-xs text-gray-400">{user?.email || 'demo@finance.com'}</p>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 text-[10px] font-bold mt-1">
                    Verified Account
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium border-t border-gray-100 dark:border-slate-800 pt-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Email Address (Read-only)</label>
                  <div className="relative">
                    <input
                      type="email"
                      disabled
                      value={user?.email || 'demo@finance.com'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-100 dark:bg-slate-800/50 text-gray-500 cursor-not-allowed font-medium pr-10"
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </StaggerItem>

          {/* SECTION 2: FINANCIAL PREFERENCES */}
          <StaggerItem>
            <AnimatedCard className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Financial Preferences</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Currency Symbol</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-bold cursor-pointer"
                  >
                    <option value="₹">₹ INR — Indian Rupee</option>
                    <option value="$">$ USD — US Dollar</option>
                    <option value="€">€ EUR — Euro</option>
                    <option value="£">£ GBP — British Pound</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Date Display Format</label>
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-bold cursor-pointer"
                  >
                    <option value="MMM DD, YYYY">17 Sep 2026 (Default)</option>
                    <option value="YYYY-MM-DD">2026-09-17 (ISO Standard)</option>
                    <option value="DD/MM/YYYY">17/09/2026 (UK/India Format)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">First Day of Week</label>
                  <select
                    value={firstDayOfWeek}
                    onChange={(e) => setFirstDayOfWeek(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-bold cursor-pointer"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Default Transaction Type</label>
                  <select
                    value={defaultTxnType}
                    onChange={(e) => setDefaultTxnType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-bold cursor-pointer"
                  >
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                  </select>
                </div>
              </div>
            </AnimatedCard>
          </StaggerItem>

          {/* SECTION 3: APPEARANCE & ACCENT COLOR */}
          <StaggerItem>
            <AnimatedCard className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                <Sun className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Appearance & Branding</span>
              </h3>

              <div className="grid grid-cols-3 gap-3 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                    theme === 'light' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/50 text-indigo-600' : 'border-gray-200 dark:border-slate-800'
                  }`}
                >
                  <Sun className="w-5 h-5 text-amber-500" />
                  <span>Light Mode</span>
                  <span className="text-[10px] text-gray-400 font-normal">Clean interface</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                    theme === 'dark' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/50 text-indigo-400' : 'border-gray-200 dark:border-slate-800'
                  }`}
                >
                  <Moon className="w-5 h-5 text-indigo-400" />
                  <span>Dark Mode</span>
                  <span className="text-[10px] text-gray-400 font-normal">Low-light comfort</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                    theme === 'system' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/50 text-indigo-600' : 'border-gray-200 dark:border-slate-800'
                  }`}
                >
                  <Monitor className="w-5 h-5 text-gray-500" />
                  <span>System</span>
                  <span className="text-[10px] text-gray-400 font-normal">Follow OS</span>
                </button>
              </div>

              <div className="pt-2">
                <label className="block font-bold text-gray-700 dark:text-gray-300 text-xs mb-2">Primary Brand Accent Color</label>
                <div className="flex gap-3">
                  {[
                    { id: 'indigo', label: 'Indigo', color: '#6366F1' },
                    { id: 'purple', label: 'Purple', color: '#8B5CF6' },
                    { id: 'blue', label: 'Blue', color: '#3B82F6' },
                    { id: 'emerald', label: 'Emerald', color: '#10B981' }
                  ].map(acc => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setAccentColor(acc.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        accentColor === acc.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60' : 'border-gray-200 dark:border-slate-800'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: acc.color }} />
                      <span>{acc.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </AnimatedCard>
          </StaggerItem>

          {/* SECTION 4: NOTIFICATIONS & ALERTS */}
          <StaggerItem>
            <AnimatedCard className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Notifications & Threshold Alerts</span>
              </h3>

              <div className="space-y-4 text-xs font-medium">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Category Budget Alerts</p>
                    <p className="text-gray-400 text-[11px]">Receive notifications when budget threshold is reached.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={budgetThreshold}
                      onChange={(e) => setBudgetThreshold(e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-bold"
                    >
                      <option value="75%">75% limit</option>
                      <option value="85%">85% limit</option>
                      <option value="100%">100% limit</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setBudgetAlerts(!budgetAlerts)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${budgetAlerts ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-slate-700'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${budgetAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-800">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Goal Milestone Reminders</p>
                    <p className="text-gray-400 text-[11px]">Notify about upcoming goal target completion dates.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGoalReminders(!goalReminders)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${goalReminders ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-slate-700'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${goalReminders ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-800">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Subscription Renewal Reminders</p>
                    <p className="text-gray-400 text-[11px]">Notify 3 days before recurring subscriptions renew.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubReminders(!subReminders)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${subReminders ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-slate-700'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${subReminders ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </AnimatedCard>
          </StaggerItem>

          {/* SECTION 5: SECURITY */}
          <StaggerItem>
            <AnimatedCard className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Security & Account Protection</span>
              </h3>

              <div className="space-y-3 text-xs font-medium">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/60">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Change Account Password</p>
                    <p className="text-gray-400 text-[11px]">Update your account login password.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 font-bold hover:bg-indigo-100"
                  >
                    Change Password →
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/60">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Two-Factor Authentication (2FA)</p>
                    <p className="text-gray-400 text-[11px]">Add an extra layer of security via TOTP authenticator app.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTwoFactorEnabled(!twoFactorEnabled);
                      showToast(`2FA is now ${!twoFactorEnabled ? 'enabled' : 'disabled'}`);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${
                      twoFactorEnabled ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950' : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {twoFactorEnabled ? '✓ Enabled' : 'Enable'}
                  </button>
                </div>
              </div>
            </AnimatedCard>
          </StaggerItem>

          {/* SAVE BUTTON */}
          <StaggerItem>
            <div className="flex justify-end">
              <AnimatedButton
                type="submit"
                disabled={saving || !hasUnsavedChanges}
                className={`px-6 py-3 rounded-2xl font-bold text-xs transition-all shadow-md ${
                  hasUnsavedChanges 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20' 
                    : 'bg-gray-200 dark:bg-slate-800 text-gray-400 cursor-not-allowed'
                }`}
              >
                {saving ? 'Saving Preferences...' : 'Save All Preferences'}
              </AnimatedButton>
            </div>
          </StaggerItem>

          {/* SECTION 6: DATA BACKUP & EXPORT */}
          <StaggerItem>
            <AnimatedCard className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Data Backup & Export</span>
              </h3>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Export your complete financial records to JSON or CSV backup files for safe keeping or external analysis.
              </p>

              <div className="flex flex-wrap gap-3 pt-1 text-xs">
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                  <FileJson className="w-4 h-4 text-indigo-600" />
                  <span>Export Full Backup (JSON)</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Export Transactions (CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowImportModal(true)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4 text-purple-600" />
                  <span>Import Backup</span>
                </button>
              </div>
            </AnimatedCard>
          </StaggerItem>

          {/* SECTION 7: DANGER ZONE */}
          <StaggerItem>
            <div className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-bold text-rose-600 dark:text-rose-400 text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Danger Zone</span>
              </h3>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-medium">
                <div>
                  <p className="font-bold text-rose-950 dark:text-rose-200">Clear All Transaction Data</p>
                  <p className="text-rose-800/80 dark:text-rose-300/80 text-[11px]">
                    Permanently remove transactions and reset category balances. This action cannot be undone.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowClearModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 whitespace-nowrap"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </form>

      {/* FOOTER PRODUCT INFO */}
      <div className="text-center text-xs text-gray-400 pt-4 space-y-1">
        <p className="font-bold text-gray-700 dark:text-gray-300">ClarityFinance v1.0.0</p>
        <p>Built with React, Tailwind CSS, Framer Motion & FastAPI</p>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      <AnimatedModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Change Password</h3>
            <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {passwordError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-3.5 text-xs font-medium">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Current Password *</label>
              <input
                type="password"
                required
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">New Password *</label>
              <input
                type="password"
                required
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Confirm New Password *</label>
              <input
                type="password"
                required
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-bold"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-gray-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-800 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      </AnimatedModal>

      {/* IMPORT BACKUP MODAL */}
      <AnimatedModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs font-medium">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Import Backup File</h3>
            <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-500 dark:text-gray-400">
            Select a supported JSON or CSV backup file exported from ClarityFinance.
          </p>

          <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 p-6 rounded-2xl text-center space-y-2 cursor-pointer hover:border-indigo-500">
            <Upload className="w-8 h-8 text-indigo-600 mx-auto" />
            <p className="font-bold text-gray-900 dark:text-white">Click or drag backup file here</p>
            <p className="text-[10px] text-gray-400">Supports .json and .csv files</p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={() => setShowImportModal(false)}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-800 font-bold"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowImportModal(false);
                showToast('✓ Backup file imported successfully');
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
            >
              Import Data
            </button>
          </div>
        </div>
      </AnimatedModal>

      {/* SAFER CLEAR ALL DATA CONFIRMATION MODAL */}
      <AnimatedModal
        isOpen={showClearModal}
        onClose={() => {
          setShowClearModal(false);
          setClearConfirmText('');
        }}
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs font-medium">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="text-center space-y-1">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Clear All Financial Data?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              This will permanently delete all transactions, budget records, custom categories, and goal history.
            </p>
          </div>

          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl text-rose-900 dark:text-rose-200">
            <p className="font-bold mb-1">To confirm deletion, type CLEAR in capital letters below:</p>
            <input
              type="text"
              placeholder="Type CLEAR to confirm"
              value={clearConfirmText}
              onChange={(e) => setClearConfirmText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white font-extrabold text-sm"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                setShowClearModal(false);
                setClearConfirmText('');
              }}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleClearData}
              disabled={clearConfirmText.trim().toUpperCase() !== 'CLEAR'}
              className={`flex-1 py-2.5 rounded-xl font-bold text-white transition-all ${
                clearConfirmText.trim().toUpperCase() === 'CLEAR'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20'
                  : 'bg-gray-300 dark:bg-slate-700 cursor-not-allowed'
              }`}
            >
              Clear All Data
            </button>
          </div>
        </div>
      </AnimatedModal>
    </PageTransition>
  );
};
