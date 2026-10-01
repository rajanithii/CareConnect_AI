import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Phone, MapPin, Droplet, TriangleAlert } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '', blood_group: '', phone: '', city: '',
  });

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/donor/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong creating your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Become a donor" subtitle="Join the network in under a minute.">
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <TriangleAlert size={15} className="shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full name" icon={User} placeholder="Jane Doe" value={form.name} onChange={update('name')} required />
        <Input label="Email address" type="email" icon={Mail} placeholder="you@example.com" value={form.email} onChange={update('email')} required />
        <Input label="Password" type="password" icon={Lock} placeholder="At least 8 characters" value={form.password} onChange={update('password')} required />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Blood group" icon={Droplet} options={BLOOD_GROUPS} value={form.blood_group} onChange={update('blood_group')} required />
          <Input label="City" icon={MapPin} placeholder="Kochi" value={form.city} onChange={update('city')} required />
        </div>
        <Input label="Phone number" icon={Phone} placeholder="+91 98xxxxxx90" value={form.phone} onChange={update('phone')} required />

        <Button type="submit" variant="primary" size="lg" icon={ArrowRight} loading={loading} className="w-full">
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-ink hover:text-red-600">Sign in</Link>
      </p>
    </AuthLayout>
  );
}