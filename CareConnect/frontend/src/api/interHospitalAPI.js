/**
 * Module 6: Inter-Hospital Blood Exchange API Wrapper
 * Thin axios layer for blood transfer endpoints
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

export const interHospitalAPI = {
  /**
   * Request blood transfer from another hospital
   * @param {number} requestingHospitalId
   * @param {number} supplyingHospitalId
   * @param {string} bloodGroup
   * @param {number} quantityRequested
   * @param {string} urgency
   * @param {string} reason
   * @returns {Promise} BloodTransferRequestOut
   */
  async requestTransfer(
    requestingHospitalId,
    supplyingHospitalId,
    bloodGroup,
    quantityRequested,
    urgency = 'MEDIUM',
    reason = null
  ) {
    const response = await api.post('/inter-hospital-exchange/transfer/request', {
      requesting_hospital_id: requestingHospitalId,
      supplying_hospital_id: supplyingHospitalId,
      blood_group: bloodGroup,
      quantity_requested: quantityRequested,
      urgency,
      reason,
    });
    return response.data;
  },

  /**
   * Approve a transfer request
   * @param {number} transferId
   * @param {number} quantityApproved
   * @param {string} approvalNotes
   * @returns {Promise} BloodTransferRequestOut
   */
  async approveTransfer(transferId, quantityApproved, approvalNotes = null) {
    const response = await api.post(`/inter-hospital-exchange/transfer/${transferId}/approve`, {
      quantity_approved: quantityApproved,
      approval_notes: approvalNotes,
    });
    return response.data;
  },

  /**
   * Reject a transfer request
   * @param {number} transferId
   * @param {string} reason
   * @returns {Promise} BloodTransferRequestOut
   */
  async rejectTransfer(transferId, reason) {
    const response = await api.post(
      `/inter-hospital-exchange/transfer/${transferId}/reject`,
      null,
      { params: { reason } }
    );
    return response.data;
  },

  /**
   * Complete a transfer
   * @param {number} transferId
   * @param {number} unitsTransferred
   * @param {Date} shippedDate
   * @param {Date} receivedDate
   * @param {string} carrier
   * @param {string} temperatureMaintained
   * @param {string} notes
   * @returns {Promise} BloodTransferLogOut
   */
  async completeTransfer(
    transferId,
    unitsTransferred,
    shippedDate = null,
    receivedDate = null,
    carrier = null,
    temperatureMaintained = null,
    notes = null
  ) {
    const response = await api.post(
      `/inter-hospital-exchange/transfer/${transferId}/complete`,
      {
        units_transferred: unitsTransferred,
        shipped_date: shippedDate,
        received_date: receivedDate,
        carrier,
        temperature_maintained: temperatureMaintained,
        notes,
      }
    );
    return response.data;
  },

  /**
   * Get pending transfers
   * @param {number} hospitalId
   * @returns {Promise} PendingTransfersOut
   */
  async getPendingTransfers(hospitalId) {
    const response = await api.get('/inter-hospital-exchange/pending', {
      params: { hospital_id: hospitalId },
    });
    return response.data;
  },

  /**
   * Get transfer history
   * @param {number} hospitalId
   * @param {number} limit
   * @returns {Promise} Array of BloodTransferLogOut
   */
  async getTransferHistory(hospitalId, limit = 50) {
    const response = await api.get('/inter-hospital-exchange/history', {
      params: { hospital_id: hospitalId, limit },
    });
    return response.data;
  },

  /**
   * Health check
   * @returns {Promise} Status object
   */
  async healthCheck() {
    const response = await api.get('/inter-hospital-exchange/health');
    return response.data;
  },
};

export default interHospitalAPI;
