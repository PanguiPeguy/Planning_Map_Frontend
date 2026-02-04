import api from './api';

export const notificationService = {
  getAll: () => {
    return api.get('/notifications');
  },

  getUnread: () => {
    return api.get('/notifications/unread');
  },

  getUnreadCount: () => {
    return api.get('/notifications/unread/count');
  },

  markAsRead: (notificationId) => {
    return api.put(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: () => {
    return api.put('/notifications/read-all');
  },

  delete: (notificationId) => {
    return api.delete(`/notifications/${notificationId}`);
  }
};
