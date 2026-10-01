import api from './axios';

export const notificationAPI = {
  send: (requestId, payload) => api.post(`/notifications/send/${requestId}`, payload),
  getForDonor: (donorId) => api.get(`/notifications/donor/${donorId}`),
  sendToDonor: (requestId, donorId) => api.post(`/notifications/send_to/${requestId}/${donorId}`),
  accept: (notificationId) => api.post(`/notifications/${notificationId}/accept`),
  reject: (notificationId) => api.post(`/notifications/${notificationId}/reject`),
  markRead: (notificationId) => api.patch(`/notifications/${notificationId}/read`),
};
