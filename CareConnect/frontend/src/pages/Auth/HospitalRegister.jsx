import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Building2, ArrowRight, Phone, MapPin, TriangleAlert } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';

export default function HospitalRegister() {
  const navigate = useNavigate();
  const { registerHospital } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', city: '', address: '',
  });

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerHospital(form);
      navigate('/hospital/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong creating the hospital account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Register your hospital" subtitle="Create an account to start sending real requests.">
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <TriangleAlert size={15} className="shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Hospital name" icon={Building2} placeholder="Hospital Name" value={form.name} onChange={update('name')} required />
        <Input
          label="Hospital email"
          type="email"
          icon={Mail}
          placeholder="Hospital Name"
          value={form.email}
          onChange={update('email')}
          required
        />
        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="At least 8 characters"
          value={form.password}
          onChange={update('password')}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Phone number" icon={Phone} placeholder="+91 484 2345 678" value={form.phone} onChange={update('phone')} required />
          <Input label="City" icon={MapPin} placeholder="Kochi" value={form.city} onChange={update('city')} required />
        </div>
        <Input
          label="Address (optional, improves match distance accuracy)"
          icon={MapPin}
          placeholder="MG Road, Kochi"
          value={form.address}
          onChange={update('address')}
        />

        <Button type="submit" variant="primary" size="lg" icon={ArrowRight} loading={loading} className="w-full">
          Create Hospital Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already registered?{' '}
        <Link to="/hospital/login" className="font-semibold text-ink hover:text-red-600">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}