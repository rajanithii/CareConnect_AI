import { BrainCircuit } from 'lucide-react';

export default function AIProcessor({ status = 'Analyzing request...' }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-white">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300">
        <BrainCircuit size={16} className="animate-pulse" />
      </span>
      <span className="text-sm font-medium">{status}</span>
    </div>
  );
}
