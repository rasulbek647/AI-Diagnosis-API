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

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email kiritilishi shart';
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-app mb-2">{t.email}</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder={t.emailPlaceholder}
          className={`input-field ${errors.email ? 'border-red-400 focus:ring-red-400/30' : ''}`}
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-app mb-2">{t.password}</label>
        <div className="relative">
          <input
            type={showPwd ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder={t.passwordPlaceholder}
            className={`input-field pr-12 ${errors.password ? 'border-red-400 focus:ring-red-400/30' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-app-faint hover:text-app-muted"
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
      </div>

      <Button type="submit" variant="primary" fullWidth loading={loading} size="lg">
        {t.login}
      </Button>

      <p className="text-center text-sm text-app-muted pt-1">
        {t.noAccount}{' '}
        <Link to="/register" className="text-brand hover:text-brand-glow font-semibold">
          {t.registerHere}
        </Link>
      </p>
    </form>
  );
}
