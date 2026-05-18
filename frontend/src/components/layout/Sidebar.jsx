// Sidebar.jsx — Dashboard navigation sidebar
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Stethoscope, History, ShieldCheck, LogOut, HeartPulse } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { maskEmail } from '../../utils/helpers';
import clsx from 'clsx';

export default function Sidebar({ mobile = false, onClose }) {
  const { user, logout, isAdmin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = isAdmin
    ? [
        { to: '/dashboard', icon: LayoutDashboard, label: t.dashboard },
        { to: '/history', icon: History, label: t.adminUserHistoryNav },
        { to: '/admin', icon: ShieldCheck, label: t.admin },
      ]
    : [{ to: '/diagnosis', icon: Stethoscope, label: t.diagnosis }];

  return (
    <aside className={clsx(
      'flex flex-col h-full bg-surface-card border-r border-surface-border',
      !mobile && 'w-[260px]',
    )}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-surface-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-600/30">
            <HeartPulse size={18} className="text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-slate-100 text-lg leading-none">{t.appName}</div>
            <div className="text-xs text-slate-500 mt-0.5">{t.appTagline}</div>
          </div>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              clsx('sidebar-link', isActive && 'active')
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="px-3 pb-4 border-t border-surface-border pt-4">
        <NavLink
          to="/profile"
          onClick={onClose}
          className="block glass-card px-4 py-3 mb-3 rounded-xl hover:bg-white/[0.03] transition-colors border border-transparent hover:border-surface-border"
        >
          <div className="text-sm font-semibold text-slate-200 truncate">{user?.full_name}</div>
          <div className="text-xs text-slate-500 truncate">{maskEmail(user?.email)}</div>
          <div className="text-[10px] text-primary-400/80 mt-1">{t.profileSidebarHint}</div>
          {isAdmin && (
            <span className="mt-1.5 inline-block px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
              {t.roleAdmin}
            </span>
          )}
        </NavLink>

        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-400/5"
        >
          <LogOut size={18} />
          <span>{t.logout}</span>
        </button>
      </div>
    </aside>
  );
}