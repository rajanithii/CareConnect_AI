/**
 * Module 8: Advanced Admin Portal Dashboard
 * System-wide monitoring, approvals, alerts, audit logs
 */

import React, { useState, useEffect } from 'react';
import {
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  TrendingUp,
  Zap,
  LogOut,
} from 'lucide-react';
import adminService from '../../services/adminService';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminService.getAdminDashboard();

      if (result.success) {
        setData(result);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  };

  const handleApproveHospital = async (hospitalId) => {
    const notes = prompt('Approval notes:');
    const result = await adminService.approveHospital(hospitalId, notes);
    if (result.success) {
      await fetchDashboard();
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleRejectHospital = async (hospitalId) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    const result = await adminService.rejectHospital(hospitalId, reason);
    if (result.success) {
      await fetchDashboard();
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleResolveAlert = async (alertId) => {
    const result = await adminService.resolveAlert(alertId);
    if (result.success) {
      await fetchDashboard();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-cyan-600" />
          <p className="text-muted">Loading admin dashboard...</p>
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

  const snapshot = data?.snapshot;
  const healthBadge = adminService.getHealthScoreBadge(snapshot?.system_health_score || 100);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-ink">Admin Dashboard</h1>
          <p className="text-muted mt-1">System-wide monitoring and management</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-cyan-600 text-white rounded-card hover:bg-cyan-700 disabled:opacity-50"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* System Health */}
      {snapshot && (
        <div className={`border-l-4 rounded-card p-6 ${healthBadge.bg}`}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className={`text-2xl font-bold ${healthBadge.color}`}>
                System Health: {healthBadge.label}
              </h2>
              <p className="text-sm text-muted mt-2">
                {snapshot.critical_alerts} critical • {snapshot.high_alerts} high priority
              </p>
            </div>
            <div className="text-right">
              <Zap className={`w-8 h-8 ${healthBadge.color} mb-2`} />
              <p className={`text-3xl font-bold ${healthBadge.color}`}>
                {snapshot.system_health_score}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      {snapshot && (
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-surface rounded-card p-4">
            <p className="text-muted text-sm">Hospitals</p>
            <p className="text-2xl font-bold text-ink mt-2">{snapshot.total_hospitals}</p>
            <p className="text-xs text-muted mt-1">{snapshot.active_hospitals} active</p>
          </div>
          <div className="bg-surface rounded-card p-4">
            <p className="text-muted text-sm">Blood Units</p>
            <p className="text-2xl font-bold text-ink mt-2">{snapshot.total_blood_units}</p>
          </div>
          <div className="bg-surface rounded-card p-4">
            <p className="text-muted text-sm">Today's Requests</p>
            <p className="text-2xl font-bold text-cyan-600 mt-2">{snapshot.total_requests_today}</p>
          </div>
          <div className="bg-surface rounded-card p-4">
            <p className="text-muted text-sm">Transfers</p>
            <p className="text-2xl font-bold text-purple-600 mt-2">{snapshot.total_transfers_today}</p>
          </div>
          <div className="bg-surface rounded-card p-4">
            <p className="text-muted text-sm">Active Alerts</p>
            <p className="text-2xl font-bold text-red-600 mt-2">{snapshot.total_alerts_today}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-surface">
        {['overview', 'approvals', 'alerts', 'audit'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold capitalize ${
              activeTab === tab
                ? 'text-cyan-600 border-b-2 border-cyan-600'
                : 'text-muted hover:text-ink'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && snapshot && (
        <div className="space-y-6">
          {/* Blood Group Distribution */}
          <div>
            <h3 className="text-lg font-bold text-ink mb-3">Blood Group Distribution</h3>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(snapshot.units_by_blood_group || {}).map(([group, count]) => (
                <div key={group} className="bg-surface rounded-card p-3 text-center">
                  <p className="font-semibold text-ink">{group}</p>
                  <p className="text-2xl font-bold text-cyan-600">{count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Unit Status */}
          <div>
            <h3 className="text-lg font-bold text-ink mb-3">Unit Status Distribution</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(snapshot.units_by_status || {}).map(([status, count]) => (
                <div key={status} className="border rounded-card p-3">
                  <p className="text-sm text-muted capitalize">{status}</p>
                  <p className="text-2xl font-bold text-ink mt-1">{count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Approvals Tab */}
      {activeTab === 'approvals' && data?.pendingApprovals && (
        <div>
          {data.pendingApprovals.length > 0 ? (
            <div className="space-y-3">
              {data.pendingApprovals.map((approval) => (
                <div key={approval.id} className="border rounded-card p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-ink">{approval.hospital_name}</h3>
                      </div>
                      <p className="text-sm text-muted">
                        {approval.hospital_email} • {approval.hospital_phone}
                      </p>
                      <p className="text-xs text-muted mt-1">
                        Applied: {adminService.formatDateTime(approval.submitted_date)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveHospital(approval.id)}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectHospital(approval.id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-green-50 rounded-card border border-green-200">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-green-700">✅ All hospitals approved</p>
            </div>
          )}
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && data?.alerts && (
        <div>
          {data.alerts.length > 0 ? (
            <div className="space-y-3">
              {data.alerts.map((alert) => {
                const severity = adminService.getSeverityBadge(alert.severity);
                const status = adminService.getAlertStatusBadge(alert.status);
                return (
                  <div key={alert.id} className={`border rounded-card p-4 ${severity.bg}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{severity.icon}</span>
                          <h3 className={`font-semibold ${severity.text}`}>
                            {alert.alert_type}
                          </h3>
                        </div>
                        <p className="text-sm text-muted">{alert.message}</p>
                        {alert.details && (
                          <p className="text-xs text-muted mt-2">📝 {alert.details}</p>
                        )}
                        <p className="text-xs text-muted mt-2">
                          {adminService.formatDateTime(alert.triggered_at)}
                        </p>
                      </div>
                      {alert.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleResolveAlert(alert.id)}
                          className={`px-4 py-2 ${status.bg} ${status.text} rounded hover:opacity-75`}
                        >
                          Resolve
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
              <p className="text-green-700">✅ No active system alerts</p>
            </div>
          )}
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && data?.auditLogs && (
        <div>
          {data.auditLogs.length > 0 ? (
            <div className="space-y-2">
              {data.auditLogs.map((log) => (
                <div key={log.id} className="border-l-2 border-muted pl-4 py-2">
                  <p className="text-sm font-semibold text-ink">
                    {log.action} • {log.entity_type}#{log.entity_id}
                  </p>
                  <p className="text-xs text-muted">
                    {log.user_email} • {adminService.formatDateTime(log.timestamp)}
                  </p>
                  {log.status === 'FAILURE' && (
                    <p className="text-xs text-red-600">❌ {log.error_message}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-blue-50 rounded-card border border-blue-200">
              <LogOut className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-blue-700">No recent audit logs</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
