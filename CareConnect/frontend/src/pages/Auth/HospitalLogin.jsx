import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, TriangleAlert } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';

export default function HospitalLogin() {
  const navigate = useNavigate();
  const { loginHospital } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginHospital(form.email, form.password);
      navigate('/hospital/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Hospital sign in" subtitle="Access your hospital's request dashboard.">
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <TriangleAlert size={15} className="shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Hospital email"
          type="email"
          icon={Mail}
          placeholder="Hospital Name"
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

        <Button type="submit" variant="primary" size="lg" icon={ArrowRight} loading={loading} className="w-full">
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Registering a hospital for the first time?{' '}
        <Link to="/hospital/register" className="font-semibold text-ink hover:text-red-600">
          Register
        </Link>
      </p>

      <p className="mt-3 text-center text-xs text-muted">
        Here as a donor instead?{' '}
        <Link to="/login" className="font-medium text-ink hover:text-red-600">
          Donor sign in
        </Link>
      </p>
    </AuthLayout>
  );
}