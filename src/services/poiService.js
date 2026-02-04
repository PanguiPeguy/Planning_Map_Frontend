import api from './api';

export const poiService = {

  // Créer POI (Admin)
  create: (poiData) => {
    return api.post('/pois', poiData);
  },

  // Modifier POI (Admin)
  update: (poiId, poiData) => {
    return api.put(`/pois/${poiId}`, poiData);
  },

  // Supprimer POI (Admin)
  delete: (poiId) => {
    return api.delete(`/pois/${poiId}`);
  },


  // Recherche POI avec filtres (lat, lon, radius, category, search, page, size)
  search: (query, size = 50) => {
    return api.get('/pois', { params: { search: query, size } });
  },

  // POI dans zone géographique
  getInArea: (minLat, minLon, maxLat, maxLon, categories = []) => {
    const params = { minLat, minLon, maxLat, maxLon };
    if (categories.length > 0) {
      params.categories = categories.join(',');
    }
    return api.get('/pois/area', { params });
  },

  // Récupérer les POIs autour d'un point (pour simuler "along route" on peut chercher autour de l'origine et destination)
  getNearby: (lat, lon, radiusKm = 10, category = null) => {
    const params = { lat, lon, radius: radiusKm };
    if (category) params.category = category;
    return api.get('/pois', { params });
  },

  // Liste avec pagination et filtres
  getAll: (params = {}) => {
    return api.get('/pois', { params });
  },

  // Détails POI
  getById: (poiId) => {
    return api.get(`/pois/${poiId}`);
  },

  //récupérer tous les POIs avec pagination automatique
  getAllPaginated: async (filters = {}, maxPages = 20) => {
    const allPois = [];
    let page = 0;
    let hasMore = true;
    const size = 100; // Taille de page

    console.log("Starting getAllPaginated with filters:", filters);

    while (hasMore && page < maxPages) {
      try {
        const response = await api.get('/pois', {
          params: { ...filters, page, size }
        });
        
        // Gérer différents formats de réponse
        const data = response.data;
        let content = [];
        let totalPages = 1;
        let totalElements = 0;
        
        if (data) {
          // Format 1: { content: [...], totalPages, totalElements }
          if (Array.isArray(data.content)) {
            content = data.content;
            totalPages = data.totalPages || 1;
            totalElements = data.totalElements || content.length;
          }
          // Format 2: { pois: [...] }
          else if (Array.isArray(data.pois)) {
            content = data.pois;
            totalPages = 1;
            totalElements = content.length;
          }
          // Format 3: Directement un tableau
          else if (Array.isArray(data)) {
            content = data;
            totalPages = 1;
            totalElements = content.length;
          }
        }
        
        allPois.push(...content);
        
        console.log(`Page ${page + 1}/${totalPages} loaded: ${content.length} POIs (total: ${allPois.length}/${totalElements})`);
        
        // Vérifier s'il y a plus de pages
        hasMore = content.length === size && page < totalPages - 1;
        page++;
        
      } catch (error) {
        console.error(`Error loading page ${page}:`, error);
        hasMore = false;
      }
    }
    
    console.log(`getAllPaginated complete: ${allPois.length} total POIs loaded`);
    return allPois;
  },

  // Catégories POI
  getCategories: () => {
    return api.get('/poi-categories')
  },

  //POI likes
  getTopLiked: (limit = 5, bounds = null) => {
    const params = { limit };
    if (bounds) {
      params.minLat = bounds.minLat;
      params.minLon = bounds.minLon;
      params.maxLat = bounds.maxLat;
      params.maxLon = bounds.maxLon;
    }
    return api.get('/pois/top-liked', { params });
  },

  getTopFavorites: (limit = 5, bounds = null) => {
    const params = { limit };
    if (bounds) {
      params.minLat = bounds.minLat;
      params.minLon = bounds.minLon;
      params.maxLat = bounds.maxLat;
      params.maxLon = bounds.maxLon;
    }
    return api.get('/pois/top-favorites', { params });
  },

  getTopCommented: (limit = 5, bounds = null) => {
    const params = { limit };
    if (bounds) {
      params.minLat = bounds.minLat;
      params.minLon = bounds.minLon;
      params.maxLat = bounds.maxLat;
      params.maxLon = bounds.maxLon;
    }
    return api.get('/pois/top-commented', { params });
  },

  // Avis POI
  getReviews: (poiId) => {
    return api.get(`/pois/${poiId}/reviews`);
  },

  createReview: (poiId, reviewData) => {
    return api.post(`/pois/${poiId}/reviews`, reviewData);
  },

  deleteReview: (poiId, reviewId) => {
    return api.delete(`/pois/${poiId}/reviews/${reviewId}`);
  },

  // ============================================
  // LIKES
  // ============================================

  // Liker un POI
  likePoi: (poiId) => {
    return api.post(`/pois/${poiId}/like`);
  },

  // Retirer un like
  unlikePoi: (poiId) => {
    return api.delete(`/pois/${poiId}/like`);
  },

  // ============================================
  // FAVORIS
  // ============================================

  // Ajouter aux favoris
  addToFavorites: (poiId) => {
    return api.post(`/pois/${poiId}/favorite`);
  },

  // Retirer des favoris
  removeFromFavorites: (poiId) => {
    return api.delete(`/pois/${poiId}/favorite`);
  },

  // Récupérer les POIs favoris de l'utilisateur connecté
  getFavorites: (params = {}) => {
    return api.get('/pois/favorites', { params });
  }
};

export default poiService;