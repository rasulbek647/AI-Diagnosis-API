import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function WarningBanner() {
  const { t } = useLanguage();

  return (
    <div className="flex gap-3 p-4 rounded-2xl warn-banner animate-fade-in">
      <AlertTriangle size={20} className="flex-shrink-0 mt-0.5 opacity-90" />
      <p className="text-sm leading-relaxed">
        <span className="font-semibold">{t.warningTitle}</span> {t.warningText}
      </p>
    </div>
  );
}
