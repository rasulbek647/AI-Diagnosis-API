import { useEffect, useState } from 'react';
import { ShieldCheck, Users, Activity, BookPlus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { StatCard } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import PasswordInput from '../components/ui/PasswordInput';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { formatApiError, formatDate, maskEmail } from '../utils/helpers';

const CATEGORY_KEYS = ['general', 'head', 'respiratory', 'digestive', 'musculoskeletal', 'skin', 'neurological'];

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [tab, setTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [userEdits, setUserEdits] = useState({});
  const [savingUserId, setSavingUserId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    treatment: '',
    keywords: '',
    category: 'general',
    nameEn: '',
    descriptionEn: '',
    treatmentEn: '',
    nameRu: '',
    descriptionRu: '',
    treatmentRu: '',
  });

  const dateLocale = lang === 'en' ? 'en-US' : lang === 'ru' ? 'ru-RU' : 'uz-UZ';

  useEffect(() => {
    if (!isAdmin) navigate('/dashboard');
  }, [isAdmin, navigate]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [u, s, d, k] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/stats'),
          api.get('/admin/diagnoses?limit=50'),
          api.get('/admin/diseases'),
        ]);
        setUsers(u.data || []);
        setStats(s.data || {});
        setDiagnoses(d.data?.items || []);
        setDiseases(k.data || []);
      } catch {
        toast.error(t.adminLoadError);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bir marta yuklash
  }, []);

  const buildTranslations = () => {
    const en = {};
    const ru = {};
    if (form.nameEn.trim()) en.name = form.nameEn.trim();
    if (form.descriptionEn.trim()) en.description = form.descriptionEn.trim();
    if (form.treatmentEn.trim()) en.treatment = form.treatmentEn.trim();
    if (form.nameRu.trim()) ru.name = form.nameRu.trim();
    if (form.descriptionRu.trim()) ru.description = form.descriptionRu.trim();
    if (form.treatmentRu.trim()) ru.treatment = form.treatmentRu.trim();
    const out = {};
    if (Object.keys(en).length) out.en = en;
    if (Object.keys(ru).length) out.ru = ru;
    return out;
  };

  const addDisease = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.treatment.trim()) {
      toast.error(t.adminValidationDisease);
      return;
    }
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        treatment: form.treatment.trim(),
        keywords: form.keywords.split(',').map((x) => x.trim()).filter(Boolean),
        category: CATEGORY_KEYS.includes(form.category) ? form.category : 'general',
        translations: buildTranslations(),
        is_active: true,
      };
      const { data } = await api.post('/admin/diseases', payload);
      setDiseases((prev) => [data, ...prev]);
      setForm({
        name: '',
        description: '',
        treatment: '',
        keywords: '',
        category: 'general',
        nameEn: '',
        descriptionEn: '',
        treatmentEn: '',
        nameRu: '',
        descriptionRu: '',
        treatmentRu: '',
      });
      toast.success(t.adminAddSuccess);
    } catch {
      toast.error(t.adminSaveError);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm(t.adminConfirmDeleteUser)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((x) => x.id !== id));
      setExpandedUserId(null);
      setUserEdits((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err) {
      toast.error(formatApiError(err, t) || t.adminUserDeletedError);
    }
  };

  const toggleUserPanel = (u) => {
    if (expandedUserId === u.id) {
      setExpandedUserId(null);
      return;
    }
    setExpandedUserId(u.id);
    setUserEdits((prev) => ({
      ...prev,
      [u.id]: {
        full_name: u.full_name,
        email: u.email,
        role: u.role,
        is_active: u.is_active,
        new_password: '',
      },
    }));
  };

  const patchUserEdit = (id, field, value) => {
    setUserEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const saveUser = async (id) => {
    const edit = userEdits[id];
    if (!edit?.full_name?.trim()) {
      toast.error(t.profileNameRequired);
      return;
    }
    if (edit.new_password?.trim() && edit.new_password.trim().length < 6) {
      toast.error(t.profilePasswordTooShort);
      return;
    }

    const payload = {
      full_name: edit.full_name.trim(),
      email: edit.email.trim().toLowerCase(),
      role: edit.role,
      is_active: edit.is_active,
    };
    if (edit.new_password?.trim()) {
      payload.new_password = edit.new_password.trim();
    }

    setSavingUserId(id);
    try {
      try {
        await api.patch(`/admin/users/${id}`, payload);
      } catch (err) {
        if (err.response?.status === 405) {
          await api.patch(`/admin/users/${id}/role`, payload);
        } else {
          throw err;
        }
      }

      const { data: usersList } = await api.get('/admin/users');
      const list = usersList || [];
      setUsers(list);

      const updated = list.find((u) => u.id === id);
      if (updated) {
        setUserEdits((prev) => ({
          ...prev,
          [id]: {
            full_name: updated.full_name,
            email: updated.email,
            role: updated.role,
            is_active: updated.is_active,
            new_password: '',
          },
        }));
      }

      toast.success(t.adminUserSaveSuccess);
    } catch (err) {
      toast.error(formatApiError(err, t) || t.adminUserSaveError);
    } finally {
      setSavingUserId(null);
    }
  };

  if (loading) return <div className="text-slate-300">{t.loading}</div>;

  const activeCount = stats.active_users ?? stats.active_today ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="text-purple-400" />
        <h2 className="text-xl font-bold text-slate-900">{t.adminTitle}</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t.statCardUsers} value={stats.total_users || 0} icon={Users} color="blue" />
        <StatCard label={t.statCardDiagnoses} value={stats.total_diagnoses || 0} icon={Activity} color="green" />
        <StatCard label={t.statCardKnowledge} value={diseases.length} icon={BookPlus} color="purple" />
        <StatCard label={t.statCardActiveUsers} value={activeCount} icon={ShieldCheck} color="amber" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setTab('users')} variant={tab === 'users' ? 'primary' : 'secondary'}>
          {t.adminTabUsers}
        </Button>
        <Button onClick={() => setTab('diagnoses')} variant={tab === 'diagnoses' ? 'primary' : 'secondary'}>
          {t.adminTabDiagnoses}
        </Button>
        <Button onClick={() => setTab('knowledge')} variant={tab === 'knowledge' ? 'primary' : 'secondary'}>
          {t.adminTabKnowledge}
        </Button>
      </div>

      {tab === 'users' && (
        <div className="glass-card p-4 space-y-2">
          <p className="text-xs text-slate-500 mb-2">{t.adminUsersEditHint}</p>
          {users.map((u) => {
            const open = expandedUserId === u.id;
            const edit = userEdits[u.id];
            const isMainAdmin = u.role === 'admin';
            return (
              <div key={u.id} className="border-b border-surface-border py-2 last:border-0">
                <button
                  type="button"
                  onClick={() => toggleUserPanel(u)}
                  className="w-full flex items-center justify-between gap-2 text-left py-1 rounded-lg hover:bg-white/[0.03] px-1 -mx-1 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-slate-200 font-medium truncate">{u.full_name}</div>
                    <div className="text-xs text-slate-500 truncate">{maskEmail(u.email)}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={u.role === 'admin' ? 'purple' : 'default'}>{u.role}</Badge>
                    {open ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
                  </div>
                </button>
                {open && edit && (
                  <div className="mt-3 pl-1 space-y-3 text-sm">
                    <div className="text-xs text-slate-500">
                      {t.profileMemberSince}: {formatDate(u.created_at, dateLocale)}
                    </div>
                    {isMainAdmin && (
                      <p className="text-xs text-amber-400/90">{t.adminMainAdminLocked}</p>
                    )}
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">{t.fullName}</label>
                      <input
                        value={edit.full_name}
                        onChange={(e) => patchUserEdit(u.id, 'full_name', e.target.value)}
                        className="w-full px-3 py-2 bg-surface border border-surface-border rounded text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">{t.email}</label>
                      <input
                        type="email"
                        value={edit.email}
                        onChange={(e) => patchUserEdit(u.id, 'email', e.target.value)}
                        disabled={isMainAdmin}
                        className="w-full px-3 py-2 bg-surface border border-surface-border rounded text-slate-200 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">{t.role}</label>
                      <select
                        value={edit.role}
                        onChange={(e) => patchUserEdit(u.id, 'role', e.target.value)}
                        disabled={isMainAdmin}
                        className="w-full px-3 py-2 bg-surface border border-surface-border rounded text-slate-200 disabled:opacity-50"
                      >
                        <option value="user">{t.profileRoleUser}</option>
                        <option value="admin">{t.roleAdmin}</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={edit.is_active}
                        onChange={(e) => patchUserEdit(u.id, 'is_active', e.target.checked)}
                        disabled={isMainAdmin}
                        className="rounded border-surface-border"
                      />
                      <span className="text-xs">{t.adminAccountActive}</span>
                    </label>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">{t.adminResetPasswordOptional}</label>
                      <PasswordInput
                        value={edit.new_password}
                        onChange={(e) => patchUserEdit(u.id, 'new_password', e.target.value)}
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button size="sm" onClick={() => saveUser(u.id)} disabled={savingUserId === u.id}>
                        {savingUserId === u.id ? t.loading : t.save}
                      </Button>
                      {!isMainAdmin && (
                        <Button size="sm" variant="danger" onClick={() => deleteUser(u.id)}>
                          <Trash2 size={14} />
                          {t.delete}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'diagnoses' && (
        <div className="glass-card p-4 space-y-2">
          {diagnoses.map((d) => (
            <div key={d.id} className="border-b border-surface-border py-2 text-sm text-slate-300">
              {d.user_email} — {d.top_diagnosis} — {formatDate(d.created_at, dateLocale)}
            </div>
          ))}
        </div>
      )}

      {tab === 'knowledge' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <form onSubmit={addDisease} className="glass-card p-4 space-y-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t.adminCategoryLabel}</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded text-slate-200"
              >
                {CATEGORY_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {t.symptomCategories?.[key] || key}
                  </option>
                ))}
              </select>
            </div>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded text-slate-200"
              placeholder={t.adminFieldName}
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded text-slate-200 min-h-[72px]"
              placeholder={t.adminFieldDescription}
            />
            <textarea
              value={form.treatment}
              onChange={(e) => setForm((p) => ({ ...p, treatment: e.target.value }))}
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded text-slate-200 min-h-[72px]"
              placeholder={t.adminFieldTreatment}
            />
            <input
              value={form.keywords}
              onChange={(e) => setForm((p) => ({ ...p, keywords: e.target.value }))}
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded text-slate-200"
              placeholder={t.adminFieldKeywords}
            />
            <p className="text-xs text-slate-500">{t.adminKeywordsHint}</p>

            <div className="border-t border-surface-border pt-3 space-y-2">
              <p className="text-xs font-semibold text-primary-400">{t.adminTranslationsEn}</p>
              <input
                value={form.nameEn}
                onChange={(e) => setForm((p) => ({ ...p, nameEn: e.target.value }))}
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded text-sm"
                placeholder={t.adminFieldNameEn}
              />
              <input
                value={form.descriptionEn}
                onChange={(e) => setForm((p) => ({ ...p, descriptionEn: e.target.value }))}
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded text-sm"
                placeholder={t.adminFieldDescEn}
              />
              <input
                value={form.treatmentEn}
                onChange={(e) => setForm((p) => ({ ...p, treatmentEn: e.target.value }))}
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded text-sm"
                placeholder={t.adminFieldTreatEn}
              />
            </div>

            <div className="border-t border-surface-border pt-3 space-y-2">
              <p className="text-xs font-semibold text-primary-400">{t.adminTranslationsRu}</p>
              <input
                value={form.nameRu}
                onChange={(e) => setForm((p) => ({ ...p, nameRu: e.target.value }))}
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded text-sm"
                placeholder={t.adminFieldNameRu}
              />
              <input
                value={form.descriptionRu}
                onChange={(e) => setForm((p) => ({ ...p, descriptionRu: e.target.value }))}
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded text-sm"
                placeholder={t.adminFieldDescRu}
              />
              <input
                value={form.treatmentRu}
                onChange={(e) => setForm((p) => ({ ...p, treatmentRu: e.target.value }))}
                className="w-full px-3 py-2 bg-surface border border-surface-border rounded text-sm"
                placeholder={t.adminFieldTreatRu}
              />
            </div>

            <Button type="submit">{t.adminAddButton}</Button>
          </form>
          <div className="glass-card p-4 space-y-3 max-h-[720px] overflow-y-auto">
            {diseases.map((k) => (
              <div key={k.id} className="border-b border-surface-border pb-3">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-slate-200 font-semibold">{k.name}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-700 text-slate-400">
                    {t.adminListCategory}: {t.symptomCategories?.[k.category] || k.category || 'general'}
                  </span>
                </div>
                <div className="text-slate-400 text-sm">{k.treatment}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
