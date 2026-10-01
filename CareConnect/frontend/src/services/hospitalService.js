import api from '../api/axios';

export const hospitalService = {
  /**
   * Get all blood requests for the hospital
   */
  async getRequests() {
    const { data } = await api.get('/hospital/requests');
    return data;
  },

  /**
   * Get a single request details by id
   */
  async getRequest(requestId) {
    const { data } = await api.get(`/hospital/requests/${requestId}`);
    return data;
  },

  /**
   * Get hospital statistics
   */
  async getStatistics() {
    const { data } = await api.get('/hospital/statistics');
    return data;
  },

  /**
   * Mark a request as completed
   */
  async completeRequest(requestId) {
    const { data } = await api.patch(`/hospital/requests/${requestId}/complete`);
    return data;
  },

  /**
   * Cancel a request
   */
  async cancelRequest(requestId) {
    const { data } = await api.patch(`/hospital/requests/${requestId}/cancel`);
    return data;
  },
};
