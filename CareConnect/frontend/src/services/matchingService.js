import api from '../api/axios';

export const matchingService = {
  /**
   * Get matching donors for a blood request
   */
  async getMatches(requestId) {
    const { data } = await api.get(`/matching/${requestId}`);
    return data;
  },
};
