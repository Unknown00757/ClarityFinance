import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  BarChart3, 
  Target, 
  Loader2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EASING } from '../theme/motion';

export const Auth: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('demo@finance.com');
  const [password, setPassword] = useState<string>('password123');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Status & Feedback
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);
  const [demoFilledToast, setDemoFilledToast] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (isRegister) {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      setLoginSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please check your credentials.');
      setSubmitting(false);
    }
  };

  const fillDemo = () => {
    setEmail('demo@finance.com');
    setPassword('password123');
    setIsRegister(false);
    setError(null);
    setDemoFilledToast(true);
    setTimeout(() => setDemoFilledToast(false), 2500);
  };

  const handleForgotPassword = () => {
    alert('Password reset instructions have been sent to your email (if registered).');
  };

  const handleSocialLogin = async (provider: string) => {
    setSubmitting(true);
    setError(null);
    try {
      await login('demo@finance.com', 'password123');
      setLoginSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to sign in with ${provider}.`);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-between selection:bg-indigo-500/20 selection:text-indigo-700 relative overflow-hidden font-sans">
      {/* Subtle Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex items-center justify-center relative z-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT SECTION: Brand / Product Intro (55% on desktop) */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASING.OUT }}
            className="lg:col-span-7 space-y-8 max-w-xl mx-auto lg:mx-0 text-center lg:text-left"
          >
            {/* Logo & Subtitle */}
            <motion.div 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0 }}
              className="flex items-center justify-center lg:justify-start gap-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#4F46E5] flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-[#0F172A] block leading-none">
                  ClarityFinance
                </span>
                <span className="text-[11px] font-semibold text-[#4F46E5] tracking-wide uppercase mt-0.5 block">
                  Personal Finance & Expense Analytics
                </span>
              </div>
            </motion.div>

            {/* Headline & Description */}
            <motion.div 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="space-y-3"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight text-[#0F172A] leading-[1.15]">
                Take control of your finances with clarity.
              </h1>
              <p className="text-sm sm:text-base text-[#64748B] font-normal leading-relaxed max-w-lg mx-auto lg:mx-0">
                Track spending, understand your cash flow, manage budgets, and stay on top of your financial goals — all in one place.
              </p>
            </motion.div>

            {/* Feature Highlights (3 Compact Items) */}
            <motion.div 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.18 }}
              className="space-y-4 pt-2 border-t border-gray-200/80 max-w-md mx-auto lg:mx-0"
            >
              <div className="flex items-start gap-3.5 text-left">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-[#4F46E5] flex items-center justify-center shrink-0 mt-0.5">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">Financial Analytics</h4>
                  <p className="text-[11px] text-[#64748B] font-medium">Understand spending patterns, income, expenses, and cash flow.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-left">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-[#4F46E5] flex items-center justify-center shrink-0 mt-0.5">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">Budget & Goal Tracking</h4>
                  <p className="text-[11px] text-[#64748B] font-medium">Track budgets and financial goals with clear progress indicators.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-left">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-[#4F46E5] flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">AI-Powered Insights</h4>
                  <p className="text-[11px] text-[#64748B] font-medium">Get data-driven insights based on your financial activity.</p>
                </div>
              </div>
            </motion.div>

            {/* Subtle Product Statement */}
            <p className="text-xs text-[#64748B] font-medium pt-2">
              One dashboard. Complete financial visibility.
            </p>
          </motion.div>

          {/* RIGHT SECTION: Refined Login Card (~380–440px) */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.22, ease: EASING.OUT }}
            className="lg:col-span-5 max-w-md w-full mx-auto"
          >
            <div className="bg-white border border-gray-200/80 p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/60 space-y-6">
              
              {/* Card Header & Register Link */}
              <div className="flex items-start justify-between pb-2">
                <div>
                  <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
                    {isRegister ? 'Create Account' : 'Welcome Back'}
                  </h2>
                  <p className="text-xs text-[#64748B] font-medium mt-1">
                    {isRegister ? 'Get started with ClarityFinance today.' : 'Sign in to continue to your ClarityFinance dashboard.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setIsRegister(!isRegister); setError(null); }}
                  className="text-xs font-semibold text-[#4F46E5] hover:underline transition-colors shrink-0 ml-2"
                >
                  {isRegister ? 'Sign In' : 'Register'}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium"
                >
                  {error}
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name Field (Registration only) */}
                {isRegister && (
                  <div>
                    <label htmlFor="auth-name" className="block text-xs font-bold text-[#0F172A] mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        id="auth-name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-[#0F172A] text-xs font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label htmlFor="auth-email" className="block text-xs font-bold text-[#0F172A] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="auth-email"
                      type="email"
                      autoComplete="email"
                      placeholder="demo@finance.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                        error && !email.trim() ? 'border-rose-500 bg-rose-50/50' : 'border-gray-200 bg-gray-50/50'
                      } text-[#0F172A] text-xs font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] focus:bg-white transition-all`}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="auth-password" className="block text-xs font-bold text-[#0F172A]">
                      Password
                    </label>
                    {!isRegister && (
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-[11px] font-semibold text-[#4F46E5] hover:underline transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-3 rounded-xl border ${
                        error && !password ? 'border-rose-500 bg-rose-50/50' : 'border-gray-200 bg-gray-50/50'
                      } text-[#0F172A] text-xs font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] focus:bg-white transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      title={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field (Registration only) */}
                {isRegister && (
                  <div>
                    <label htmlFor="auth-confirm-password" className="block text-xs font-bold text-[#0F172A] mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        id="auth-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-[#0F172A] text-xs font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Sign In CTA Button */}
                <div className="pt-2">
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: submitting ? 1 : 1.01 }}
                    whileTap={{ scale: submitting ? 1 : 0.98 }}
                    className="w-full py-3.5 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : loginSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>Welcome back</span>
                      </>
                    ) : (
                      <>
                        <span>{isRegister ? 'Register Account' : 'Sign In'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </div>
              </form>

              {/* Divider */}
              <div className="relative flex items-center justify-center pt-1 pb-1">
                <div className="border-t border-gray-200/80 w-full" />
                <span className="bg-white px-3 text-[10px] font-bold text-[#64748B] shrink-0 uppercase tracking-wider">
                  Or continue with
                </span>
                <div className="border-t border-gray-200/80 w-full" />
              </div>

              {/* Social Login Options */}
              <div className="grid grid-cols-3 gap-2.5">
                {/* Google */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Google')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-[#0F172A] shadow-sm transition-all"
                  title="Sign in with Google"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Google</span>
                </button>

                {/* Apple */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Apple')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-[#0F172A] shadow-sm transition-all"
                  title="Sign in with Apple"
                >
                  <svg className="w-4 h-4 shrink-0 fill-current text-[#0F172A]" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.8c.67-.82 1.13-1.96.99-3.1-.97.04-2.16.65-2.85 1.46-.61.71-1.15 1.87-.99 2.99 1.09.08 2.21-.53 2.85-1.35z"/>
                  </svg>
                  <span>Apple</span>
                </button>

                {/* GitHub */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('GitHub')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-[#0F172A] shadow-sm transition-all"
                  title="Sign in with GitHub"
                >
                  <svg className="w-4 h-4 shrink-0 fill-current text-[#0F172A]" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>

              {/* Secondary Compact Demo Login Panel */}
              {!isRegister && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <span className="font-bold text-[#0F172A] block text-[11px]">Try the demo account</span>
                      <span className="text-[#64748B] text-[10px] font-medium block">demo@finance.com</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={fillDemo}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] border border-indigo-200 font-bold text-[11px] transition-colors shrink-0 flex items-center gap-1"
                  >
                    {demoFilledToast ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Filled</span>
                      </>
                    ) : (
                      <span>Auto Fill</span>
                    )}
                  </button>
                </motion.div>
              )}

              {/* Register Prompt */}
              <div className="pt-2 text-center text-xs text-[#64748B] font-medium">
                {isRegister ? (
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setIsRegister(false); setError(null); }}
                      className="font-bold text-[#4F46E5] hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                ) : (
                  <p>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setIsRegister(true); setError(null); }}
                      className="font-bold text-[#4F46E5] hover:underline"
                    >
                      Register
                    </button>
                  </p>
                )}
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 py-4 text-center text-[11px] text-[#64748B] font-medium border-t border-gray-200/80 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 ClarityFinance. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-[#0F172A] cursor-pointer transition-colors">Privacy</span>
            <span>·</span>
            <span className="hover:text-[#0F172A] cursor-pointer transition-colors">Terms</span>
            <span>·</span>
            <span className="hover:text-[#0F172A] cursor-pointer transition-colors">Help</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
