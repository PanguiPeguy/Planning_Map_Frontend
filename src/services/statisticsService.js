import api from './api';

export const statisticsService = {
  // Dashboard global (admin)
  getDashboard: () => {
    return api.get('/statistics/dashboard');
  },

  // Statistiques utilisateur connecté
  getCurrentUserStats: () => {
    return api.get('/statistics/user/me');
  },

  // Statistiques d'un utilisateur spécifique
  getUserStats: (userId) => {
    return api.get(`/statistics/user/${userId}`);
  }
};
