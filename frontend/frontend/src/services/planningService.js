import api from './api';

const planningService = {
  // Récupérer les plannings externes (app de l'autre groupe)
  getExternalPlannings: async () => {
    const response = await api.get('/planning/external');
    return response.data;
  },

  // Importer un planning externe localement
  importPlanning: async (externalId, name) => {
    const response = await api.post('/planning/import', { externalId, name });
    return response.data;
  },

  // Lister les plannings locaux
  getLocalPlannings: async () => {
    const response = await api.get('/planning/local');
    return response.data;
  },

  // Détails d'un planning
  getPlanningDetails: async (id) => {
    const response = await api.get(`/planning/local/${id}`);
    return response.data;
  },

  // Items d'un planning
  getPlanningItems: async (id) => {
    const response = await api.get(`/planning/local/${id}/items`);
    return response.data;
  },

  // Calculer l'itinéraire pour un item
  calculateItemRoute: async (itemId) => {
    const response = await api.post(`/planning/items/${itemId}/calculate`);
    return response.data;
  },

  // Calculer tous les itinéraires d'un planning
  calculateAllRoutes: async (planningId) => {
    const response = await api.post(`/planning/local/${planningId}/calculate-all`);
    return response.data;
  },

  assignItinerary: async (itemId, itineraryId) => {
    const response = await api.put(`/planning/items/${itemId}/assign-itinerary/${itineraryId}`);
    return response.data;
  },

  addItem: async (planningId, itemData) => {
    const response = await api.post(`/planning/local/${planningId}/items`, itemData);
    return response.data;
  },

  updateItem: async (itemId, itemData) => {
    const response = await api.put(`/planning/items/${itemId}`, itemData);
    return response.data;
  },

  deleteItem: async (itemId) => {
    const response = await api.delete(`/planning/items/${itemId}`);
    return response.data;
  }
};

export default planningService;
