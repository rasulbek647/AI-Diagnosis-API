// LanguageSwitcher.jsx
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
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-surface-border shadow-sm
                   hover:border-primary-300 hover:shadow-md transition-all text-slate-700"
      >
        <Globe size={16} className="text-primary-600" />
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
                ${lang === l.code ? 'text-primary-700 bg-primary-50' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <span>{l.flag}</span>
              <span className="font-medium">{l.label}</span>
              {lang === l.code && <span className="ml-auto text-primary-600">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
