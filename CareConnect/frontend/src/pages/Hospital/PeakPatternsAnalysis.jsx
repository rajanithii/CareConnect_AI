import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { HOSPITAL_NAV } from '../../components/hospital/hospitalNav';
import { forecastingService } from '../../services/forecastingService';
import { useAuth } from '../../hooks/useAuth';
import BloodGroupChart from '../../components/charts/BloodGroupChart';

/**
 * Detailed Peak Demand Patterns Analysis
 * Shows ranked days of week, blood groups, urgency distribution, insights
 */

export default function PeakPatternsAnalysis() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const hospitalId = user?.id;

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [daysLookback, setDaysLookback] = useState(90);

  const loadAnalysis = async () => {
    if (!hospitalId) return;

    try {
      setLoading(true);
      setError('');
      const data = await forecastingService.analyzePeakPatterns(hospitalId, daysLookback);
      setAnalysis(data);
    } catch (err) {
      setError(err?.message || 'Unable to load peak pattern analysis.');
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis();
  }, [hospitalId, daysLookback]);

  const QUALITY_COLOR = {
    high: 'text-emerald-600',
    medium: 'text-cyan-600',
    low: 'text-amber-600',
  };

  const getQualityLevel = (score) => {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  };

  return (
    <DashboardLayout navItems={HOSPITAL_NAV} title="Peak Demand Patterns" subtitle={`Last ${daysLookback} days`}>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" icon={ArrowLeft} onClick={() => navigate(-1)}>
          Back
        </Button>
        <div className="flex-1" />
        <select
          value={daysLookback}
          onChange={(e) => setDaysLookback(Number(e.target.value))}
          className="rounded-xl border border-line bg-white px-3 py-2 text-sm font-medium text-ink outline-none"
        >
          <option value={30}>Last 30 days</option>
          <option value={60}>Last 60 days</option>
          <option value={90}>Last 90 days</option>
          <option value={180}>Last 180 days</option>
          <option value={365}>Last year</option>
        </select>
      </div>

      {loading ? (
        <Card className="flex items-center justify-center p-12">
          <Loader label="Analyzing peak patterns..." />
        </Card>
      ) : error ? (
        <Card className="flex items-center justify-center gap-4 p-8">
          <AlertCircle className="text-amber-600" size={20} />
          <div>
            <p className="font-semibold text-amber-900">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={loadAnalysis}>
              Retry
            </Button>
          </div>
        </Card>
      ) : !analysis ? (
        <EmptyState title="No pattern data" description="Ensure your hospital has sufficient request history." />
      ) : (
        <>
          {/* Data Quality Score */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted">Data Quality Score</p>
                  <p className={`mt-2 font-display text-2xl font-bold ${QUALITY_COLOR[getQualityLevel(analysis.data_quality_score)]}`}>
                    {analysis.data_quality_score}%
                  </p>
                  <p className="text-xs text-muted">
                    {getQualityLevel(analysis.data_quality_score) === 'high'
                      ? 'High confidence in analysis'
                      : getQualityLevel(analysis.data_quality_score) === 'medium'
                      ? 'Moderate confidence in analysis'
                      : 'Limited data available'}
                  </p>
                </div>
                <BarChart3 className="text-muted" size={20} />
              </div>
            </Card>
          </motion.div>

          {/* Peak Days of Week */}
          <Card className="mt-6">
            <h3 className="font-display text-base font-bold text-ink">Peak days of week</h3>
            <p className="text-sm text-muted">Ranked by average requests and units</p>

            {analysis.peak_days_of_week && analysis.peak_days_of_week.length > 0 ? (
              <div className="mt-4 space-y-3">
                {analysis.peak_days_of_week.map((day, index) => (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between rounded-xl bg-surface p-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge tone="ai">{day.rank}</Badge>
                        <span className="font-semibold text-ink2">{day.day}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        {day.avg_requests.toFixed(1)} requests · {day.avg_units.toFixed(1)} units
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="h-2 w-32 rounded-full bg-red-100">
                        <div
                          className="h-full rounded-full bg-red-600 transition-all"
                          style={{
                            width: `${(day.avg_requests / (analysis.peak_days_of_week[0]?.avg_requests || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted">No data available</p>
            )}
          </Card>

          {/* Peak Blood Groups */}
          <Card className="mt-6">
            <h3 className="font-display text-base font-bold text-ink">Most requested blood groups</h3>
            <p className="text-sm text-muted">By frequency and total units</p>

            {analysis.peak_blood_groups && analysis.peak_blood_groups.length > 0 ? (
              <div className="mt-4">
                <BloodGroupChart
                  data={analysis.peak_blood_groups.map((g) => ({
                    name: g.blood_group,
                    value: g.total_units_requested,
                  }))}
                />
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {analysis.peak_blood_groups.slice(0, 4).map((g) => (
                    <div key={g.blood_group} className="rounded-xl bg-surface p-3 text-center">
                      <p className="font-display font-bold text-ink2">{g.blood_group}</p>
                      <p className="mt-1 text-xs text-muted">{g.request_frequency_percent.toFixed(1)}%</p>
                      <p className="text-xs font-medium text-red-600">{g.total_units_requested} units</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted">No data available</p>
            )}
          </Card>

          {/* Urgency Distribution */}
          {analysis.peak_urgency_distribution && (
            <Card className="mt-6">
              <h3 className="font-display text-base font-bold text-ink">Urgency distribution</h3>
              <p className="text-sm text-muted">Percentage of requests by urgency level</p>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { level: 'CRITICAL', color: 'bg-red-100 text-red-700', icon: '🚨' },
                  { level: 'HIGH', color: 'bg-amber-100 text-amber-700', icon: '⚠️' },
                  { level: 'MEDIUM', color: 'bg-cyan-100 text-cyan-700', icon: 'ℹ️' },
                  { level: 'LOW', color: 'bg-emerald-100 text-emerald-700', icon: '✓' },
                ].map((u) => (
                  <div key={u.level} className={`rounded-xl ${u.color} p-4 text-center`}>
                    <p className="text-sm font-semibold">{u.icon} {u.level}</p>
                    <p className="mt-1 font-display text-lg font-bold">
                      {(analysis.peak_urgency_distribution[u.level] || 0).toFixed(0)}%
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Insights */}
          {analysis.insights && analysis.insights.length > 0 && (
            <Card className="mt-6 border border-cyan-200 bg-cyan-50">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-cyan-900">
                <TrendingUp size={17} /> Key insights
              </h3>
              <ul className="mt-3 space-y-2">
                {analysis.insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-cyan-800">
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-cyan-600 flex-shrink-0" />
                    {insight}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
