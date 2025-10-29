import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useToastMessages } from '../hooks/useToastMessages';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const toastMessages = useToastMessages();

  // Configurar axios com token
  // Interceptor já configurado no api.js

  // Logout
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    toast.success(toastMessages.logoutSuccess);
  }, [toastMessages.logoutSuccess]);

  // Verificar se usuário está logado ao carregar a aplicação
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await api.get('/api/auth/me');
          setUser(response.data.data.user);
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token, logout]);

  // Login
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/api/auth/login', {
        email,
        password
      });

      const { user: userData, token: userToken } = response.data.data;
      
      setUser(userData);
      setToken(userToken);
      localStorage.setItem('token', userToken);
      
      toast.success(toastMessages.loginSuccess);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || toastMessages.loginError;
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Registro
  const register = async (name, email, password, cpf, phone) => {
    try {
      setLoading(true);
      const response = await api.post('/api/auth/register', {
        name,
        email,
        password,
        cpf,
        phone
      });

      toast.success(response.data.message);
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.error || toastMessages.registerError;
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Verificar se é admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // Verificar se está aprovado
  const isApproved = () => {
    return user?.status === 'approved';
  };

  // Verificar se está em período de trial
  const isInTrial = () => {
    return user?.isInTrial === true;
  };

  // Obter dias restantes do trial
  const getTrialDaysRemaining = () => {
    if (!user?.trialEndsAt) return 0;
    const now = new Date();
    const endDate = new Date(user.trialEndsAt);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Obter usuários pendentes (admin)
  const getPendingUsers = async () => {
    try {
      const response = await api.get('/api/auth/pending-users');
      return response.data.data;
    } catch (error) {
      toast.error('Erro ao carregar usuários pendentes');
      throw error;
    }
  };

  // Aprovar/rejeitar usuário (admin)
  const approveUser = async (userId, action) => {
    try {
      const response = await api.post(`/api/auth/approve-user/${userId}`, {
        action
      });
      
      const actionText = action === 'approve' ? 'aprovado' : 'rejeitado';
      toast.success(`Usuário ${actionText} com sucesso!`);
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || `Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} usuário`;
      toast.error(errorMessage);
      throw error;
    }
  };

  // Obter todos usuários (admin)
  const getAllUsers = async () => {
    try {
      const response = await api.get('/api/auth/users');
      return response.data.data;
    } catch (error) {
      toast.error('Erro ao carregar usuários');
      throw error;
    }
  };

  // Recarregar dados do usuário
  const refreshUser = async () => {
    if (token) {
      try {
        const response = await api.get('/api/auth/me');
        setUser(response.data.data.user);
        return response.data.data.user;
      } catch (error) {
        console.error('Erro ao recarregar dados do usuário:', error);
        throw error;
      }
    }
  };

  const value = {
    user,
    loading,
    token,
    login,
    register,
    logout,
    isAdmin,
    isApproved,
    isInTrial,
    getTrialDaysRemaining,
    getPendingUsers,
    approveUser,
    getAllUsers,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
