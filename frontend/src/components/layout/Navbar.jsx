// Navbar.jsx — Top navigation bar
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import Sidebar from './Sidebar';

export default function Navbar({ title }) {
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-surface-border bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <button
          className="lg:hidden p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          onClick={() => setMobileOpen(true)}
          aria-label="Menu"
        >
          <Menu size={22} />
        </button>

        <h1 className="font-display font-bold text-slate-900 text-xl sm:text-2xl tracking-tight hidden lg:block">
          {title}
        </h1>
        <div className="lg:hidden font-display font-semibold text-slate-800">{t.appName}</div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[272px] animate-slide-up shadow-2xl">
            <div className="relative h-full">
              <button
                className="absolute top-4 right-3 z-10 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
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
