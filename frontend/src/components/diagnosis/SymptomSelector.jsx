// SymptomSelector.jsx — Text input + selectable symptom pills by category
import { useEffect, useMemo, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/axios';
import clsx from 'clsx';

// ── Full symptom library, keyed by category ──
const SYMPTOMS_DB = {
  general: [
    'isitma',        'charchoq',       'zaiflik',        'ishtahasizlik',
    'terlash',       'titroq',         'vazn yo\'qotish', 'qizish',
    'oq qon',        'leykoz',         'limfa bezlari',   'burundan qon',
    'fever',         'fatigue',        'weakness',       'chills',
  ],
  head: [
    'bosh og\'riq',  'bosh aylanishi',  'ko\'z og\'riq',   'quloq og\'riq',
    'burun bitishi', 'burundan qon',    'tish og\'riq',    'bo\'yin og\'riq',
    'headache',      'dizziness',       'earache',         'nosebleed',
  ],
  respiratory: [
    'yo\'tal',       'nafas qisishi',   'ko\'krak og\'rig\'i', 'xirildash',
    'tomоq og\'riq', 'burun oqishi',    'qichqiriq',
    'cough',         'shortness of breath', 'chest pain',  'wheezing',
    'sore throat',   'runny nose',      'sneezing',
  ],
  digestive: [
    'qorin og\'riq',  'ko\'ngil aynish', 'qayt qilish',   'diareya',
    'qabziyat',       'meteorizm',       'o\'t qusish',   'ishtaha yo\'qligi',
    'abdominal pain', 'nausea',          'vomiting',      'diarrhea',
    'constipation',   'bloating',        'heartburn',
  ],
  musculoskeletal: [
    'bo\'g\'im og\'riq', 'mushak og\'rig\'i', 'orqa og\'riq',  'bo\'yin og\'riq',
    'oyoq og\'riq',      'qo\'l og\'riq',     'shish',         'qotib qolish',
    'joint pain',        'muscle pain',       'back pain',     'swelling',
    'stiffness',
  ],
  skin: [
    'toshmalar',     'qichishish',     'ko\'karishlar',  'yara',
    'teri quruqligi','ko\'pchish',     'teri sariqlik',
    'rash',          'itching',        'bruising',       'wound',
    'dry skin',      'swelling',       'jaundice',
  ],
  neurological: [
    'uyqu buzilishi', 'xotira yo\'qolishi', 'epilepsia',    'uyushish',
    'titroq',         'muvozanat yo\'qolishi',
    'insomnia',       'memory loss',        'numbness',     'tremor',
    'balance problems', 'confusion',
  ],
};

function normSym(s) {
  return String(s || '').toLowerCase().trim();
}

export default function SymptomSelector({ selected, onChange }) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('general');
  const [remoteDb, setRemoteDb] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/diagnosis/symptoms');
        if (data?.by_category && typeof data.by_category === 'object') {
          const merged = {};
          Object.keys(SYMPTOMS_DB).forEach((key) => {
            merged[key] = [...(data.by_category[key] || [])];
          });
          setRemoteDb(merged);
        }
      } catch {
        setRemoteDb(null);
      }
    };
    load();
  }, []);

  const mergedDb = useMemo(() => remoteDb || SYMPTOMS_DB, [remoteDb]);

  const hasSymptom = (sym) => selected.some((s) => normSym(s) === normSym(sym));


  // Add symptom from text input
  const handleTextAdd = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const sym = searchQuery.trim().toLowerCase();
      if (!selected.some((s) => normSym(s) === sym)) {
        onChange([...selected, sym]);
      }
      setSearchQuery('');
    }
  };

  // Toggle symptom pill
  const toggleSymptom = (sym) => {
    const n = normSym(sym);
    const idx = selected.findIndex((s) => normSym(s) === n);
    if (idx >= 0) {
      onChange(selected.filter((_, i) => i !== idx));
    } else {
      onChange([...selected, sym.trim()]);
    }
  };

  // Remove from selected
  const removeSymptom = (sym) => onChange(selected.filter(s => s !== sym));

  // Filter symptoms by search query
  const visibleSymptoms = useMemo(() => {
    const base = mergedDb[activeCategory] || [];
    if (!searchQuery) return base;
    return Object.values(mergedDb)
      .flat()
      .filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [activeCategory, searchQuery, mergedDb]);

  const categories = Object.keys(mergedDb);

  return (
    <div className="space-y-5">
      {/* Text search / add */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={handleTextAdd}
          placeholder={t.symptomsPlaceholder}
          className="input-field pr-12"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <p className="text-xs text-slate-500 -mt-3 ml-1">{t.enterToAddSymptom}</p>

      {/* Category tabs — hide when searching */}
      {!searchQuery && (
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border',
                activeCategory === cat
                  ? 'bg-primary-600/20 border-primary-500/50 text-primary-300'
                  : 'bg-surface border-surface-border text-slate-500 hover:text-slate-300 hover:border-slate-600'
              )}
            >
              {t.symptomCategories?.[cat] || cat}
            </button>
          ))}
        </div>
      )}

      {/* Symptom pills grid */}
      <div className="flex flex-wrap gap-2 min-h-[80px] max-h-[220px] overflow-y-auto pr-1">
        {visibleSymptoms.map(sym => (
          <button
            key={sym}
            onClick={() => toggleSymptom(sym)}
            className={clsx(
              'symptom-pill !px-3 !py-1.5 !text-[13px] !font-medium whitespace-nowrap',
              hasSymptom(sym) && 'selected'
            )}
          >
            {hasSymptom(sym) && <span className="mr-1 text-primary-400">✓</span>}
            {sym}
          </button>
        ))}
        {visibleSymptoms.length === 0 && (
          <div className="flex items-center gap-2 text-slate-500 text-sm py-6">
            <Plus size={16} />
            <span>{t.enterToAddSymptom}</span>
          </div>
        )}
      </div>

      {/* Selected symptoms chips */}
      {selected.length > 0 && (
        <div className="border-t border-surface-border pt-4">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">
            {t.selectedSymptoms} ({selected.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selected.map(sym => (
              <span
                key={sym}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600/20
                           border border-primary-500/40 text-primary-300 text-sm font-medium"
              >
                {sym}
                <button
                  onClick={() => removeSymptom(sym)}
                  className="hover:text-red-400 transition-colors ml-1"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}