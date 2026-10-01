/**
 * Module 8: Advanced Admin Portal API Wrapper
 * Thin axios layer for admin endpoints
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Inject JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bloodlink_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminAPI = {
  /**
   * Get admin dashboard
   * @returns {Promise} AdminDashboardOut
   */
  async getAdminDashboard() {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  /**
   * Get pending hospital approvals
   * @returns {Promise} Array of HospitalApprovalRequestOut
   */
  async getPendingApprovals() {
    const response = await api.get('/admin/approvals/pending');
    return response.data;
  },

  /**
   * Approve a hospital
   * @param {number} hospitalId
   * @param {string} approvalNotes
   * @returns {Promise} HospitalApprovalRequestOut
   */
  async approveHospital(hospitalId, approvalNotes = null) {
    const response = await api.post(`/admin/approvals/${hospitalId}/approve`, {
      hospital_id: hospitalId,
      approval_notes: approvalNotes,
    });
    return response.data;
  },

  /**
   * Reject a hospital
   * @param {number} hospitalId
   * @param {string} rejectionReason
   * @returns {Promise} HospitalApprovalRequestOut
   */
  async rejectHospital(hospitalId, rejectionReason) {
    const response = await api.post(`/admin/approvals/${hospitalId}/reject`, {
      hospital_id: hospitalId,
      rejection_reason: rejectionReason,
    });
    return response.data;
  },

  /**
   * Get audit logs
   * @param {number} hospitalId
   * @param {string} action
   * @param {number} daysLookback
   * @param {number} limit
   * @returns {Promise} Array of AuditLogOut
   */
  async getAuditLogs(hospitalId = null, action = null, daysLookback = 7, limit = 100) {
    const response = await api.get('/admin/audit-logs', {
      params: {
        hospital_id: hospitalId,
        action,
        days_lookback: daysLookback,
        limit,
      },
    });
    return response.data;
  },

  /**
   * Get system alerts
   * @returns {Promise} Array of SystemAlertOut
   */
  async getSystemAlerts() {
    const response = await api.get('/admin/alerts');
    return response.data;
  },

  /**
   * Acknowledge an alert
   * @param {number} alertId
   * @returns {Promise} SystemAlertOut
   */
  async acknowledgeAlert(alertId) {
    const response = await api.post(`/admin/alerts/${alertId}/acknowledge`);
    return response.data;
  },

  /**
   * Resolve an alert
   * @param {number} alertId
   * @returns {Promise} SystemAlertOut
   */
  async resolveAlert(alertId) {
    const response = await api.post(`/admin/alerts/${alertId}/resolve`);
    return response.data;
  },

  /**
   * Health check
   * @returns {Promise} Status object
   */
  async healthCheck() {
    const response = await api.get('/admin/health');
    return response.data;
  },
};

export default adminAPI;
