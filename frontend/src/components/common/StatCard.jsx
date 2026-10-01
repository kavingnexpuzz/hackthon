import React from 'react';
import Card from './Card';

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'indigo',
  subtitle,
  onClick,
}) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900',
      glow: 'group-hover:border-indigo-500/40',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900',
      glow: 'group-hover:border-amber-500/40',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900',
      glow: 'group-hover:border-emerald-500/40',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900',
      glow: 'group-hover:border-blue-500/40',
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900',
      glow: 'group-hover:border-rose-500/40',
    },
  };

  const selected = colorMap[color] || colorMap.indigo;

  return (
    <Card
      onClick={onClick}
      hover={!!onClick}
      className={`group relative overflow-hidden transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      } ${selected.glow}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {value !== undefined ? value : 0}
          </h3>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2 text-xs flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
              <span>{trend}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={`p-3 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-110 duration-200 ${selected.bg}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
