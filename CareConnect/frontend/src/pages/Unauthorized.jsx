import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import Button from '../components/common/Button';

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
      <ShieldAlert size={40} className="text-red-500" />
      <h1 className="mt-6 font-display text-3xl font-extrabold text-ink">Access restricted</h1>
      <p className="mt-3 max-w-sm text-muted">
        You don&rsquo;t have permission to view this page. Sign in with an account that has access.
      </p>
      <Link to="/login" className="mt-8">
        <Button variant="primary">Sign In</Button>
      </Link>
    </div>
  );
}
