/**
 * Module 6: Inter-Hospital Blood Exchange Service
 * Unwraps API responses and handles errors
 */

import interHospitalAPI from '../api/interHospitalAPI';

export const interHospitalService = {
  /**
   * Request blood transfer
   * @param {number} requestingHospitalId
   * @param {number} supplyingHospitalId
   * @param {string} bloodGroup
   * @param {number} quantityRequested
   * @param {string} urgency
   * @param {string} reason
   * @returns {Promise}
   */
  async requestTransfer(
    requestingHospitalId,
    supplyingHospitalId,
    bloodGroup,
    quantityRequested,
    urgency,
    reason
  ) {
    try {
      const transfer = await interHospitalAPI.requestTransfer(
        requestingHospitalId,
        supplyingHospitalId,
        bloodGroup,
        quantityRequested,
        urgency,
        reason
      );
      return {
        success: true,
        data: transfer,
      };
    } catch (error) {
      return this._handleError(error, 'Failed to request transfer');
    }
  },

  /**
   * Approve transfer
   * @param {number} transferId
   * @param {number} quantityApproved
   * @param {string} approvalNotes
   * @returns {Promise}
   */
  async approveTransfer(transferId, quantityApproved, approvalNotes) {
    try {
      const transfer = await interHospitalAPI.approveTransfer(
        transferId,
        quantityApproved,
        approvalNotes
      );
      return {
        success: true,
        data: transfer,
      };
    } catch (error) {
      return this._handleError(error, 'Failed to approve transfer');
    }
  },

  /**
   * Reject transfer
   * @param {number} transferId
   * @param {string} reason
   * @returns {Promise}
   */
  async rejectTransfer(transferId, reason) {
    try {
      const transfer = await interHospitalAPI.rejectTransfer(transferId, reason);
      return {
        success: true,
        data: transfer,
      };
    } catch (error) {
      return this._handleError(error, 'Failed to reject transfer');
    }
  },

  /**
   * Complete transfer
   * @param {number} transferId
   * @param {number} unitsTransferred
   * @param {Date} shippedDate
   * @param {Date} receivedDate
   * @param {string} carrier
   * @param {string} temperatureMaintained
   * @param {string} notes
   * @returns {Promise}
   */
  async completeTransfer(
    transferId,
    unitsTransferred,
    shippedDate,
    receivedDate,
    carrier,
    temperatureMaintained,
    notes
  ) {
    try {
      const log = await interHospitalAPI.completeTransfer(
        transferId,
        unitsTransferred,
        shippedDate,
        receivedDate,
        carrier,
        temperatureMaintained,
        notes
      );
      return {
        success: true,
        data: log,
      };
    } catch (error) {
      return this._handleError(error, 'Failed to complete transfer');
    }
  },

  /**
   * Get pending transfers
   * @param {number} hospitalId
   * @returns {Promise}
   */
  async getPendingTransfers(hospitalId) {
    try {
      const result = await interHospitalAPI.getPendingTransfers(hospitalId);
      return {
        success: true,
        data: result,
        incoming: result.incoming_requests || [],
        outgoing: result.outgoing_requests || [],
      };
    } catch (error) {
      return this._handleError(error, 'Failed to fetch pending transfers');
    }
  },

  /**
   * Get transfer history
   * @param {number} hospitalId
   * @param {number} limit
   * @returns {Promise}
   */
  async getTransferHistory(hospitalId, limit = 50) {
    try {
      const history = await interHospitalAPI.getTransferHistory(hospitalId, limit);
      return {
        success: true,
        data: history,
      };
    } catch (error) {
      return this._handleError(error, 'Failed to fetch transfer history');
    }
  },

  /**
   * Get urgency badge
   * @param {string} urgency
   * @returns {Object}
   */
  getUrgencyBadge(urgency) {
    const badges = {
      CRITICAL: { bg: 'bg-red-100', text: 'text-red-800', icon: '🔴' },
      HIGH: { bg: 'bg-orange-100', text: 'text-orange-800', icon: '🟠' },
      MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '🟡' },
      LOW: { bg: 'bg-green-100', text: 'text-green-800', icon: '🟢' },
    };
    return badges[urgency] || badges.MEDIUM;
  },

  /**
   * Get status badge
   * @param {string} status
   * @returns {Object}
   */
  getStatusBadge(status) {
    const badges = {
      PENDING: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '⏳' },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', icon: '✅' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', icon: '❌' },
      COMPLETED: { bg: 'bg-purple-100', text: 'text-purple-800', icon: '🎉' },
      CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-800', icon: '⛔' },
    };
    return badges[status] || badges.PENDING;
  },

  /**
   * Parse error response
   * @private
   */
  _handleError(error, defaultMessage) {
    const message = error.response?.data?.detail || error.message || defaultMessage;
    console.error('Inter-hospital exchange error:', message);
    return {
      success: false,
      error: message,
      data: null,
    };
  },
};

export default interHospitalService;
