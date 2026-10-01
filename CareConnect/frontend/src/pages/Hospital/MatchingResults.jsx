import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Star, Clock, Send } from 'lucide-react';
import { notificationAPI } from '../../api/notificationAPI';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { HOSPITAL_NAV } from '../../components/hospital/hospitalNav';
import { matchingService } from '../../services/matchingService';

export default function MatchingResults() {
  const navigate = useNavigate();
  const { requestId: paramRequestId } = useParams();
  const requestId = paramRequestId;
  const [donors, setDonors] = useState([]);
  const [requestInfo, setRequestInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifying, setNotifying] = useState(null);
  const [notifiedIds, setNotifiedIds] = useState([]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await matchingService.getMatches(requestId);
        const matches = data?.recommended_donors || data?.donors || [];
        const req = data?.request_info || {
          id: data?.request_id || requestId,
          blood_group: data?.required_blood_group || 'N/A',
          units: data?.units || 0,
        };

        setDonors(matches);
        setRequestInfo(req);
      } catch (err) {
        const detail = err?.response?.data?.detail || 'Unable to load matching results.';
        setError(detail);
        setDonors([]);
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchMatches();
    } else {
      setLoading(false);
      setError('No request id provided for matching results.');
      navigate('/hospital/create-request');
    }
  }, [navigate, requestId]);

  const subtitle = requestInfo
    ? `${requestInfo.id} · ${requestInfo.blood_group} · ${requestInfo.units} units · Ranked by AI score`
    : 'Loading...';

  return (
    <DashboardLayout navItems={HOSPITAL_NAV} title="Matching Results" subtitle={subtitle}>
      <div className="space-y-4">
        {loading ? (
          <Card className="flex items-center justify-center p-8">
            <div className="text-sm text-muted">Loading matched donors...</div>
          </Card>
        ) : error ? (
          <Card className="flex items-center justify-center p-8">
            <div className="text-sm text-red-600">{error}</div>
          </Card>
        ) : donors.length === 0 ? (
          <Card className="flex items-center justify-center p-8">
            <div className="text-sm text-muted">No matched donors found</div>
          </Card>
        ) : (
          donors.map((d, i) => (
            <motion.div
              key={d.id || d.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 font-display text-sm font-bold text-red-600">
                    {d.blood_group || d.bloodGroup || '—'}
                  </span>
                  <div>
                    <p className="font-display text-sm font-bold text-ink">{d.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {d.distance_km != null ? `${d.distance_km} km` : d.distance || 'N/A'}</span>
                      <span className="flex items-center gap-1"><Star size={12} /> {d.match_score != null ? `${d.match_score} score` : d.score || 'N/A'}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {d.city || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-mono text-lg font-bold text-cyan-600">{d.match_score != null ? d.match_score : d.score || '--'}</p>
                    <p className="text-[10px] uppercase tracking-wide text-muted">match score</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {notifiedIds.includes(d.id) ? (
                      <Badge tone="neutral">Notified</Badge>
                    ) : (
                      <Button size="sm" variant="primary" icon={Send} onClick={async () => {
                        try {
                          setNotifying(d.id);
                          await notificationAPI.sendToDonor(requestId, d.id);
                          setNotifiedIds((s) => [...s, d.id]);
                        } catch (err) {
                          console.error('Notify failed', err);
                        } finally {
                          setNotifying(null);
                        }
                      }} loading={notifying === d.id}>
                        Notify
                      </Button>
                    )}
                    <div className="text-xs text-muted text-right mt-1">
                      {/* AI reasoning summary */}
                      <div>Why: Base 50{d.blood_group === requestInfo?.blood_group ? ' +30 blood group match' : ''}{d.availability ? ' +20 availability' : ''}{d.distance_km != null ? (d.distance_km <= 10 ? ' +20 close distance' : d.distance_km <= 50 ? ' +10 nearby' : d.distance_km > 200 ? ' -10 far' : '') : ''} = {d.match_score}</div>
                    </div>
                  </div>
                  {d.available === false || d.availability === false ? (
                    <Badge tone="neutral">Unavailable</Badge>
                  ) : (
                    <Badge tone="success" dot>Available</Badge>
                  )}
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
