// WarningBanner.jsx — Medical disclaimer
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function WarningBanner() {
  const { t } = useLanguage();

  return (
    <div className="flex gap-3 p-4 rounded-2xl border border-amber-200 bg-amber-50 animate-fade-in">
      <div className="flex-shrink-0 mt-0.5">
        <AlertTriangle size={20} className="text-amber-600" />
      </div>
      <p className="text-sm leading-relaxed text-amber-900/90">
        <span className="font-semibold text-amber-800">{t.warningTitle}</span>{' '}
        {t.warningText}
      </p>
    </div>
  );
}
