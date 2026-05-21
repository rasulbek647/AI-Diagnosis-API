import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Stethoscope, Save } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import Badge, { severityVariant } from '../ui/Badge';
import Button from '../ui/Button';
import clsx from 'clsx';

function getSeverity(prob) {
  if (prob >= 0.65) return 'high';
  if (prob >= 0.35) return 'medium';
  return 'low';
}

const BAR_COLORS = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
};

const CARD_CLASS = {
  high: 'disease-card-high',
  medium: 'disease-card-medium',
  low: 'disease-card-low',
};

function DiseaseCard({ disease, index, t }) {
  const [expanded, setExpanded] = useState(index === 0);
  const severity = getSeverity(disease.probability);
  const pct = Math.round(disease.probability * 100);

  return (
    <div
      className={clsx(
        'rounded-2xl border backdrop-blur-sm transition-all duration-200 shadow-card',
        CARD_CLASS[severity],
        'animate-fade-in'
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
      >
        <div
          className={clsx(
            'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0',
            index === 0 ? 'bg-brand-soft text-brand' : 'bg-card-hover text-app-faint'
          )}
        >
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-app truncate">{disease.name}</span>
            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
              <Badge variant={severityVariant(severity)}>{t[severity]}</Badge>
              <span
                className={clsx(
                  'font-mono font-bold text-lg',
                  severity === 'high' && 'text-red-500',
                  severity === 'medium' && 'text-amber-500',
                  severity === 'low' && 'text-emerald-500'
                )}
              >
                {pct}%
              </span>
            </div>
          </div>

          <div className="w-full bg-card-hover rounded-full h-2.5 overflow-hidden">
            <div
              className={clsx('h-full rounded-full shadow-sm', BAR_COLORS[severity])}
              style={{
                width: `${pct}%`,
                transition: `width 1s cubic-bezier(0.16, 1, 0.3, 1) ${index * 150}ms`,
              }}
            />
          </div>
        </div>

        <div className="flex-shrink-0 text-app-faint ml-2">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-4 border-t border-line pt-4 space-y-4 animate-fade-in">
          {disease.description && (
            <div className="flex gap-2 text-app-muted text-sm">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <p>{disease.description}</p>
            </div>
          )}

          {disease.recommendations?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-app-faint uppercase tracking-wider mb-2">
                {t.recommendations}
              </p>
              <ul className="space-y-1.5">
                {disease.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-2 text-sm text-app-muted">
                    <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5 text-emerald-500" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {severity === 'high' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-300 text-sm">
              <Stethoscope size={15} />
              <span className="font-medium">{t.consultDoctor}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DiagnosisResult({ results, onSave, onNew, saving }) {
  const { t } = useLanguage();
  if (!results || results.length === 0) return null;

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display font-bold text-app text-xl tracking-tight">{t.results}</h3>
        <span className="text-xs font-medium text-brand bg-brand-soft px-3 py-1.5 rounded-full border border-brand/30">
          {t.diagnosisAiDisclaimer}
        </span>
      </div>

      <div className="space-y-3">
        {results.map((disease, i) => (
          <DiseaseCard key={disease.id || i} disease={disease} index={i} t={t} />
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="primary" onClick={onSave} loading={saving}>
          <Save size={15} />
          {t.saveResult}
        </Button>
        <Button variant="secondary" onClick={onNew}>
          {t.newDiagnosis}
        </Button>
      </div>
    </div>
  );
}
