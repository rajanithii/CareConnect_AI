import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authService } from '../../services/authService';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const data = await authService.login(form.email.trim(), form.password);
      const token = data?.access_token || data?.token;

      if (token) {
        localStorage.setItem('bloodlink_token', token);
        localStorage.setItem('bloodlink_user_email', form.email.trim());
      }

      navigate('/donor/dashboard');
    } catch (err) {
      const detail = err?.response?.data?.detail;
      let message = 'Unable to sign in. Please try again.';

      if (Array.isArray(detail)) {
        message = detail.map((item) => item.msg || JSON.stringify(item)).join(' ');
      } else if (typeof detail === 'string') {
        message = detail;
      } else if (detail && typeof detail === 'object') {
        message = JSON.stringify(detail);
      } else if (err?.message) {
        message = err.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue coordinating responses.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          icon={Mail}
          placeholder="you@hospital.org"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ink2">
            <input type="checkbox" className="rounded border-line accent-red-600" />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-medium text-red-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <Button type="submit" variant="primary" size="lg" icon={ArrowRight} loading={loading} className="w-full">
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Don&rsquo;t have an account?{' '}
        <Link to="/register" className="font-semibold text-ink hover:text-red-600">
          Register
        </Link>
      </p>
    </AuthLayout>
  );
}
