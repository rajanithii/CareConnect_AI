import { Cross } from 'lucide-react';

export default function HospitalMarkers({ position = { top: '50%', left: '50%' }, label }) {
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={position}>
      <div className="flex flex-col items-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white shadow-lift ring-4 ring-white">
          <Cross size={16} />
        </span>
        {label && <span className="mt-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-ink shadow-soft">{label}</span>}
      </div>
    </div>
  );
}
