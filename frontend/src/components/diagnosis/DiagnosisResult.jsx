// DiagnosisResult.jsx — AI result display with probability bars + recommendations
import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Stethoscope, Save } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import Badge, { severityVariant } from '../ui/Badge';
import Button from '../ui/Button';
import clsx from 'clsx';

// Map probability to severity
function getSeverity(prob) {
  if (prob >= 0.65) return 'high';
  if (prob >= 0.35) return 'medium';
  return 'low';
}

// Map severity to color for the probability bar
const BAR_COLORS = {
  high:   'bg-red-500',
  medium: 'bg-amber-500',
  low:    'bg-emerald-500',
};

function DiseaseCard({ disease, index, t }) {
  const [expanded, setExpanded] = useState(index === 0); // first one open by default
  const severity = getSeverity(disease.probability);
  const pct = Math.round(disease.probability * 100);

  return (
    <div
      className={clsx(
        'rounded-2xl border backdrop-blur-sm transition-all duration-200 shadow-lg',
        severity === 'high' &&
          'border-red-400/35 bg-gradient-to-br from-red-950/40 to-slate-900/60 shadow-red-950/20',
        severity === 'medium' &&
          'border-amber-400/30 bg-gradient-to-br from-amber-950/25 to-slate-900/60 shadow-amber-950/15',
        severity === 'low' &&
          'border-emerald-500/25 bg-gradient-to-br from-emerald-950/20 to-slate-900/60 shadow-emerald-950/10',
        'animate-fade-in'
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
      >
        {/* Rank */}
        <div className={clsx(
          'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0',
          index === 0 ? 'bg-primary-600/30 text-primary-300' : 'bg-slate-700 text-slate-400'
        )}>
          {index + 1}
        </div>

        {/* Name + bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-slate-100 truncate">{disease.name}</span>
            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
              <Badge variant={severityVariant(severity)}>
                {t[severity]}
              </Badge>
              <span className={clsx(
                'font-mono font-bold text-lg',
                severity === 'high'   && 'text-red-400',
                severity === 'medium' && 'text-amber-400',
                severity === 'low'    && 'text-emerald-400',
              )}>
                {pct}%
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-800/90 rounded-full h-2.5 overflow-hidden ring-1 ring-white/5">
            <div
              className={clsx('prob-bar h-full rounded-full shadow-sm', BAR_COLORS[severity])}
              style={{
                width: `${pct}%`,
                transition: `width 1s cubic-bezier(0.16, 1, 0.3, 1) ${index * 150}ms`,
              }}
            />
          </div>
        </div>

        {/* Expand toggle */}
        <div className="flex-shrink-0 text-slate-500 ml-2">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded: description + recommendations */}
      {expanded && (
        <div className="px-5 pb-4 border-t border-white/5 pt-4 space-y-4 animate-fade-in">
          {/* Description */}
          {disease.description && (
            <div className="flex gap-2 text-slate-400 text-sm">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-slate-500" />
              <p>{disease.description}</p>
            </div>
          )}

          {/* Recommendations */}
          {disease.recommendations?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {t.recommendations}
              </p>
              <ul className="space-y-1.5">
                {disease.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-300">
                    <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5 text-emerald-500" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Consult doctor */}
          {severity === 'high' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
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
        <h3 className="font-display font-bold text-slate-50 text-xl tracking-tight">{t.results}</h3>
        <span className="text-xs font-medium text-primary-300/90 bg-primary-950/50 px-3 py-1.5 rounded-full border border-primary-500/25">
          {t.diagnosisAiDisclaimer}
        </span>
      </div>

      {/* Disease cards */}
      <div className="space-y-3">
        {results.map((disease, i) => (
          <DiseaseCard key={disease.id || i} disease={disease} index={i} t={t} />
        ))}
      </div>

      {/* Action buttons */}
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