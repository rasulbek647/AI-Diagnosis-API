// LoginPage.jsx — Modern auth layout
import { Sparkles, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import LoginForm from '../components/auth/LoginForm';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

export default function LoginPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen auth-mesh flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent-500/15 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-primary-200 text-primary-800 text-sm font-medium shadow-sm">
            <Shield size={16} />
            AI-powered diagnosis
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-4xl xl:text-5xl font-bold text-slate-900 leading-tight">
            {t.appName}
          </h1>
          <p className="text-slate-600 text-lg mt-4 leading-relaxed">{t.appTagline}</p>
          <ul className="mt-8 space-y-3 text-slate-600 text-sm">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
              Tez va qulay alomat tanlash
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
              3 tilda interfeys
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
              Xavfsiz hisob — uzoq muddatli kirish
            </li>
          </ul>
        </div>

        <p className="relative z-10 text-xs text-slate-500">© {new Date().getFullYear()} MedAI</p>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-end p-4 sm:p-6">
          <LanguageSwitcher />
        </div>

        <div className="flex-1 flex items-center justify-center px-4 pb-10">
          <div className="w-full max-w-md animate-slide-up">
            <div className="lg:hidden flex flex-col items-center text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow mb-3">
                <Sparkles size={26} className="text-white" />
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-900">{t.appName}</h2>
            </div>

            <div className="glass-card p-8 sm:p-10 border-primary-100/80">
              <div className="mb-8 text-center lg:text-left">
                <h2 className="font-display text-2xl font-bold text-slate-900">{t.loginTitle}</h2>
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
