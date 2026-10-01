import { Droplet, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { hospitalService } from '../../services/hospitalService';

export default function NotificationCard({ notification, onAccept, onReject }) {
  const { hospital, group, units, distance, urgency, time, status = 'pending', request_id } = notification;
  const [expanded, setExpanded] = useState(false);
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const toggle = async () => {
    if (!expanded && request_id) {
      try {
        setLoadingDetails(true);
        const data = await hospitalService.getRequest(request_id);
        setDetails(data || null);
      } catch (err) {
        console.error('Failed to load request details', err);
      } finally {
        setLoadingDetails(false);
      }
    }
    setExpanded((e) => !e);
  };

  const normalizedStatus = String(status || 'pending').toLowerCase();
  const isFinalized = normalizedStatus === 'accepted' || normalizedStatus === 'rejected';
  const finalMessage = normalizedStatus === 'accepted' ? 'You accepted this request.' : normalizedStatus === 'rejected' ? 'You declined this request.' : null;

  return (
    <Card className="flex flex-col gap-4 shadow-sm ring-1 ring-surface/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Droplet size={20} />
          </span>
            <div>
              <p className="font-display text-sm font-bold text-ink">
                {hospital} needs {group}
              </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              <span>{units} units</span>
              <span className="flex items-center gap-1"><MapPin size={11} /> {distance}</span>
              <span className="flex items-center gap-1"><Clock size={11} /> {time}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge tone={urgency === 'Critical' ? 'red' : 'neutral'}>{urgency}</Badge>
          <Button size="sm" variant="outline" onClick={toggle}>{expanded ? 'Hide' : 'View'}</Button>
        </div>
      </div>

      {expanded && (
        <div className="mt-2 border-t border-line pt-3">
          {loadingDetails ? (
            <div className="text-sm text-muted">Loading request details...</div>
          ) : details ? (
            <div>
              <p className="font-semibold">Patient: {details.patient_name}</p>
              <p className="text-sm text-muted">Hospital: {details.hospital} · {details.city}</p>
              <p className="mt-2">Contact: {details.phone}</p>
              <p className="mt-2 text-sm">Urgency: <span className="font-semibold">{details.urgency}</span></p>

              {isFinalized ? (
                <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${normalizedStatus === 'accepted' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                  {finalMessage}
                </div>
              ) : (
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onReject?.(notification.notification_id)}>Decline</Button>
                  <Button size="sm" variant="primary" onClick={() => onAccept?.(notification.notification_id)}>Accept</Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted">No details available</div>
          )}
        </div>
      )}
    </Card>
  );
}
