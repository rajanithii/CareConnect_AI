/**
 * Module 8: Advanced Admin Portal Service
 * Unwraps API responses and handles errors
 */

import adminAPI from '../api/adminAPI';

export const adminService = {
  /**
   * Get admin dashboard
   * @returns {Promise}
   */
  async getAdminDashboard() {
    try {
      const result = await adminAPI.getAdminDashboard();
      return {
        success: true,
        data: result,
        snapshot: result.current_snapshot,
        pendingApprovals: result.pending_approvals || [],
        alerts: result.active_system_alerts || [],
        auditLogs: result.recent_audit_logs || [],
      };
    } catch (error) {
      return this._handleError(error, 'Failed to fetch admin dashboard');
    }
  },

  /**
   * Get pending approvals
   * @returns {Promise}
   */
  async getPendingApprovals() {
    try {
      const approvals = await adminAPI.getPendingApprovals();
      return {
        success: true,
        data: approvals,
      };
    } catch (error) {
      return this._handleError(error, 'Failed to fetch approvals');
    }
  },

  /**
   * Approve hospital
   * @param {number} hospitalId
   * @param {string} approvalNotes
   * @returns {Promise}
   */
  async approveHospital(hospitalId, approvalNotes) {
    try {
      const result = await adminAPI.approveHospital(hospitalId, approvalNotes);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return this._handleError(error, 'Failed to approve hospital');
    }
  },

  /**
   * Reject hospital
   * @param {number} hospitalId
   * @param {string} rejectionReason
   * @returns {Promise}
   */
  async rejectHospital(hospitalId, rejectionReason) {
    try {
      const result = await adminAPI.rejectHospital(hospitalId, rejectionReason);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return this._handleError(error, 'Failed to reject hospital');
    }
  },

  /**
   * Get audit logs
   * @param {number} hospitalId
   * @param {string} action
   * @param {number} daysLookback
   * @param {number} limit
   * @returns {Promise}
   */
  async getAuditLogs(hospitalId, action, daysLookback, limit) {
    try {
      const logs = await adminAPI.getAuditLogs(hospitalId, action, daysLookback, limit);
      return {
        success: true,
        data: logs,
      };
    } catch (error) {
      return this._handleError(error, 'Failed to fetch audit logs');
    }
  },

  /**
   * Get system alerts
   * @returns {Promise}
   */
  async getSystemAlerts() {
    try {
      const alerts = await adminAPI.getSystemAlerts();
      return {
        success: true,
        data: alerts,
      };
    } catch (error) {
      return this._handleError(error, 'Failed to fetch system alerts');
    }
  },

  /**
   * Acknowledge alert
   * @param {number} alertId
   * @returns {Promise}
   */
  async acknowledgeAlert(alertId) {
    try {
      const alert = await adminAPI.acknowledgeAlert(alertId);
      return {
        success: true,
        data: alert,
      };
    } catch (error) {
      return this._handleError(error, 'Failed to acknowledge alert');
    }
  },

  /**
   * Resolve alert
   * @param {number} alertId
   * @returns {Promise}
   */
  async resolveAlert(alertId) {
    try {
      const alert = await adminAPI.resolveAlert(alertId);
      return {
        success: true,
        data: alert,
      };
    } catch (error) {
      return this._handleError(error, 'Failed to resolve alert');
    }
  },

  /**
   * Get severity badge
   * @param {string} severity
   * @returns {Object}
   */
  getSeverityBadge(severity) {
    const badges = {
      CRITICAL: { bg: 'bg-red-100', text: 'text-red-800', icon: '🔴', label: 'Critical' },
      HIGH: { bg: 'bg-orange-100', text: 'text-orange-800', icon: '🟠', label: 'High' },
      MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '🟡', label: 'Medium' },
      LOW: { bg: 'bg-green-100', text: 'text-green-800', icon: '🟢', label: 'Low' },
    };
    return badges[severity] || badges.MEDIUM;
  },

  /**
   * Get alert status badge
   * @param {string} status
   * @returns {Object}
   */
  getAlertStatusBadge(status) {
    const badges = {
      ACTIVE: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '⏳' },
      ACKNOWLEDGED: { bg: 'bg-purple-100', text: 'text-purple-800', icon: '✅' },
      RESOLVED: { bg: 'bg-green-100', text: 'text-green-800', icon: '🎉' },
    };
    return badges[status] || badges.ACTIVE;
  },

  /**
   * Calculate system health score
   * @param {number} score - 0-100
   * @returns {Object}
   */
  getHealthScoreBadge(score) {
    if (score >= 80) {
      return { color: 'text-green-600', bg: 'bg-green-50', label: 'Healthy' };
    } else if (score >= 60) {
      return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Caution' };
    } else {
      return { color: 'text-red-600', bg: 'bg-red-50', label: 'Critical' };
    }
  },

  /**
   * Format date and time
   * @param {Date|string} date
   * @returns {string}
   */
  formatDateTime(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-IN');
  },

  /**
   * Parse error response
   * @private
   */
  _handleError(error, defaultMessage) {
    const message = error.response?.data?.detail || error.message || defaultMessage;
    console.error('Admin service error:', message);
    return {
      success: false,
      error: message,
      data: null,
    };
  },
};

export default adminService;
