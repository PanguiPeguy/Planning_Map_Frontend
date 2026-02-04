import api from './api';

export const userService = {
    // Récupérer tous les utilisateurs (Admin)
    getAll: (params = {}) => {
        return api.get('/users', { params });
    },

    // Récupérer un utilisateur par ID
    getById: (userId) => {
        return api.get(`/users/${userId}`);
    },

    // Mon profil
    getMyProfile: () => {
        return api.get('/users/me');
    },

    // Mettre à jour mon profil
    updateProfile: (userData) => {
        return api.put('/users/me', userData);
    },

    // Supprimer mon compte
    deleteMyAccount: () => {
        return api.delete('/users/me');
    },

    // Supprimer un utilisateur (Admin)
    delete: (userId) => {
        return api.delete(`/users/${userId}`);
    },

    // Changer rôle (Admin)
    changeRole: (userId, role) => {
        return api.put(`/users/${userId}/role`, { role });
    }
};