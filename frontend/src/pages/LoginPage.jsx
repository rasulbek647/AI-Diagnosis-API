// LoginPage.jsx — Full-screen login page
import { Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import LoginForm from '../components/auth/LoginForm';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

export default function LoginPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex">
      {/* Left — decorative panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-950 via-surface to-surface-card items-center justify-center p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.12)_0%,transparent_70%)]" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-2xl shadow-primary-600/40 mb-8">
            <Activity size={36} className="text-white" strokeWidth={2.25} />
          </div>

          <h1 className="font-display text-5xl font-bold tracking-tight text-white mb-3">
            {t.appName}
          </h1>
          <p className="text-lg font-light tracking-wide text-white/70">
            {t.appTagline}
          </p>
        </div>
      </div>

      {/* Right — login form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Activity size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-slate-100">{t.appName}</span>
          </div>
          <div className="ml-auto">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Form card */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="glass-card p-8">
              <div className="mb-8">
                <h2 className="font-display text-2xl font-bold text-slate-100">{t.loginTitle}</h2>
                <p className="text-slate-500 mt-1 text-sm">{t.loginWelcomeSubtitle}</p>
              </div>
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}