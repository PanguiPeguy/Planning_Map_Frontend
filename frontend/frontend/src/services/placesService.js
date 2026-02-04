// Service pour l'autocomplete de lieux (Nominatim OpenStreetMap)

const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';

export const placesService = {
  /**
   * Recherche de lieux au Cameroun avec autocomplete
   * @param {string} query - Terme de recherche
   * @returns {Promise} Liste de lieux
   */
  searchPlaces: async (query) => {
    if (!query || query.length < 2) {
      return { data: [] };
    }

    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        countrycodes: 'cm', // Limité au Cameroun
        limit: 5,
        addressdetails: 1
      });

      const response = await fetch(`${NOMINATIM_API}?${params}`, {
        headers: {
          'User-Agent': 'PlanningMapApp/1.0' // Nominatim requiert un User-Agent
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la recherche de lieux');
      }

      const data = await response.json();

      // Formater les résultats
      const places = data.map(place => ({
        id: place.place_id,
        name: place.display_name,
        latitude: parseFloat(place.lat),
        longitude: parseFloat(place.lon),
        type: place.type,
        address: place.address,
        boundingbox: place.boundingbox
      }));

      return { data: places };
    } catch (error) {
      console.error('Erreur searchPlaces:', error);
      return { data: [] };
    }
  },

  /**
   * Geocoding inversé - obtenir l'adresse depuis des coordonnées
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise} Adresse
   */
  reverseGeocode: async (lat, lon) => {
    try {
      const params = new URLSearchParams({
        lat,
        lon,
        format: 'json',
        addressdetails: 1
      });

      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
        headers: {
          'User-Agent': 'PlanningMapApp/1.0'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du geocoding inversé');
      }

      const data = await response.json();

      return {
        data: {
          name: data.display_name,
          address: data.address,
          latitude: parseFloat(data.lat),
          longitude: parseFloat(data.lon)
        }
      };
    } catch (error) {
      console.error('Erreur reverseGeocode:', error);
      return { data: null };
    }
  }
};
