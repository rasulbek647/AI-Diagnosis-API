import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const LANGS = [
  { code: 'uz', label: "O'zbekcha", flag: '🇺🇿' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

export default function LanguageSwitcher() {
  const { lang, changeLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = LANGS.find((l) => l.code === lang) || LANGS[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card/80 border border-line shadow-sm
                   hover:border-brand/40 hover:shadow-md transition-all text-app"
      >
        <Globe size={16} className="text-brand" />
        <span className="text-sm font-medium">{current.flag} {current.code.toUpperCase()}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 glass-card shadow-lg z-50 animate-fade-in py-1">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                changeLanguage(l.code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                ${lang === l.code ? 'text-brand bg-brand-soft' : 'text-app-muted hover:bg-card-hover'}`}
            >
              <span>{l.flag}</span>
              <span className="font-medium">{l.label}</span>
              {lang === l.code && <span className="ml-auto text-brand">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
