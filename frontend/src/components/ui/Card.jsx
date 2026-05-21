// Card.jsx — Card container
import clsx from 'clsx';

export default function Card({ children, className = '', title, subtitle, action, noPadding = false }) {
  return (
    <div className={clsx('glass-card overflow-hidden', className)}>
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-surface-border bg-slate-50/50">
          <div>
            {title && <h3 className="font-display font-semibold text-slate-900 text-lg">{title}</h3>}
            {subtitle && <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0 ml-4">{action}</div>}
        </div>
      )}
      <div className={clsx(!noPadding && 'p-6')}>{children}</div>
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, trend, color = 'teal' }) {
  const iconWrap = {
    teal: 'text-primary-600 bg-primary-50',
    green: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
    purple: 'text-accent-600 bg-indigo-50',
  };
  const valueTone = {
    teal: 'text-primary-700',
    green: 'text-emerald-700',
    amber: 'text-amber-700',
    purple: 'text-accent-600',
  };

  return (
    <div className="glass-card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-500 text-sm font-medium">{label}</span>
        {Icon && (
          <span className={clsx('p-2.5 rounded-xl', iconWrap[color])}>
            <Icon size={18} />
          </span>
        )}
      </div>
      <div className={clsx('text-3xl font-display font-bold', valueTone[color])}>{value}</div>
      {trend && <div className="text-xs text-slate-500 mt-1">{trend}</div>}
    </div>
  );
}
