// DiagnosisPage.jsx — Main diagnosis flow page
import { useState } from 'react';
import { Stethoscope, Zap, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import SymptomSelector from '../components/diagnosis/SymptomSelector';
import DiagnosisResult from '../components/diagnosis/DiagnosisResult';
import WarningBanner from '../components/diagnosis/WarningBanner';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { appendLocalHistory } from '../utils/localHistory';

const isDemo = import.meta.env.VITE_DEMO === 'true';

// ── States of the diagnosis flow ──
const STATE = { INPUT: 'input', LOADING: 'loading', RESULT: 'result' };

export default function DiagnosisPage() {
  const { t, lang } = useLanguage();

  const [symptoms,  setSymptoms]  = useState([]);
  const [results,   setResults]   = useState(null);
  const [flowState, setFlowState] = useState(STATE.INPUT);
  const [saving,    setSaving]    = useState(false);

  // ── Run AI diagnosis ──
  const handleAnalyze = async () => {
    if (symptoms.length === 0) {
      toast.error(t.symptomsMinOne);
      return;
    }
    setFlowState(STATE.LOADING);
    if (isDemo) {
      const demoResults = getDemoResults(symptoms);
      setResults(demoResults);
      setFlowState(STATE.RESULT);
      return;
    }
    try {
      const { data } = await api.post('/diagnosis/analyze', { symptoms, lang });
      setResults(data.results);
      setFlowState(STATE.RESULT);
    } catch {
      const demoResults = getDemoResults(symptoms);
      setResults(demoResults);
      setFlowState(STATE.RESULT);
    }
  };

  // ── Save result to history ──
  const handleSave = async () => {
    if (!results) return;
    setSaving(true);
    const payload = {
      symptoms,
      results,
      top_diagnosis: results[0]?.name,
    };
    try {
      if (isDemo) {
        appendLocalHistory(payload);
        toast.success('Natija saqlandi!');
        return;
      }
      await api.post('/history', payload);
      toast.success('Natija saqlandi!');
    } catch {
      appendLocalHistory(payload);
      toast.success('Natija saqlandi! (brauzeringizda mahalliy saqlandi)');
    } finally {
      setSaving(false);
    }
  };

  // ── Reset to input ──
  const handleNew = () => {
    setSymptoms([]);
    setResults(null);
    setFlowState(STATE.INPUT);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-brand-soft/80 via-card to-accent-soft/50 dark:from-brand-soft/20 dark:via-card dark:to-accent-soft/20 p-6 shadow-soft">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand/15 blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand to-accent flex items-center justify-center shadow-glow">
            <Stethoscope size={24} className="text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-app tracking-tight">{t.diagnosisTitle}</h2>
            <p className="text-app-muted text-sm mt-0.5">{t.diagnosisSubtitle}</p>
          </div>
        </div>
      </div>

      {/* Warning banner — always visible */}
      <WarningBanner />

      {/* Input phase — loading paytida faqat animatsiya */}
      {flowState === STATE.INPUT && (
        <Card title={t.selectSymptoms} subtitle={t.diagnosisCardHint}>
          <SymptomSelector selected={symptoms} onChange={setSymptoms} />

          <div className="flex gap-3 mt-6 pt-6 border-t border-surface-border">
            <Button
              variant="primary"
              size="lg"
              loading={flowState === STATE.LOADING}
              disabled={symptoms.length === 0}
              onClick={handleAnalyze}
            >
              <Zap size={16} />
              {flowState === STATE.LOADING ? t.analyzing : t.analyzeBtn}
            </Button>

            {symptoms.length > 0 && (
              <Button variant="ghost" size="lg" onClick={() => setSymptoms([])}>
                <Trash2 size={15} />
                {t.clearAll}
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Loading animation */}
      {flowState === STATE.LOADING && (
        <div className="glass-card p-10 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-soft border border-brand/30 mb-5">
            <Stethoscope size={36} className="text-brand animate-pulse" />
          </div>
          <p className="text-app font-semibold text-lg">{t.analyzing}</p>
          <p className="text-app-muted text-sm mt-2">AI {symptoms.length} ta alomatni tahlil qilmoqda...</p>
          <div className="flex justify-center gap-2 mt-6">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="h-1.5 w-8 rounded-full bg-brand animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Results phase */}
      {flowState === STATE.RESULT && results && (
        <>
          <div className="glass-card px-6 py-5">
            <p className="text-xs text-brand uppercase tracking-wider mb-3 font-semibold">
              {t.selectedSymptoms}
            </p>
            <div className="flex flex-wrap gap-2">
              {symptoms.map(s => (
                <span
                  key={s}
                  className="px-3 py-1.5 rounded-xl bg-brand-soft text-brand text-sm border border-brand/30"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <DiagnosisResult
            results={results}
            onSave={handleSave}
            onNew={handleNew}
            saving={saving}
          />
        </>
      )}
    </div>
  );
}

// ── Demo AI results (used when backend is offline) ──
function getDemoResults(symptoms) {
  const lower = symptoms.map(s => s.toLowerCase());

  // Simple rule-based scoring for demo
  const diseases = [
    {
      id: 1,
      name: 'ARVI (Tez-tez shamollash)',
      probability: 0,
      description: 'Yuqori nafas yo\'llarining virusli kasalligi. Ko\'pincha sovuq havoda uchraydi.',
      recommendations: [
        'Ko\'proq suv iching (kuniga 2-3 litr)',
        'Dam oling va issiq bo\'ling',
        'C vitamini qabul qiling',
        'Burun tozalash uchun tuzli suv tomchisi ishlating',
        'Alomatlar 7 kundan ko\'p davom etsa shifokorga boring',
      ],
      keywords: ['yo\'tal', 'burun', 'tomоq', 'isitma', 'cough', 'fever', 'sore throat', 'runny nose'],
    },
    {
      id: 2,
      name: 'Gripp (Influenza)',
      probability: 0,
      description: 'Influenza virusi tomonidan yuzaga kelgan o\'tkir yuqumli kasallik.',
      recommendations: [
        'Shifokorga murojaat qiling',
        'To\'shak rejimini saqlang',
        'Yetarli suyuqlik iching',
        'Dori-darmon faqat shifokor tavsiyasi bilan',
        'Boshqalar bilan aloqani cheklang',
      ],
      keywords: ['isitma', 'bosh og\'riq', 'mushak', 'charchoq', 'fever', 'headache', 'fatigue', 'muscle'],
    },
    {
      id: 3,
      name: 'Migren',
      probability: 0,
      description: 'Kuchli bosh og\'riq bilan kechadigan nevrologik kasallik.',
      recommendations: [
        'Tinch, qorong\'i xonada dam oling',
        'Boshga sovuq kompres qo\'ying',
        'Og\'riq qoldiruvchi dorilar (shifokor bilan maslahatlashing)',
        'Triggerlarni aniqlang va ularga yo\'l qo\'ymang',
        'Muntazam uyqu jadvalini saqlang',
      ],
      keywords: ['bosh og\'riq', 'ko\'z og\'riq', 'bosh aylanishi', 'headache', 'dizziness', 'eye'],
    },
    {
      id: 4,
      name: 'Gastrit',
      probability: 0,
      description: 'Oshqozon shilliq qavatining yallig\'lanishi.',
      recommendations: [
        'Ovqatlanish tartibini yaxshilang',
        'Achchiq va yog\'li ovqatlardan saqlaning',
        'Kichik porsiyalarda tez-tez yeng',
        'Stress darajasini kamaytiring',
        'Gastroenterologga murojaat qiling',
      ],
      keywords: ['qorin og\'riq', 'ko\'ngil', 'qayt', 'ishtaha', 'abdominal', 'nausea', 'vomiting', 'stomach'],
    },
    {
      id: 5,
      name: 'Qon bosimining ko\'tarilishi',
      probability: 0,
      description: 'Arterial qon bosimining doimiy yoki epizodik oshishi.',
      recommendations: [
        'Tuzni kamaytiring',
        'Muntazam jismoniy faoliyat',
        'Vazningizni nazorat qiling',
        'Qon bosimini kundalik o\'lchang',
        'Darhol shifokorga murojaat qiling',
      ],
      keywords: ['bosh og\'riq', 'ko\'z', 'bosh aylanishi', 'headache', 'dizziness', 'chest'],
    },
    {
      id: 6,
      name: 'Oq qon kasalligi (leykoz)',
      probability: 0,
      description:
        'Qon tug\'unlarida oq qon tanachalari normalidan boshqacha bo\'lishi bilan kechadigan kasalliklar guruhi. Aniq tashxis faqat tahlillar bilan.',
      recommendations: [
        'Darhol gematolog / onkologga murojaat qiling',
        'Ko\'krak qoni va umurtqa punksiyasi faqat shifokor ko\'rsatmasi bilan',
        'Antibiotik va og\'ir dorilarni o\'zboshimchalik bilan qabul qilmang',
      ],
      keywords: [
        'charchoq',
        'isitma',
        'zaiflik',
        'ishtahasizlik',
        'terlash',
        'burundan qon',
        'vazn yo\'qotish',
        'oq qon',
        'leykoz',
        'limfa',
        'toshmalar',
        'fatigue',
        'fever',
        'bruising',
        'titroq',
      ],
    },
  ];

  // Score each disease based on keyword overlap
  const scored = diseases.map(d => {
    const matches = d.keywords.filter(kw =>
      lower.some(s => s.includes(kw) || kw.includes(s))
    ).length;
    const base = matches / Math.max(d.keywords.length, 1);
    // Add some randomness for realism
    const prob = Math.min(0.95, base * 0.9 + Math.random() * 0.15);
    return { ...d, probability: Number(prob.toFixed(2)) };
  });

  return scored
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 6)
    .map(({ keywords, ...rest }) => rest);
}