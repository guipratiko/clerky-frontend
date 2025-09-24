import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const InstanceContext = createContext();

export const useInstance = () => {
  const context = useContext(InstanceContext);
  if (!context) {
    throw new Error('useInstance must be used within an InstanceProvider');
  }
  return context;
};

export const InstanceProvider = ({ children }) => {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState(null);
  const { user } = useAuth();

  // Carregar instâncias
  const loadInstances = async () => {
    if (!user) return; // Não carregar se não estiver logado
    
    try {
      setLoading(true);
      console.log('📡 API Request: GET /api/instances');
      const response = await api.get('/api/instances');
      console.log('✅ API Response: GET /api/instances');
      setInstances(response.data.data || []);
    } catch (error) {
      console.error('❌ API Response Error: GET /api/instances', error.response?.data);
      if (error.response?.status !== 401) { // Não mostrar toast para erro 401 (será tratado pelo AuthContext)
        const message = error.response?.data?.error || error.message || 'Erro ao carregar instâncias';
        toast.error(message);
      }
      setInstances([]);
    } finally {
      setLoading(false);
    }
  };

  // Criar nova instância
  const createInstance = async (instanceData) => {
    try {
      setLoading(true);
      console.log('📡 API Request: POST /api/instances');
      const response = await api.post('/api/instances', instanceData);
      console.log('✅ API Response: POST /api/instances');
      
      if (response.data.success) {
        await loadInstances();
        toast.success('Instância criada com sucesso!');
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ API Response Error: POST /api/instances', error.response?.data);
      const message = error.response?.data?.error || error.message || 'Erro ao criar instância';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Conectar instância
  const connectInstance = async (instanceName) => {
    try {
      setLoading(true);
      const response = await api.post(`/api/instances/${instanceName}/connect`);
      
      if (response.data.success) {
        await loadInstances();
        toast.success('Conectando instância...');
        return response.data.data;
      }
    } catch (error) {
      console.error('Erro ao conectar instância:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reiniciar instância
  const restartInstance = async (instanceName) => {
    try {
      setLoading(true);
      const response = await api.post(`/api/instances/${instanceName}/restart`);
      
      if (response.data.success) {
        await loadInstances();
        toast.success('Reiniciando instância...');
        return response.data.data;
      }
    } catch (error) {
      console.error('Erro ao reiniciar instância:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout da instância
  const logoutInstance = async (instanceName) => {
    try {
      setLoading(true);
      const response = await api.post(`/api/instances/${instanceName}/logout`);
      
      if (response.data.success) {
        await loadInstances();
        toast.success('Logout realizado!');
        return response.data.data;
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Deletar instância
  const deleteInstance = async (instanceName) => {
    try {
      setLoading(true);
      const response = await api.delete(`/api/instances/${instanceName}`);
      
      if (response.data.success) {
        await loadInstances();
        toast.success('Instância deletada!');
        return true;
      }
    } catch (error) {
      console.error('Erro ao deletar instância:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Obter status da instância
  const getInstanceStatus = async (instanceName) => {
    try {
      const response = await api.get(`/api/instances/${instanceName}/status`);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao obter status:', error);
      throw error;
    }
  };

  // Atualizar configurações da instância
  const updateInstanceSettings = async (instanceName, settings) => {
    try {
      setLoading(true);
      const response = await api.put(`/api/instances/${instanceName}/settings`, { settings });
      
      if (response.data.success) {
        await loadInstances();
        toast.success('Configurações atualizadas!');
        return response.data.data;
      }
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Obter instância por nome
  const getInstance = (instanceName) => {
    return instances.find(instance => instance.instanceName === instanceName);
  };

  // Carregar instâncias quando usuário estiver logado
  useEffect(() => {
    if (user) {
      loadInstances();
    } else {
      setInstances([]); // Limpar instâncias se não estiver logado
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const value = {
    instances,
    loading,
    selectedInstance,
    setSelectedInstance,
    loadInstances,
    createInstance,
    connectInstance,
    restartInstance,
    logoutInstance,
    deleteInstance,
    getInstanceStatus,
    updateInstanceSettings,
    getInstance,
  };

  return (
    <InstanceContext.Provider value={value}>
      {children}
    </InstanceContext.Provider>
  );
};
