import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { HOSPITAL_NAV } from '../../components/hospital/hospitalNav';
import { hospitalService } from '../../services/hospitalService';

export default function RequestView() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await hospitalService.getRequest(id);
        setRequest(data);
      } catch (err) {
        console.error('Failed to load request:', err);
        setError('Unable to load request.');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  // WebSocket for realtime updates to this request
  useEffect(() => {
    if (!id) return;
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:8000/ws/requests/${id}`;
    let ws;
    try {
      ws = new WebSocket(wsUrl);
    } catch (e) {
      console.warn('WebSocket init failed', e);
      return;
    }

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg?.type === 'notification_update' && String(msg.request_id) === String(id)) {
          // refresh request
          hospitalService.getRequest(id).then((data) => setRequest(data)).catch((e) => console.error(e));
        }
      } catch (e) {
        console.error('WS message parse error', e);
      }
    };

    let reconnectAttempts = 0;
    const maxAttempts = 6;

    ws.onopen = () => {
      reconnectAttempts = 0;
      try { ws.send(JSON.stringify({ type: 'subscribe', request_id: id })); } catch (e) {}
    };

    ws.onclose = () => {
      // exponential backoff reconnect
      if (reconnectAttempts < maxAttempts) {
        const timeout = Math.min(30000, 500 * 2 ** reconnectAttempts);
        reconnectAttempts += 1;
        setTimeout(() => {
          try {
            const nws = new WebSocket(wsUrl);
            nws.onmessage = ws.onmessage;
            nws.onopen = ws.onopen;
            nws.onclose = ws.onclose;
            ws = nws;
          } catch (e) {
            console.warn('WS reconnect failed', e);
          }
        }, timeout);
      }
    };

    return () => {
      try { ws.close(); } catch (e) {}
    };
  }, [id]);

  return (
    <DashboardLayout navItems={HOSPITAL_NAV} title={`Request ${id}`} subtitle={request ? `${request.patient_name} · ${request.blood_group}` : ''}>
      {loading ? (
        <Card className="flex items-center justify-center p-8">Loading...</Card>
      ) : error ? (
        <Card className="flex items-center justify-center p-8 text-red-600">{error}</Card>
      ) : !request ? (
        <EmptyState title="Request not found" description="This request may have been removed." />
      ) : (
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{request.patient_name}</h3>
                <p className="text-sm text-muted">{request.hospital} · {request.city}</p>
                <p className="mt-2">Phone: {request.phone || 'Not provided'}</p>
                <p className="mt-1">Urgency: <Badge tone={request.urgency === 'CRITICAL' ? 'red' : 'neutral'}>{request.urgency}</Badge></p>
                <p className="mt-1">Status: <Badge tone={request.status === 'ASSIGNED' ? 'success' : 'neutral'}>{request.status}</Badge></p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-bold text-cyan-600">{request.blood_group}</p>
                <p className="text-xs text-muted">Blood Group</p>
              </div>
            </div>
          </Card>

          <Card>
            <h4 className="font-semibold mb-2">Donor Responses ({request.total_notifications})</h4>
            {request.donors && request.donors.length > 0 ? (
              <div className="space-y-3">
                {request.donors.map((d) => (
                  <div key={d.notification_id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{d.name} · {d.blood_group}</p>
                      <p className="text-sm text-muted">{d.city} · {d.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={d.status === 'ACCEPTED' ? 'success' : d.status === 'REJECTED' ? 'neutral' : 'neutral'}>{d.status}</Badge>
                      {d.status === 'ACCEPTED' && <span className="text-xs text-muted">Responded at {new Date(d.response_time).toLocaleString()}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No donor responses yet.</p>
            )}
          </Card>

          <div className="flex gap-2">
            <Link to="/hospital/requests">
              <Button variant="outline">Back to requests</Button>
            </Link>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
