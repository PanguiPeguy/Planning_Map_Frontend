import api from './api';

export const routingService = {
  // Calculer itinéraire
  calculate: (routeData) => {
    return api.post('/routing/calculate', routeData);
  },

  // Version GET simple
  calculateSimple: (startLat, startLon, endLat, endLon) => {
    return api.get('/routing/calculate', {
      params: { startLat, startLon, endLat, endLon }
    });
  },

  // Health check
  healthCheck: () => {
    return api.get('/routing/health');
  }
};