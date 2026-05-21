import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import RegisterForm from '../components/auth/RegisterForm';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import ThemeToggle from '../components/ui/ThemeToggle';

export default function RegisterPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen auth-mesh flex flex-col">
      <div className="flex items-center justify-between p-4 sm:p-6">
        <Link to="/login" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-accent flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-app">{t.appName}</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 pb-12">
        <div className="w-full max-w-md animate-slide-up">
          <div className="glass-card p-8 sm:p-10">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-soft border border-brand/30 mb-4">
                <Sparkles size={24} className="text-brand" />
              </div>
              <h2 className="font-display text-2xl font-bold text-app">{t.registerTitle}</h2>
              <p className="text-app-muted text-sm mt-1">{t.registerSubtitle || "Yangi hisob yarating"}</p>
            </div>
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
}
