import clsx from 'clsx';

export default function Card({ children, className = '', title, subtitle, action, noPadding = false }) {
  return (
    <div className={clsx('glass-card overflow-hidden', className)}>
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-line bg-card-hover/50">
          <div>
            {title && <h3 className="font-display font-semibold text-app text-lg">{title}</h3>}
            {subtitle && <p className="text-app-muted text-sm mt-0.5">{subtitle}</p>}
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
    teal: 'text-brand bg-brand-soft',
    green: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50',
    purple: 'text-accent bg-accent-soft',
  };
  const valueTone = {
    teal: 'text-brand',
    green: 'text-emerald-600 dark:text-emerald-400',
    amber: 'text-amber-600 dark:text-amber-400',
    purple: 'text-accent',
  };

  return (
    <div className="glass-card p-5 hover:shadow-glow transition-shadow duration-300">
      <div className="flex items-center justify-between mb-3">
        <span className="text-app-muted text-sm font-medium">{label}</span>
        {Icon && (
          <span className={clsx('p-2.5 rounded-xl', iconWrap[color])}>
            <Icon size={18} />
          </span>
        )}
      </div>
      <div className={clsx('text-3xl font-display font-bold', valueTone[color])}>{value}</div>
      {trend && <div className="text-xs text-app-faint mt-1">{trend}</div>}
    </div>
  );
}
