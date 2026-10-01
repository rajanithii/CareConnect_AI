import api from '../api/axios';

export const donorNotificationService = {
  /**
   * Get notifications for a donor
   */
  async getNotifications(donorId) {
    const { data } = await api.get(`/donor-dashboard/${donorId}/notifications`);
    const alerts = data?.alerts || [];
    return [...alerts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  /**
   * Accept a notification/request
   */
  async acceptNotification(notificationId) {
    const { data } = await api.post(`/notifications/${notificationId}/accept`);
    return data;
  },

  /**
   * Reject a notification/request
   */
  async rejectNotification(notificationId) {
    const { data } = await api.post(`/notifications/${notificationId}/reject`);
    return data;
  },
};
