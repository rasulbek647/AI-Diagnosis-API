import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import clsx from 'clsx';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? t.themeLight : t.themeDark}
      title={isDark ? t.themeLight : t.themeDark}
      className={clsx(
        'relative flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300',
        'bg-card/80 border-app hover:shadow-md hover:border-brand/40',
        'text-app',
        className
      )}
    >
      <span
        className={clsx(
          'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300',
          isDark
            ? 'bg-gradient-to-br from-indigo-500/30 to-teal-500/20 text-amber-300'
            : 'bg-gradient-to-br from-amber-100 to-orange-50 text-amber-600'
        )}
      >
        {isDark ? <Moon size={18} /> : <Sun size={18} />}
      </span>
      <span className="hidden sm:inline text-sm font-semibold">
        {isDark ? t.themeLight : t.themeDark}
      </span>
    </button>
  );
}
