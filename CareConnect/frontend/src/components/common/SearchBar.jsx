import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search size={17} className="pointer-events-none absolute left-4 text-muted" />
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-line bg-white py-2.5 pl-11 pr-4 text-sm text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-500"
      />
    </div>
  );
}
