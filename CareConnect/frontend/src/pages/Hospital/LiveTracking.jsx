import { useEffect, useState } from 'react';
import { Phone, MessageCircle, TriangleAlert, Navigation as NavIcon } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import LeafletMap from '../../components/maps/LeafletMap';
import { HOSPITAL_NAV } from '../../components/hospital/hospitalNav';
import { hospitalAPI } from '../../api/hospitalAPI';
import { getDrivingRoute } from '../../services/routingService';
import { cx } from '../../utils/helpers';

export default function LiveTracking() {
  const [requests, setRequests] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState('');

  const [selectedId, setSelectedId] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [route, setRoute] = useState(null);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [trackingError, setTrackingError] = useState('');

  useEffect(() => {
    hospitalAPI
      .getAcceptedRequests()
      .then(({ data }) => setRequests(data.requests || []))
      .catch((err) => setListError(err.response?.data?.detail || 'Could not load accepted requests.'))
      .finally(() => setLoadingList(false));
  }, []);

  const selectRequest = async (requestId) => {
    setSelectedId(requestId);
    setTracking(null);
    setRoute(null);
    setTrackingError('');
    setLoadingTracking(true);

    try {
      const { data } = await hospitalAPI.getTracking(requestId);
      setTracking(data);

      if (data.hospital.latitude && data.hospital.longitude && data.donor.latitude && data.donor.longitude) {
        const r = await getDrivingRoute(
          { lat: data.donor.latitude, lng: data.donor.longitude },
          { lat: data.hospital.latitude, lng: data.hospital.longitude }
        );
        setRoute(r);
      }
    } catch (err) {
      setTrackingError(err.response?.data?.detail || 'Could not load tracking data for this request.');
    } finally {
      setLoadingTracking(false);
    }
  };

  return (
    <DashboardLayout navItems={HOSPITAL_NAV} title="Live Tracking" subtitle="Real routes for donors who accepted a request">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="h-fit lg:col-span-1" padding="p-0">
          <div className="border-b border-line p-5">
            <h3 className="font-display text-sm font-bold text-ink">Accepted requests</h3>
            <p className="text-xs text-muted">Click one to plot its route</p>
          </div>

          {loadingList && <Loader label="Loading..." />}
          {!loadingList && listError && (
            <div className="p-5 text-sm text-red-700">{listError}</div>
          )}
          {!loadingList && !listError && requests.length === 0 && (
            <div className="p-5">
              <EmptyState title="No accepted donors yet" description="Once a donor accepts a request, it'll show up here." />
            </div>
          )}

          <div className="max-h-[520px] divide-y divide-line overflow-y-auto">
            {requests.map((r) => (
              <button
                key={r.request_id}
                onClick={() => selectRequest(r.request_id)}
                className={cx(
                  'flex w-full items-center gap-3 px-5 py-4 text-left transition-colors',
                  selectedId === r.request_id ? 'bg-red-50' : 'hover:bg-surface'
                )}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 font-display text-xs font-bold text-red-600">
                  {r.blood_group}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-semibold text-ink">
                    #{r.request_id} · {r.hospital}
                  </p>
                  <p className="truncate text-xs text-muted">Donor: {r.donor_name}</p>
                </div>
                <Badge tone={r.urgency === 'CRITICAL' ? 'red' : 'neutral'}>{r.urgency}</Badge>
              </button>
            ))}
          </div>
        </Card>

        <div className="lg:col-span-2">
          {!selectedId && (
            <Card className="flex h-full min-h-[420px] items-center justify-center">
              <EmptyState icon={NavIcon} title="Select a request" description="Pick an accepted request on the left to see its real route." />
            </Card>
          )}

          {selectedId && loadingTracking && (
            <Card className="flex h-full min-h-[420px] items-center justify-center">
              <Loader label="Loading route..." />
            </Card>
          )}

          {selectedId && !loadingTracking && trackingError && (
            <Card className="flex items-center gap-2 border-red-200 bg-red-50 text-sm text-red-700">
              <TriangleAlert size={16} className="shrink-0" />
              {trackingError}
            </Card>
          )}

          {selectedId && !loadingTracking && tracking && (
            <div className="space-y-4">
              {(!tracking.hospital.latitude || !tracking.donor.latitude) && (
                <Card className="flex items-center gap-2 border-amber-200 bg-amber-50 text-sm text-amber-800">
                  <TriangleAlert size={16} className="shrink-0" />
                  {!tracking.donor.latitude
                    ? "This donor registered before geocoding was added, so they have no coordinates — no route can be drawn."
                    : "This request's hospital location couldn't be geocoded — no route can be drawn."}
                </Card>
              )}

              <LeafletMap
                hospital={
                  tracking.hospital.latitude
                    ? { lat: tracking.hospital.latitude, lng: tracking.hospital.longitude, label: tracking.hospital.name }
                    : null
                }
                donor={
                  tracking.donor.latitude
                    ? {
                        lat: tracking.donor.latitude,
                        lng: tracking.donor.longitude,
                        label: tracking.donor.name,
                        bloodGroup: tracking.donor.blood_group,
                      }
                    : null
                }
                routeCoordinates={route?.coordinates || []}
              />

              <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 font-display text-sm font-bold text-red-600">
                    {tracking.donor.blood_group}
                  </span>
                  <div>
                    <p className="font-display text-sm font-bold text-ink">{tracking.donor.name}</p>
                    <p className="text-xs text-muted">{tracking.donor.city} · {tracking.donor.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <p className="text-xs text-muted">Distance</p>
                    <p className="font-display font-bold text-ink">
                      {route ? `${route.distanceKm.toFixed(1)} km` : tracking.distance_km ? `${tracking.distance_km} km` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Est. drive time</p>
                    <p className="font-display font-bold text-ink">
                      {route ? `${Math.round(route.durationMin)} min` : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" icon={Phone} iconPosition="left">
                    Call
                  </Button>
                  <Button variant="outline" icon={MessageCircle} iconPosition="left">
                    Message
                  </Button>
                </div>
              </Card>

              <p className="text-xs text-muted">
                Route drawn via OSRM (OpenStreetMap-based routing) using each side's real geocoded
                coordinates. If either side registered before geocoding was added, no route can be
                computed — see banner above.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}