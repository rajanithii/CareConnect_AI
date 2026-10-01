import api from '../api/axios';

export const aiService = {
  async processRequest(text) {
    const { data } = await api.post('/ai/process', { text });
    return data;
  },

  async analyzeRequest(text) {
    const { data } = await api.post('/ai/analyze-request', null, { params: { message: text } });
    return data;
  },

  async createRequest(text) {
    const { data } = await api.post('/ai/create-request', null, { params: { message: text } });
    return data;
  },

  async extractRequest(text) {
    const { data } = await api.post('/ai/extract-request', { text });
    return data;
  },
};
