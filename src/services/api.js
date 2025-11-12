import axios from 'axios';

// Configurar base URL do axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 60000, // Aumentado para produção
  headers: {
    'Content-Type': 'application/json',
  },
  // Configurações para produção
  withCredentials: false,
  maxRedirects: 5,
  // Configurações de retry para produção
  retry: 3,
  retryDelay: 1000,
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na API:', error);
    
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 402 && error.response?.data?.code === 'TRIAL_EXPIRED') {
      // Trial expirou - desconectar usuário e redirecionar
      console.log('🔒 Trial expirado - desconectando usuário');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirecionar para página de login com mensagem de trial expirado
      localStorage.setItem('trialExpiredMessage', error.response.data.error);
      window.location.href = '/login?trial=expired';
    } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      // Erro de rede - mostrar mensagem amigável
      console.error('Erro de conexão com o servidor');
    } else if (error.response?.status >= 500) {
      // Erro do servidor
      console.error('Erro interno do servidor');
    }
    
    return Promise.reject(error);
  }
);

// Função para buscar nomes dos contatos
export const getContactNames = async (numbers) => {
  try {
    const response = await api.post('/api/contacts/get-names', { numbers });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar nomes dos contatos:', error);
    throw error;
  }
};

// ===== INTEGRAÇÕES N8N =====

// Listar integrações N8N do usuário
export const getN8nIntegrations = async () => {
  try {
    const response = await api.get('/api/n8n-integration');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar integrações N8N:', error);
    throw error;
  }
};

// Criar nova integração N8N
export const createN8nIntegration = async (integrationData) => {
  try {
    const response = await api.post('/api/n8n-integration', integrationData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar integração N8N:', error);
    throw error;
  }
};

// Atualizar integração N8N
export const updateN8nIntegration = async (integrationId, updateData) => {
  try {
    const response = await api.put(`/api/n8n-integration/${integrationId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar integração N8N:', error);
    throw error;
  }
};

// Deletar integração N8N
export const deleteN8nIntegration = async (integrationId) => {
  try {
    const response = await api.delete(`/api/n8n-integration/${integrationId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao deletar integração N8N:', error);
    throw error;
  }
};

// Testar integração N8N
export const testN8nIntegration = async (integrationId, testData = {}) => {
  try {
    const response = await api.post(`/api/n8n-integration/${integrationId}/test`, { testData });
    return response.data;
  } catch (error) {
    console.error('Erro ao testar integração N8N:', error);
    throw error;
  }
};

// Obter estatísticas da integração N8N
export const getN8nIntegrationStats = async (integrationId) => {
  try {
    const response = await api.get(`/api/n8n-integration/${integrationId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter estatísticas da integração N8N:', error);
    throw error;
  }
};

// Ativar/Desativar integração N8N
export const toggleN8nIntegration = async (integrationId, isActive) => {
  try {
    const response = await api.patch(`/api/n8n-integration/${integrationId}/toggle`, { isActive });
    return response.data;
  } catch (error) {
    console.error('Erro ao alterar status da integração N8N:', error);
    throw error;
  }
};

// Listar instâncias do usuário
export const getInstances = async () => {
  try {
    const response = await api.get('/api/n8n-integration/instances/list');
    return response.data;
  } catch (error) {
    console.error('Erro ao listar instâncias:', error);
    throw error;
  }
};

// Testar webhook genérico
export const testWebhook = async (webhookUrl, webhookSecret, testData = {}) => {
  try {
    const response = await api.post('/api/n8n-integration/webhook/test', {
      webhookUrl,
      webhookSecret,
      testData
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao testar webhook:', error);
    throw error;
  }
};

// ===== AI WORKFLOWS =====

// Listar workflows de IA do usuário
export const getAIWorkflows = async () => {
  try {
    const response = await api.get('/api/ai-workflows');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar workflows de IA:', error);
    throw error;
  }
};

// Criar novo workflow de IA
export const createAIWorkflow = async (workflowData) => {
  try {
    const response = await api.post('/api/ai-workflows', workflowData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar workflow de IA:', error);
    throw error;
  }
};

// Obter workflow específico
export const getAIWorkflow = async (workflowId) => {
  try {
    const response = await api.get(`/api/ai-workflows/${workflowId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar workflow de IA:', error);
    throw error;
  }
};

// Atualizar prompt do workflow
export const updateAIWorkflowPrompt = async (workflowId, prompt) => {
  try {
    const response = await api.put(`/api/ai-workflows/${workflowId}/prompt`, { prompt });
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar prompt do workflow:', error);
    throw error;
  }
};

// Atualizar tempo de espera (Wait Time)
export const updateAIWorkflowWaitTime = async (workflowId, waitTime) => {
  try {
    const response = await api.put(`/api/ai-workflows/${workflowId}/wait-time`, { waitTime });
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar Wait Time do workflow:', error);
    throw error;
  }
};

// Atualizar configurações da tool de Kanban
export const updateAIWorkflowKanbanTool = async (workflowId, kanbanToolConfig) => {
  try {
    const response = await api.put(`/api/ai-workflows/${workflowId}/kanban-tool`, kanbanToolConfig);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar Kanban Tool do workflow:', error);
    throw error;
  }
};

// Atualizar configuração de resposta em áudio
export const updateAIWorkflowAudioReply = async (workflowId, audioReplyConfig) => {
  try {
    const response = await api.put(`/api/ai-workflows/${workflowId}/audio-reply`, audioReplyConfig);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar resposta em áudio do workflow:', error);
    throw error;
  }
};

// Atualizar configuração de resposta única por contato
export const updateAIWorkflowSingleReply = async (workflowId, singleReplyConfig) => {
  try {
    const response = await api.put(`/api/ai-workflows/${workflowId}/single-reply`, singleReplyConfig);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar resposta única do workflow:', error);
    throw error;
  }
};

// Testar workflow
export const testAIWorkflow = async (workflowId, testMessage) => {
  try {
    const response = await api.post(`/api/ai-workflows/${workflowId}/test`, { message: testMessage });
    return response.data;
  } catch (error) {
    console.error('Erro ao testar workflow de IA:', error);
    throw error;
  }
};

// Ativar/Desativar workflow
export const toggleAIWorkflow = async (workflowId, isActive) => {
  try {
    const response = await api.put(`/api/ai-workflows/${workflowId}/toggle`, { isActive });
    return response.data;
  } catch (error) {
    console.error('Erro ao alterar status do workflow:', error);
    throw error;
  }
};

// Obter estatísticas do workflow
export const getAIWorkflowStats = async (workflowId) => {
  try {
    const response = await api.get(`/api/ai-workflows/${workflowId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter estatísticas do workflow:', error);
    throw error;
  }
};

// Deletar workflow
export const deleteAIWorkflow = async (workflowId) => {
  try {
    const response = await api.delete(`/api/ai-workflows/${workflowId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao deletar workflow de IA:', error);
    throw error;
  }
};

// ========== FUNÇÕES DE CRM ==========

// Buscar histórico de um contato
export const getContactHistory = async (instanceName, contactId, limit = 50, offset = 0) => {
  try {
    const response = await api.get(`/api/contact-crm/history/${instanceName}/${contactId}`, {
      params: { limit, offset }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar histórico do contato:', error);
    throw error;
  }
};

// Adicionar entrada no histórico
export const addContactHistory = async (data) => {
  try {
    const response = await api.post('/api/contact-crm/history', data);
    return response.data;
  } catch (error) {
    console.error('Erro ao adicionar histórico:', error);
    throw error;
  }
};

// Buscar tarefas de um contato
export const getContactTasks = async (instanceName, contactId, status = null, limit = 50, offset = 0) => {
  try {
    const params = { limit, offset };
    if (status) params.status = status;
    
    const response = await api.get(`/api/contact-crm/tasks/${instanceName}/${contactId}`, {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar tarefas do contato:', error);
    throw error;
  }
};

// Criar nova tarefa
export const createContactTask = async (data) => {
  try {
    const response = await api.post('/api/contact-crm/tasks', data);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    throw error;
  }
};

// Atualizar tarefa
export const updateContactTask = async (taskId, data) => {
  try {
    const response = await api.put(`/api/contact-crm/tasks/${taskId}`, data);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    throw error;
  }
};

// Deletar tarefa
export const deleteContactTask = async (taskId) => {
  try {
    const response = await api.delete(`/api/contact-crm/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    throw error;
  }
};

export default api;
