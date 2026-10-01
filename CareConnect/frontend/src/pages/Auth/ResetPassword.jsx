import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ password: '', confirm: '' });
  const error = form.confirm && form.password !== form.confirm ? 'Passwords do not match' : '';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (error) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/login');
    }, 800);
  };

  return (
    <AuthLayout title="Set a new password" subtitle="Choose a strong password you haven't used before.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="New password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <Input
          label="Confirm password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          value={form.confirm}
          error={error}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          required
        />
        <Button type="submit" variant="primary" size="lg" icon={ArrowRight} loading={loading} className="w-full">
          Reset Password
        </Button>
      </form>
    </AuthLayout>
  );
}
