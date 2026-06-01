import { Sparkles, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import LoginForm from '../components/auth/LoginForm';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import ThemeToggle from '../components/ui/ThemeToggle';

export default function LoginPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen auth-mesh flex flex-col">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl animate-float opacity-60 bg-brand/20 pointer-events-none" />
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-50 bg-accent/20 pointer-events-none" />

      <div className="flex justify-end gap-2 p-4 sm:p-6 relative z-10">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-10 relative z-10">
        <div className="w-full max-w-md animate-slide-up">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-brand text-sm font-semibold mb-6">
              <Shield size={16} />
              AI-powered diagnosis
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand to-accent flex items-center justify-center shadow-glow mb-3">
              <Sparkles size={26} className="text-white" />
            </div>
            <h1 className="font-display text-4xl font-bold text-app leading-tight">{t.appName}</h1>
            <p className="text-app-muted text-lg mt-2 leading-relaxed">{t.appTagline}</p>
            <ul className="mt-6 space-y-3 text-app-muted text-sm inline-flex flex-col items-start text-left mx-auto">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand shrink-0" />
                {t.loginFeature1}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                {t.loginFeature2}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-glow shrink-0" />
                {t.loginFeature4}
              </li>
            </ul>
          </div>

          <div className="glass-card p-8 sm:p-10">
            <div className="mb-8 text-center">
              <h2 className="font-display text-2xl font-bold text-app">{t.loginTitle}</h2>
              <p className="text-app-muted mt-1 text-sm">{t.loginWelcomeSubtitle}</p>
            </div>
            <LoginForm />
          </div>

          <p className="text-center text-xs text-app-faint mt-6">
            © {new Date().getFullYear()} MedAI
          </p>
        </div>
      </div>
    </div>
  );
}
