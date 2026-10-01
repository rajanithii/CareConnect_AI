import { MapPin, Droplet } from 'lucide-react';
import PortalLayout from '../../layouts/PortalLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import GoogleMap from '../../components/maps/GoogleMap';
import HospitalMarkers from '../../components/maps/HospitalMarkers';

const NEARBY = [
  { hospital: 'Sahyadri Health', group: 'B+', distance: '1.8 km', urgency: 'Critical' },
  { hospital: 'RedCross Kerala', group: 'B+', distance: '3.4 km', urgency: 'Standard' },
  { hospital: 'CityMed Group', group: 'O+', distance: '4.1 km', urgency: 'Urgent' },
];

export default function NearbyRequests() {
  return (
    <PortalLayout title="Nearby Requests" subtitle="Within 10 km of your current location">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <GoogleMap>
            <HospitalMarkers position={{ top: '40%', left: '35%' }} label="Sahyadri Health" />
            <HospitalMarkers position={{ top: '65%', left: '65%' }} label="RedCross Kerala" />
            <HospitalMarkers position={{ top: '25%', left: '70%' }} label="CityMed Group" />
          </GoogleMap>
        </div>

        <div className="space-y-4">
          {NEARBY.map((n) => (
            <Card key={n.hospital}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <Droplet size={16} />
                  </span>
                  <div>
                    <p className="font-display text-sm font-bold text-ink">{n.hospital}</p>
                    <p className="flex items-center gap-1 text-xs text-muted">
                      <MapPin size={11} /> {n.distance}
                    </p>
                  </div>
                </div>
                <Badge tone={n.urgency === 'Critical' ? 'red' : 'neutral'}>{n.urgency}</Badge>
              </div>
              <Button size="sm" variant="primary" className="mt-3 w-full">
                Respond · {n.group}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
}
