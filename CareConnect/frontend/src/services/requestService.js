import api from '../api/axios';

export const requestService = {
  async createRequest(payload) {
    const { data } = await api.post('/requests/create', payload);
    return data;
  },
};
