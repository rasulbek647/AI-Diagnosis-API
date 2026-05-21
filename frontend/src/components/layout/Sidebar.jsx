// Sidebar.jsx — Dashboard navigation sidebar
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Stethoscope, History, ShieldCheck, LogOut, Sparkles } from 'lucide-react';
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
    <aside
      className={clsx(
        'flex flex-col h-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white shadow-sidebar',
        !mobile && 'w-[272px]'
      )}
    >
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-glow">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-lg leading-tight">{t.appName}</div>
            <div className="text-xs text-slate-400 mt-0.5">{t.appTagline}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) => clsx('sidebar-link', isActive && 'active')}
          >
            <Icon size={18} />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-4 pb-5 border-t border-white/10 pt-4">
        <NavLink
          to="/profile"
          onClick={onClose}
          className="block rounded-xl bg-white/5 hover:bg-white/10 px-4 py-3 mb-3 transition-colors border border-white/10"
        >
          <div className="text-sm font-semibold text-white truncate">{user?.full_name}</div>
          <div className="text-xs text-slate-400 truncate">{maskEmail(user?.email)}</div>
          <div className="text-[10px] text-primary-300/90 mt-1">{t.profileSidebarHint}</div>
          {isAdmin && (
            <span className="mt-2 inline-block px-2 py-0.5 rounded-lg bg-accent-500/20 text-indigo-200 text-xs font-semibold">
              {t.roleAdmin}
            </span>
          )}
        </NavLink>

        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-300 hover:text-red-200 hover:bg-red-500/10"
        >
          <LogOut size={18} />
          <span>{t.logout}</span>
        </button>
      </div>
    </aside>
  );
}
