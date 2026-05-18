import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { maskEmail, formatDate } from '../utils/helpers';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { formatApiError } from '../utils/helpers';

const isDemo = import.meta.env.VITE_DEMO === 'true';

function PasswordInput({ value, onChange, autoComplete, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full px-3 py-2 pr-10 bg-surface border border-surface-border rounded text-slate-200"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const dateLocale = lang === 'en' ? 'en-US' : lang === 'ru' ? 'ru-RU' : 'uz-UZ';

  useEffect(() => {
    if (!user) return;
    setFullName(user.full_name || '');
    setEmail(user.email || '');
  }, [user]);

  const needsPassword =
    (email.trim().toLowerCase() !== (user?.email || '').toLowerCase()) || newPassword.trim().length > 0;

  const save = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!fullName.trim()) {
      toast.error(t.profileNameRequired);
      return;
    }
    if (needsPassword && !currentPassword) {
      toast.error(t.profileNeedCurrentPassword);
      return;
    }
    if (newPassword.trim() && newPassword.trim().length < 6) {
      toast.error(t.profilePasswordTooShort);
      return;
    }
    if (
      newPassword.trim() &&
      currentPassword.trim() &&
      newPassword.trim() === currentPassword.trim()
    ) {
      toast.error(t.profileCurrentMustBeOldPassword);
      return;
    }

    const payload = { full_name: fullName.trim() };
    if (email.trim().toLowerCase() !== user.email.toLowerCase()) {
      payload.email = email.trim().toLowerCase();
    }
    if (newPassword.trim()) {
      payload.new_password = newPassword.trim();
    }
    if (payload.email || payload.new_password) {
      payload.current_password = currentPassword;
    }

    setSaving(true);
    try {
      if (isDemo) {
        setUser((prev) => ({
          ...prev,
          full_name: payload.full_name,
          ...(payload.email ? { email: payload.email } : {}),
        }));
        setCurrentPassword('');
        setNewPassword('');
        toast.success(t.profileSaveSuccess);
      } else {
        const { data } = await api.patch('/auth/me', payload);
        setUser(data);
        setEmail(data.email);
        setFullName(data.full_name);
        setCurrentPassword('');
        setNewPassword('');
        toast.success(t.profileSaveSuccess);
      }
    } catch (err) {
      toast.error(formatApiError(err, t));
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <UserCircle className="text-primary-400 shrink-0" size={28} />
        <div>
          <h2 className="text-xl font-bold text-slate-100">{t.profileTitle}</h2>
          <p className="text-sm text-slate-500">{t.profileSubtitle}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left glass-card px-4 py-4 rounded-xl border border-surface-border hover:border-primary-500/40 transition-colors flex items-center justify-between gap-3"
      >
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-200 truncate">{user.full_name}</div>
          <div className="text-xs text-slate-500 truncate">{maskEmail(user.email)}</div>
          <div className="text-[11px] text-primary-400/90 mt-1.5">{t.profileClickToExpand}</div>
        </div>
        {open ? <ChevronUp className="text-slate-400 shrink-0" size={22} /> : <ChevronDown className="text-slate-400 shrink-0" size={22} />}
      </button>

      {open && (
        <form onSubmit={save} className="glass-card p-5 space-y-4 rounded-xl border border-surface-border">
          <div className="space-y-1 text-sm border-b border-surface-border pb-3">
            <div className="flex justify-between gap-2">
              <span className="text-slate-500">{t.fullName}</span>
              <span className="text-slate-200 text-right">{user.full_name}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-500">{t.email}</span>
              <span className="text-slate-200 text-right break-all">{user.email}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-500">{t.role}</span>
              <span className="text-slate-200">{user.role === 'admin' ? t.roleAdmin : t.profileRoleUser}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-500">{t.profileMemberSince}</span>
              <span className="text-slate-200">{formatDate(user.created_at, dateLocale)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">{t.fullName}</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded text-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">{t.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded text-slate-200"
            />
            <p className="text-[11px] text-slate-500 mt-1">{t.profileEmailChangeHint}</p>
          </div>
          {needsPassword && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">{t.profileCurrentPasswordLabel}</label>
              <PasswordInput
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                placeholder=""
              />
              <p className="text-[11px] text-amber-400/90 mt-1.5">{t.profileCurrentPasswordHint}</p>
            </div>
          )}
          <div>
            <label className="block text-xs text-slate-500 mb-1">{t.profileNewPasswordOptional}</label>
            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              placeholder=""
            />
            <p className="text-[11px] text-slate-500 mt-1">{t.profileLeavePasswordEmpty}</p>
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? t.loading : t.save}
          </Button>
        </form>
      )}
    </div>
  );
}
