import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { MapPin, Droplet } from 'lucide-react';

export default function EmergencyPopup({ open, onClose, request, onAccept }) {
  if (!request) return null;
  return (
    <Modal open={open} onClose={onClose} title="Emergency Request">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <Droplet size={24} />
        </span>
        <div>
          <p className="font-display text-base font-bold text-ink">{request.hospital}</p>
          <p className="flex items-center gap-1 text-xs text-muted"><MapPin size={11} /> {request.distance}</p>
        </div>
        <Badge tone="red" className="ml-auto">Critical</Badge>
      </div>
      <p className="mt-4 text-sm text-ink2">
        {request.group} · {request.units} units needed immediately.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onClose}>Not now</Button>
        <Button variant="emergency" className="flex-1" onClick={onAccept}>I can help</Button>
      </div>
    </Modal>
  );
}
