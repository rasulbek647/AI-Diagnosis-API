import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import ThemeToggle from '../ui/ThemeToggle';
import Sidebar from './Sidebar';

export default function Navbar({ title }) {
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="h-16 px-4 sm:px-6 flex items-center justify-between navbar-bar sticky top-0 z-30">
        <button
          className="lg:hidden p-2.5 rounded-xl hover:bg-card-hover text-app-muted transition-colors"
          onClick={() => setMobileOpen(true)}
          aria-label="Menu"
        >
          <Menu size={22} />
        </button>

        <h1 className="font-display font-bold text-app text-xl sm:text-2xl tracking-tight hidden lg:block">
          {title}
        </h1>
        <div className="lg:hidden font-display font-semibold text-app">{t.appName}</div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[272px] animate-slide-up shadow-2xl">
            <div className="relative h-full">
              <button
                className="absolute top-4 right-3 z-10 p-2 rounded-lg bg-white/15 text-white hover:bg-white/25"
                onClick={() => setMobileOpen(false)}
              >
                <X size={20} />
              </button>
              <Sidebar mobile onClose={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
