// RegisterForm.jsx — Registration form
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Button from '../ui/Button';
import toast from 'react-hot-toast';
import { formatApiError } from '../../utils/helpers';

export default function RegisterForm() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Ism kiritilishi shart';
    if (!form.email) e.email = 'Email kiritilishi shart';
    if (form.password.length < 6) e.password = 'Parol kamida 6 ta belgi';
    if (form.password !== form.confirm) e.confirm = 'Parollar mos emas';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.fullName, form.email, form.password);
      toast.success(t.registerSuccess);
      navigate('/diagnosis');
    } catch (err) {
      toast.error(formatApiError(err, t));
    } finally {
      setLoading(false);
    }
  };

  const field = (key, err) => `input-field ${err ? 'border-red-400 focus:ring-red-400/30' : ''}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">{t.fullName}</label>
        <input
          type="text"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          placeholder="Ism Familiya"
          className={field('fullName', errors.fullName)}
        />
        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">{t.email}</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="example@email.com"
          className={field('email', errors.email)}
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">{t.password}</label>
        <div className="relative">
          <input
            type={showPwd ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            className={`${field('password', errors.password)} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">{t.confirmPassword}</label>
        <input
          type="password"
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          placeholder="••••••••"
          className={field('confirm', errors.confirm)}
        />
        {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
      </div>

      <Button type="submit" variant="primary" fullWidth loading={loading} size="lg">
        {t.register}
      </Button>

      <p className="text-center text-sm text-slate-500">
        {t.haveAccount}{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
          {t.loginHere}
        </Link>
      </p>
    </form>
  );
}
