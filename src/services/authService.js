import api from './api';

export const authService = {
    // Connexion
    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, ...userInfo } = response.data;

            // Sauvegarder dans localStorage
            const userWithId = { ...userInfo, userId: userInfo.id };
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userWithId));

            // Configurer axios pour les futures requêtes
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Email ou mot de passe incorrect'
            };
        }
    },

    // Inscription
  register: async (userData) => {
    try {
      console.log('Envoi au backend:', userData); // Debug
      
      const response = await api.post('/auth/register', userData, {
        // Axios envoie automatiquement en JSON avec le bon Content-Type
      });
      
      const { token, ...userInfo } = response.data;

      // Sauvegarder dans localStorage
      const userWithId = { ...userInfo, userId: userInfo.id };
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userWithId));

      // Configurer axios pour les futures requêtes
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur détaillée:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de l\'inscription',
        validationErrors: error.response?.data?.errors,
        status: error.response?.status
      };
    }
  },

    // Déconnexion
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
    },

    // Vérifier token
    checkAuth: () => {
        const token = localStorage.getItem('token');
        return !!token;
    },

    getCurrentUser: async () => {
        try {
            const response = await api.get('/users/me');
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message };
        }
    },

    getUser: () => {
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        }
        return null;
    }
};

export default authService;