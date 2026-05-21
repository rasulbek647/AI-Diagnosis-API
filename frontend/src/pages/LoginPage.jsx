import { Sparkles, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import LoginForm from '../components/auth/LoginForm';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import ThemeToggle from '../components/ui/ThemeToggle';

export default function LoginPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen auth-mesh flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl animate-float opacity-60 bg-brand/20" />
        <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full blur-3xl opacity-50 bg-accent/20" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-brand text-sm font-semibold">
            <Shield size={16} />
            AI-powered diagnosis
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-4xl xl:text-5xl font-bold text-app leading-tight">{t.appName}</h1>
          <p className="text-app-muted text-lg mt-4 leading-relaxed">{t.appTagline}</p>
          <ul className="mt-8 space-y-3 text-app-muted text-sm">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand" />
              {t.loginFeature1}
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              {t.loginFeature2}
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-glow" />
              {t.loginFeature4}
            </li>
          </ul>
        </div>

        <p className="relative z-10 text-xs text-app-faint">© {new Date().getFullYear()} MedAI</p>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-end gap-2 p-4 sm:p-6">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>

        <div className="flex-1 flex items-center justify-center px-4 pb-10">
          <div className="w-full max-w-md animate-slide-up">
            <div className="lg:hidden flex flex-col items-center text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand to-accent flex items-center justify-center shadow-glow mb-3">
                <Sparkles size={26} className="text-white" />
              </div>
              <h2 className="font-display text-2xl font-bold text-app">{t.appName}</h2>
            </div>

            <div className="glass-card p-8 sm:p-10">
              <div className="mb-8 text-center lg:text-left">
                <h2 className="font-display text-2xl font-bold text-app">{t.loginTitle}</h2>
                <p className="text-app-muted mt-1 text-sm">{t.loginWelcomeSubtitle}</p>
              </div>
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
