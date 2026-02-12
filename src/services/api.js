import axios from 'axios';

export const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend-planingmap.onrender.com/api/v1";

export const getImageURL = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${NEXT_PUBLIC_API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

const api = axios.create({
  baseURL: NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true,
});

// Intercepteur pour ajouter token automatiquement
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer erreurs globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré - rediriger vers login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/Connexion';
    }
    return Promise.reject(error);
  }
);

export default api;