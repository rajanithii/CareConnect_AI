import { TriangleAlert, ArrowRight } from 'lucide-react';

export default function EmergencyBanner() {
  return (
    <div className="bg-red-600 text-white">
      <div className="container-page flex flex-col items-center justify-center gap-2 py-2.5 text-center sm:flex-row sm:gap-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold sm:text-sm">
          <TriangleAlert size={14} />
          Need blood right now?
        </span>
        <a
          href="#emergency"
          className="flex items-center gap-1 text-xs font-semibold underline underline-offset-2 sm:text-sm"
        >
          Submit an emergency request <ArrowRight size={13} />
        </a>
      </div>
    </div>
  );
}
