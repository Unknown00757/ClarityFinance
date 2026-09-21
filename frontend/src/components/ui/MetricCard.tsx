import React from 'react';
import { AnimatedNumber } from '../common/AnimatedNumber';
import { AnimatedCard } from '../common/MotionWrapper';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  valueClassName?: string;
  className?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  subtitle,
  icon,
  trend,
  valueClassName = 'text-gray-900 dark:text-white',
  className = '',
  onClick
}) => {
  return (
    <AnimatedCard
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-1 ${
        onClick ? 'cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-all' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">{title}</span>
        {icon && <div className="p-1.5 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-500">{icon}</div>}
      </div>

      <div className="flex items-baseline justify-between gap-2 pt-0.5">
        <div className={`text-2xl font-bold tracking-tight ${valueClassName}`}>
          <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
        </div>

        {trend && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-extrabold px-2 py-0.5 rounded-full ${
            trend.isPositive 
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' 
              : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
          }`}>
            {trend.isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && <p className="text-[11px] text-gray-400 font-medium">{subtitle}</p>}
    </AnimatedCard>
  );
};
