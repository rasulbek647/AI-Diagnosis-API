// LoginPage.jsx — Centered single-card login
import { Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import LoginForm from '../components/auth/LoginForm';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

export default function LoginPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-950 via-surface to-surface relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1)_0%,transparent_65%)] pointer-events-none" />

      <div className="relative z-10 flex justify-end p-4 sm:p-6">
        <LanguageSwitcher />
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-10 sm:pb-12">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 sm:p-10 shadow-xl shadow-black/20 border border-surface-border">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-600/35 mb-4">
                <Activity size={30} className="text-white" strokeWidth={2.25} />
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-slate-100">
                {t.appName}
              </h1>
              <p className="text-slate-500 text-sm mt-1">{t.appTagline}</p>
            </div>

            <div className="mb-6 text-center">
              <h2 className="font-display text-xl font-semibold text-slate-100">{t.loginTitle}</h2>
              <p className="text-slate-500 mt-1 text-sm">{t.loginWelcomeSubtitle}</p>
            </div>

            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
