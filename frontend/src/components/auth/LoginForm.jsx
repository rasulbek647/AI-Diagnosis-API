// LoginForm.jsx — Login form with validation
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Button from '../ui/Button';
import toast from 'react-hot-toast';
import { formatApiError } from '../../utils/helpers';

export default function LoginForm() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email kiritilishi shart';
    if (!form.password) e.password = 'Parol kiritilishi shart';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(t.loginSuccess);
      navigate(data?.user?.role === 'admin' ? '/admin' : '/diagnosis');
    } catch (err) {
      toast.error(formatApiError(err, t, { fallback401: t.invalidCredentials }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">{t.email}</label>
        <input
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          placeholder={t.emailPlaceholder}
          className={`w-full px-4 py-3 rounded-xl border bg-slate-900/60 text-slate-100 placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/40 ${
            errors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-primary-500'
          }`}
        />
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">{t.password}</label>
        <div className="relative">
          <input
            type={showPwd ? 'text' : 'password'}
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            placeholder={t.passwordPlaceholder}
            className={`w-full px-4 py-3 rounded-xl border bg-slate-900/60 text-slate-100 placeholder:text-slate-500 pr-12 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/40 ${
              errors.password ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-primary-500'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
      </div>

      {/* Submit */}
      <Button type="submit" variant="primary" fullWidth loading={loading}>
        {t.login}
      </Button>

      {/* Register link */}
      <p className="text-center text-sm text-slate-500 pt-1">
        {t.noAccount}{' '}
        <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
          {t.registerHere}
        </Link>
      </p>
    </form>
  );
}