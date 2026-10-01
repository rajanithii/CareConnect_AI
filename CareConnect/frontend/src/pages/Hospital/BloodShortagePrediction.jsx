/**
 * Module 4: Blood Shortage Prediction Dashboard
 * Displays shortage analysis, risk assessment, and recommendations
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import shortagePredictionService from '../../services/shortagePredictionService';
import { useAuth } from '../../contexts/AuthContext';

const BloodShortagePrediction = () => {
  const { user } = useAuth();
  const hospitalId = user?.hospital_id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [daysAhead, setDaysAhead] = useState(7);
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (hospitalId) {
      fetchPrediction();
    }
  }, [hospitalId]);

  const fetchPrediction = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await shortagePredictionService.predictShortages(hospitalId, daysAhead);
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch shortage prediction');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPrediction();
    setRefreshing(false);
  };

  const handleDaysChange = async (e) => {
    const newDays = parseInt(e.target.value);
    setDaysAhead(newDays);
    setLoading(true);
    const result = await shortagePredictionService.predictShortages(hospitalId, newDays);
    if (result.success) {
      setData(result.data);
    }
    setLoading(false);
  };

  const getRiskColor = (risk) => {
    const colors = {
      CRITICAL: 'bg-red-50 border-red-200',
      HIGH: 'bg-orange-50 border-orange-200',
      MEDIUM: 'bg-yellow-50 border-yellow-200',
      LOW: 'bg-green-50 border-green-200',
    };
    return colors[risk] || colors.LOW;
  };

  const getRiskTextColor = (risk) => {
    const colors = {
      CRITICAL: 'text-red-700',
      HIGH: 'text-orange-700',
      MEDIUM: 'text-yellow-700',
      LOW: 'text-green-700',
    };
    return colors[risk] || colors.LOW;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-cyan-600" />
          <p className="text-muted">Analyzing blood shortage risk...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-card p-4 text-red-700">
          <AlertCircle className="w-5 h-5 inline mr-2" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-ink">Blood Shortage Prediction</h1>
          <p className="text-muted mt-1">Forecast-based shortage risk analysis</p>
        </div>
        <div className="flex gap-3">
          <select
            value={daysAhead}
            onChange={handleDaysChange}
            className="px-4 py-2 border border-surface rounded-card focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value={7}>Next 7 days</option>
            <option value={14}>Next 14 days</option>
            <option value={30}>Next 30 days</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-cyan-600 text-white rounded-card hover:bg-cyan-700 disabled:opacity-50"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Risk Assessment Card */}
      {data?.risk_assessment && (
        <div className={`border-l-4 rounded-card p-6 ${getRiskColor(data.risk_assessment.overall_risk)}`}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className={`text-2xl font-bold ${getRiskTextColor(data.risk_assessment.overall_risk)}`}>
                {data.risk_assessment.overall_risk} RISK
              </h2>
              <p className="text-sm text-muted mt-2">
                {data.risk_assessment.critical_alerts} critical alerts | {data.risk_assessment.high_alerts} high priority
              </p>
            </div>
            <TrendingUp className={`w-8 h-8 ${getRiskTextColor(data.risk_assessment.overall_risk)}`} />
          </div>

          {data.risk_assessment.critical_blood_groups && (
            <div className="mt-4 pt-4 border-t border-current border-opacity-20">
              <p className="text-sm font-semibold mb-2">Critical Blood Groups:</p>
              <div className="flex gap-2">
                {data.risk_assessment.critical_blood_groups.split(',').map((group) => (
                  <span key={group} className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    {group.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.risk_assessment.stock_coverage_days !== null && (
            <p className="text-sm mt-4">
              <strong>Average inventory coverage:</strong> {data.risk_assessment.stock_coverage_days.toFixed(1)} days
            </p>
          )}
        </div>
      )}

      {/* Active Alerts */}
      <div>
        <h2 className="text-xl font-bold text-ink mb-4">Active Alerts</h2>
        {data?.active_alerts && data.active_alerts.length > 0 ? (
          <div className="grid gap-4">
            {data.active_alerts.map((alert) => {
              const riskDisplay = shortagePredictionService.getAlertLevelDisplay(alert.risk_level);
              return (
                <div
                  key={alert.id}
                  className={`border rounded-card p-4 ${getRiskColor(alert.risk_level)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{riskDisplay.icon}</span>
                        <div>
                          <h3 className="font-semibold text-ink">
                            {alert.blood_group} ({alert.status})
                          </h3>
                          <p className="text-sm text-muted">
                            Current: {alert.current_stock} units | Forecast: {alert.forecasted_demand_7days} units
                          </p>
                        </div>
                      </div>
                      {alert.days_until_stockout !== null && (
                        <p className={`text-sm font-semibold mt-2 ${riskDisplay.textColor}`}>
                          ⏱️ {alert.days_until_stockout} days until stockout
                        </p>
                      )}
                      {alert.recommended_stock && (
                        <p className="text-sm text-muted mt-1">
                          Recommended stock: {alert.recommended_stock} units
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        // TODO: Implement resolve modal
                      }}
                      className="px-3 py-1 bg-white border rounded text-sm hover:bg-gray-50"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-green-50 rounded-card border border-green-200">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-green-700">✅ No active shortage alerts</p>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {data?.recommendations && data.recommendations.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-ink mb-4">Recommendations</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-card p-4 space-y-2">
            {data.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">•</span>
                <p className="text-blue-800">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {data?.active_alerts && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface rounded-card p-4">
            <p className="text-muted text-sm">Total Alerts</p>
            <p className="text-2xl font-bold text-ink">{data.active_alerts.length}</p>
          </div>
          <div className="bg-surface rounded-card p-4">
            <p className="text-muted text-sm">Critical</p>
            <p className="text-2xl font-bold text-red-600">
              {data.risk_assessment?.critical_alerts || 0}
            </p>
          </div>
          <div className="bg-surface rounded-card p-4">
            <p className="text-muted text-sm">Risk Level</p>
            <p className={`text-2xl font-bold ${getRiskTextColor(data.risk_assessment?.overall_risk)}`}>
              {data.risk_assessment?.overall_risk}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodShortagePrediction;
