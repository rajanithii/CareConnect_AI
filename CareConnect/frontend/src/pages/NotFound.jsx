import { Link } from 'react-router-dom';
import { HeartCrack } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
      <HeartCrack size={40} className="text-red-500" />
      <h1 className="mt-6 font-display text-6xl font-extrabold text-ink">404</h1>
      <p className="mt-3 text-muted">This page doesn&rsquo;t exist — but help is still nearby.</p>
      <Link to="/" className="mt-8">
        <Button variant="primary">Back to Home</Button>
      </Link>
    </div>
  );
}
