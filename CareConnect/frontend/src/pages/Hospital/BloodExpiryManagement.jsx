/**
 * Module 7: Blood Expiry Management Dashboard
 * Monitor expiring blood, FIFO recommendations, wastage reports
 */

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, TrendingDown, CheckCircle, AlertCircle } from 'lucide-react';
import expiryService from '../../services/expiryService';
import { useAuth } from '../../contexts/AuthContext';

const BloodExpiryManagement = () => {
  const { user } = useAuth();
  const hospitalId = user?.hospital_id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [reportPeriod, setReportPeriod] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    if (hospitalId) {
      fetchExpiryData();
    }
  }, [hospitalId]);

  const fetchExpiryData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await expiryService.scanExpiry(hospitalId);

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch expiry data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchExpiryData();
    setRefreshing(false);
  };

  const handleGenerateReport = async () => {
    const result = await expiryService.generateReport(hospitalId, reportPeriod);
    if (result.success) {
      setReportData(result.data);
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleDismissAlert = async (alertId) => {
    const reason = prompt('Reason for dismissal:');
    const result = await expiryService.dismissAlert(alertId, reason);
    if (result.success) {
      await fetchExpiryData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-cyan-600" />
          <p className="text-muted">Scanning blood expiry...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-card p-4 text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
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
          <h1 className="text-3xl font-bold text-ink">Blood Expiry Management</h1>
          <p className="text-muted mt-1">Monitor expiring units, FIFO tracking, and wastage prevention</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-cyan-600 text-white rounded-card hover:bg-cyan-700 disabled:opacity-50"
        >
          {refreshing ? 'Scanning...' : 'Scan Now'}
        </button>
      </div>

      {/* Expiry Breakdown */}
      {data?.expiring_breakdown && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-card p-4">
            <p className="text-red-700 font-semibold">🔴 Expired</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {data.expiring_breakdown.EXPIRED || 0}
            </p>
            <p className="text-xs text-red-600 mt-1">Units past expiry</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-card p-4">
            <p className="text-orange-700 font-semibold">🟠 Urgent</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {data.expiring_breakdown.URGENT || 0}
            </p>
            <p className="text-xs text-orange-600 mt-1">Expiring within 7 days</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-card p-4">
            <p className="text-yellow-700 font-semibold">🟡 Warning</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {data.expiring_breakdown.WARNING || 0}
            </p>
            <p className="text-xs text-yellow-600 mt-1">Expiring within 30 days</p>
          </div>
        </div>
      )}

      {/* Wastage Summary */}
      {data && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-50 rounded-card p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Estimated Wastage</p>
                <p className="text-2xl font-bold text-red-600 mt-2">{data.wastage} units</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600 opacity-20" />
            </div>
          </div>
          <div className="bg-orange-50 rounded-card p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Estimated Cost</p>
                <p className="text-2xl font-bold text-orange-600 mt-2">
                  {expiryService.formatCurrency(data.wastageCost)}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600 opacity-20" />
            </div>
          </div>
        </div>
      )}

      {/* Active Alerts */}
      <div>
        <h2 className="text-xl font-bold text-ink mb-4">Active Expiry Alerts</h2>
        {data?.alerts && data.alerts.length > 0 ? (
          <div className="space-y-3">
            {data.alerts.map((alert) => {
              const badge = expiryService.getAlertLevelBadge(alert.alert_level);
              return (
                <div
                  key={alert.id}
                  className={`border rounded-card p-4 ${badge.bg}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{badge.icon}</span>
                        <div>
                          <h3 className="font-semibold text-ink">
                            {alert.unit_code} ({alert.blood_group})
                          </h3>
                          <p className={`text-sm font-semibold ${badge.text}`}>
                            {badge.label} • {alert.days_until_expiry} days until expiry
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted">
                        Expiry Date: {expiryService.formatDate(alert.expiry_date)}
                      </p>
                      {alert.recommended_action && (
                        <p className={`text-sm font-semibold mt-2 ${badge.text}`}>
                          💡 Recommended: {alert.recommended_action}
                        </p>
                      )}
                    </div>
                    {alert.alert_status === 'ACTIVE' && (
                      <button
                        onClick={() => handleDismissAlert(alert.id)}
                        className={`px-3 py-1 ${badge.bg} ${badge.text} rounded text-sm hover:opacity-75`}
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-green-50 rounded-card border border-green-200">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-green-700">✅ No expiry alerts. All units within safe timeframe.</p>
          </div>
        )}
      </div>

      {/* FIFO Recommendations */}
      {data?.fifoRecommendations && data.fifoRecommendations.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-ink mb-4">FIFO Recommendations</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-card p-4 space-y-3">
            {data.fifoRecommendations.map((rec, idx) => (
              <div key={idx} className="flex items-center gap-3 pb-3 border-b last:border-b-0 last:pb-0">
                <span className="text-2xl">📦</span>
                <div className="flex-1">
                  <p className="font-semibold text-ink">{rec.blood_group}</p>
                  <p className="text-sm text-muted">
                    Use unit: <strong>{rec.recommended_unit_code}</strong> (expires{' '}
                    {expiryService.formatDate(rec.expiry_date)})
                  </p>
                </div>
                <span className="text-xs bg-blue-200 text-blue-800 px-3 py-1 rounded">
                  {rec.reason}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Report Generator */}
      <div>
        <h2 className="text-xl font-bold text-ink mb-4">Wastage Report</h2>
        <div className="border rounded-card p-4 space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2">Report Period</label>
              <input
                type="month"
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                className="w-full px-3 py-2 border rounded-card"
              />
            </div>
            <button
              onClick={handleGenerateReport}
              className="px-6 py-2 bg-purple-600 text-white rounded-card hover:bg-purple-700"
            >
              Generate Report
            </button>
          </div>

          {reportData && (
            <div className="border-t pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-50 p-3 rounded">
                  <p className="text-sm text-muted">Total Expired</p>
                  <p className="text-2xl font-bold text-purple-600">{reportData.total_units_expired}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <p className="text-sm text-muted">Total Discarded</p>
                  <p className="text-2xl font-bold text-purple-600">{reportData.total_units_discarded}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-muted mb-1">FIFO Compliance</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${reportData.fifo_compliance_percent}%` }}
                    />
                  </div>
                  <span className="font-bold text-ink">{reportData.fifo_compliance_percent}%</span>
                </div>
              </div>
              {reportData.recommendations && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm font-semibold text-blue-900 mb-2">📝 Recommendations:</p>
                  <p className="text-sm text-blue-800 whitespace-pre-wrap">{reportData.recommendations}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BloodExpiryManagement;
