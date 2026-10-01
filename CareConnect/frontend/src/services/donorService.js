import api from '../api/axios';

export const donorService = {
  async getDonorById(id) {
    const { data } = await api.get(`/donors/${id}`);
    return data;
  },

  async getDonorByEmail(email) {
    const { data } = await api.get('/donors');
    const donors = Array.isArray(data) ? data : data?.donors || [];
    return donors.find((donor) => donor.email?.toLowerCase() === String(email).toLowerCase()) || null;
  },

  async toggleAvailability(id, isAvailable) {
    const { data } = await api.patch(`/donors/${id}/availability`, { isAvailable });
    return data;
  },
};
