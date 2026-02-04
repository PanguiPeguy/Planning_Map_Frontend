"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/src/services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Vérifier si le token est encore valide
          const result = await authService.getCurrentUser();
          if (result.success) {
            setUser(result.data);
          } else {
            // Token invalide, déconnecter
            authService.logout();
            setUser(null);
          }
        } catch (error) {
          authService.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Connexion
  const login = async (email, password) => {
    const result = await authService.login(email, password);
    if (result.success) {
      setUser(result.data);
    }
    return result;
  };

  // Inscription
  const register = async (userData) => {
    const result = await authService.register(userData);
    if (result.success) {
      setUser(result.data);
    }
    return result;
  };

  // Déconnexion
  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/Connexion');
  };

  // Vérifier si authentifié
  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('token');
  };

  // Vérifier rôle admin
  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    refreshUser: async () => {
      const result = await authService.getCurrentUser();
      if (result.success) {
        setUser(result.data);
        localStorage.setItem('user', JSON.stringify(result.data));
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}