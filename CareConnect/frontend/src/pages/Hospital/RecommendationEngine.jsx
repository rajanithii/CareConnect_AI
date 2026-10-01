import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { HOSPITAL_NAV } from '../../components/hospital/hospitalNav';
import recommendationService from '../../services/recommendationService';
import { useAuth } from '../../contexts/AuthContext';

export default function RecommendationEngine() {
  const { user } = useAuth();
  const [state, setState] = useState({ loading: true, error: '', recommendations: [] });

  useEffect(() => {
    if (!user?.hospital_id) return;
    recommendationService.generateRecommendations(user.hospital_id).then((result) => {
      setState({ loading: false, error: result.success ? '' : result.error, recommendations: result.recommendations || [] });
    });
  }, [user?.hospital_id]);

  return (
    <DashboardLayout navItems={HOSPITAL_NAV} title="Recommendations" subtitle="Smart blood management actions">
      {state.loading && <p className="text-ink2">Loading recommendations...</p>}
      {state.error && <p className="text-red-600">{state.error}</p>}
      {!state.loading && !state.error && (
        <div className="space-y-3">
          {state.recommendations.length === 0 ? <p className="text-ink2">No active recommendations.</p> : state.recommendations.map((recommendation) => (
            <article key={recommendation.id} className="rounded-lg border border-line bg-white p-4">
              <h2 className="font-semibold text-ink">{recommendation.title || recommendation.recommendation_type}</h2>
              <p className="mt-1 text-sm text-ink2">{recommendation.description || recommendation.action || 'Review this recommendation.'}</p>
            </article>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
