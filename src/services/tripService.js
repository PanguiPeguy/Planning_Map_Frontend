import api from './api';

export const tripService = {
  // CRUD Voyages
  getAll: () => {
    return api.get('/trips');
  },

  getById: (tripId) => {
    return api.get(`/trips/${tripId}`);
  },

  getByShareToken: (shareToken) => {
    return api.get(`/trips/share/${shareToken}`);
  },

  create: (tripData) => {
    return api.post('/trips', tripData);
  },

  update: (tripId, tripData) => {
    return api.put(`/trips/${tripId}`, tripData);
  },

  delete: (tripId) => {
    return api.delete(`/trips/${tripId}`);
  },

  // Waypoints
  getWaypoints: (tripId) => {
    return api.get(`/trips/${tripId}/waypoints`);
  },

  addWaypoint: (tripId, waypointData) => {
    return api.post(`/trips/${tripId}/waypoints`, waypointData);
  },

  updateWaypoint: (tripId, waypointId, waypointData) => {
    return api.put(`/trips/${tripId}/waypoints/${waypointId}`, waypointData);
  },

  deleteWaypoint: (tripId, waypointId) => {
    return api.delete(`/trips/${tripId}/waypoints/${waypointId}`);
  },

  // Membres
  getMembers: (tripId) => {
    return api.get(`/trips/${tripId}/members`);
  },

  inviteMember: (tripId, email, role) => {
    return api.post(`/trips/${tripId}/members`, { email, role });
  },

  updateMemberRole: (tripId, memberId, newRole) => {
    return api.put(`/trips/${tripId}/members/${memberId}/role`, { newRole });
  },

  removeMember: (tripId, memberId) => {
    return api.delete(`/trips/${tripId}/members/${memberId}`);
  }
};