import { notificationAPI } from '../api/notificationAPI';

export const notificationService = {
  async sendEmergencyAlert(requestId, donorIds) {
    const { data } = await notificationAPI.send(requestId, { donorIds });
    return data;
  },
  async respondToAlert(notificationId, accepted) {
    const { data } = accepted
      ? await notificationAPI.accept(notificationId)
      : await notificationAPI.reject(notificationId);
    return data;
  },
};
