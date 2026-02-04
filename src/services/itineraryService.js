import api from "./api";

const ITINERARY_API_URL = "/itineraries";

const itineraryService = {
  // Get user itineraries
  getUserItineraries: async (userId) => {
    try {
      // Assuming GET /api/v1/itineraries?userId=...
      const response = await api.get(`${ITINERARY_API_URL}?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching itineraries:", error);
      throw error;
    }
  },

  // Get single itinerary
  getItinerary: async (id) => {
    try {
      const response = await api.get(`${ITINERARY_API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching itinerary details:", error);
      throw error;
    }
  },

  // Create itinerary
  createItinerary: async (itineraryData) => {
    try {
      const response = await api.post(ITINERARY_API_URL, itineraryData);
      return response.data;
    } catch (error) {
      console.error("Error creating itinerary:", error);
      throw error;
    }
  },

  // Update itinerary
  updateItinerary: async (id, itineraryData) => {
    try {
      const response = await api.put(
        `${ITINERARY_API_URL}/${id}`,
        itineraryData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating itinerary:", error);
      throw error;
    }
  },

  // Delete itinerary
  deleteItinerary: async (id) => {
    try {
      await api.delete(`${ITINERARY_API_URL}/${id}`);
    } catch (error) {
      console.error("Error deleting itinerary:", error);
      throw error;
    }
  },

  // Helper to add 'assign to planning' logic if needed,
  // though that's usually on the planning service.
};

export default itineraryService;
