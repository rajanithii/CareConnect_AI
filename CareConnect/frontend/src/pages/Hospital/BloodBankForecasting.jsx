import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Zap, Calendar } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { HOSPITAL_NAV } from '../../components/hospital/hospitalNav';
import { forecastingService } from '../../services/forecastingService';
import { useAuth } from '../../hooks/useAuth';
import DonationTrend from '../../components/charts/DonationTrend';

/**
 * Blood Bank AI Demand Forecasting
 * Displays 30-day demand forecasts with trends, recommendations, peak analysis
 */

export default function BloodBankForecasting() {
  const { user } = useAuth();
  const hospitalId = user?.id;

  // Forecast data
  const [forecast, setForecast] = useState(null);
  const [peakAnalysis, setPeakAnalysis] = useState(null);

  // Loading/error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [serviceHealth, setServiceHealth] = useState('checking');

  const loadData = async () => {
    if (!hospitalId) return;

    try {
      setLoading(true);
      setError('');

      // Check if AI service is available
      const healthy = await forecastingService.isServiceHealthy();
      setServiceHealth(healthy ? 'healthy' : 'unhealthy');

      if (!healthy) {
        setError('AI forecasting service is temporarily unavailable. Please try again later.');
        return;
      }

      // Load forecast and peak analysis in parallel
      const [forecastData, peakData] = await Promise.all([
        forecastingService.forecastDemand(hospitalId, { daysAhead: 30 }),
        forecastingService.analyzePeakPatterns(hospitalId, 90),
      ]);

      setForecast(forecastData);
      setPeakAnalysis(peakData);
    } catch (err) {
      setError(err?.message || 'Unable to load forecasting data. Please try again.');
      setForecast(null);
      setPeakAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [hospitalId]);

  const TREND_COLOR = {
    increasing: 'text-red-600',
    stable: 'text-cyan-600',
    decreasing: 'text-emerald-600',
  };

  const TREND_LABEL = {
    increasing: '📈 Demand increasing',
    stable: '➡️ Demand stable',
    decreasing: '📉 Demand decreasing',
  };

  return (
    <DashboardLayout
      navItems={HOSPITAL_NAV}
      title="Demand Forecasting"
      subtitle="30-day AI-powered predictions powered by Groq LLM"
    >
      {loading ? (
        <Card className="flex items-center justify-center p-12">
          <Loader label="Analyzing demand patterns..." />
        </Card>
      ) : error ? (
        <Card className="flex items-center justify-center gap-4 p-8">
          <AlertTriangle className="text-amber-600" size={20} />
          <div>
            <p className="font-semibold text-amber-900">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={loadData}>
              Retry
            </Button>
          </div>
        </Card>
      ) : !forecast ? (
        <EmptyState
          title="No forecast data"
          description="Ensure your hospital has at least 30 days of request history."
        />
      ) : (
        <>
          {/* Header Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted">Forecast Period</p>
                    <p className="mt-2 font-display text-2xl font-bold text-ink">
                      {forecast.forecast_period_days} days
                    </p>
                  </div>
                  <Calendar className="text-muted" size={20} />
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted">Trend</p>
                    <p className={`mt-2 font-display text-base font-bold ${TREND_COLOR[forecast.trend]}`}>
                      {TREND_LABEL[forecast.trend] || forecast.trend}
                    </p>
                    <Badge className="mt-2" tone={forecast.trend === 'increasing' ? 'red' : 'success'}>
                      {forecast.trend_confidence}% confident
                    </Badge>
                  </div>
                  <TrendingUp className="text-muted" size={20} />
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted">Avg Daily Demand</p>
                    <p className="mt-2 font-display text-2xl font-bold text-ink">
                      {forecast.daily_forecasts
                        ? Math.round(
                            forecast.daily_forecasts.reduce((sum, d) => sum + d.predicted_units, 0) /
                              forecast.daily_forecasts.length
                          )
                        : 0}{' '}
                      units
                    </p>
                  </div>
                  <Zap className="text-muted" size={20} />
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Forecast Chart */}
          <Card className="mt-6">
            <h3 className="font-display text-base font-bold text-ink">30-day forecast</h3>
            <p className="text-sm text-muted">Predicted daily blood unit demand</p>
            <div className="mt-4">
              <DonationTrend
                data={forecast.daily_forecasts?.map((d) => ({
                  month: d.date?.split('-')[2], // Just show day
                  units: d.predicted_units,
                }))}
              />
            </div>
          </Card>

          {/* Peak Days */}
          {forecast.peak_days && forecast.peak_days.length > 0 && (
            <Card className="mt-6">
              <h3 className="font-display text-base font-bold text-ink">Peak demand days</h3>
              <p className="text-sm text-muted">Historically highest demand on these days</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {forecast.peak_days.map((day) => (
                  <Badge key={day} tone="ai">
                    {day}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Seasonal Factors */}
          {forecast.seasonal_factors && forecast.seasonal_factors.length > 0 && (
            <Card className="mt-6">
              <h3 className="font-display text-base font-bold text-ink">Seasonal factors</h3>
              <p className="text-sm text-muted">Patterns influencing this forecast</p>
              <div className="mt-3 space-y-2">
                {forecast.seasonal_factors.map((factor, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-ink2">
                    <span className="h-2 w-2 rounded-full bg-cyan-600" />
                    {factor}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Anomalies */}
          {forecast.anomalies_detected && forecast.anomalies_detected.length > 0 && (
            <Card className="mt-6 border border-amber-200 bg-amber-50">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-amber-900">
                <AlertTriangle size={17} /> Detected anomalies
              </h3>
              <div className="mt-3 space-y-2">
                {forecast.anomalies_detected.map((anomaly, i) => (
                  <p key={i} className="text-sm text-amber-800">
                    • {anomaly}
                  </p>
                ))}
              </div>
            </Card>
          )}

          {/* Recommendations */}
          {forecast.recommendations && forecast.recommendations.length > 0 && (
            <Card className="mt-6 border border-emerald-200 bg-emerald-50">
              <h3 className="font-display text-base font-bold text-emerald-900">Operational recommendations</h3>
              <ul className="mt-3 space-y-2">
                {forecast.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-emerald-800">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Peak Patterns */}
          {peakAnalysis && (
            <Card className="mt-6">
              <h3 className="font-display text-base font-bold text-ink">Peak demand patterns (90-day analysis)</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {peakAnalysis.peak_days_of_week && (
                  <div>
                    <p className="text-xs font-medium text-muted">Peak days</p>
                    <div className="mt-2 space-y-1.5">
                      {peakAnalysis.peak_days_of_week.slice(0, 3).map((d) => (
                        <div key={d.day} className="flex items-center justify-between text-sm">
                          <span className="text-ink2">{d.day}</span>
                          <span className="font-semibold text-red-600">{d.avg_units.toFixed(1)} units/day</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {peakAnalysis.peak_blood_groups && (
                  <div>
                    <p className="text-xs font-medium text-muted">Most requested blood groups</p>
                    <div className="mt-2 space-y-1.5">
                      {peakAnalysis.peak_blood_groups.slice(0, 3).map((g) => (
                        <div key={g.blood_group} className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-red-600">{g.blood_group}</span>
                          <span className="text-ink2">{g.request_frequency_percent.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Service Status */}
          {serviceHealth !== 'healthy' && (
            <Card className="mt-6 border border-amber-200 bg-amber-50 text-sm text-amber-800">
              Forecasting service status: <Badge tone="amber">Checking...</Badge>
            </Card>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
