import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  LinearProgress,
  Paper,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  CloudUpload as CloudUploadIcon,
  Description as FileIcon,
  Image as ImageIcon,
  AudioFile as AudioIcon,
  AttachFile as AttachIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  // AccessTime as TimeIcon,
  // CalendarToday as CalendarIcon,
  PlayCircleOutline as PlayCircleIcon,
  PauseCircleOutline as PauseCircleIcon
} from '@mui/icons-material';
import { useInstance } from '../contexts/InstanceContext';
import { useSocket } from '../contexts/SocketContext';
import { useI18n } from '../contexts/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const MassDispatch = () => {
  const { instances } = useInstance();
  const { socket } = useSocket();
  const { t } = useI18n();
  const { user, isInTrial, getTrialDaysRemaining, isAdmin } = useAuth();
  
  // Estados principais
  const [dispatches, setDispatches] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  
  // Estados dos diálogos
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState(null);
  
  // Estados para seleção de contatos do Kanban
  const [kanbanColumns, setKanbanColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [columnContacts, setColumnContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  
  // Estados do formulário de criação
  const [formData, setFormData] = useState({
    name: '',
    instanceName: '',
    selectedTemplate: '',
    numbers: '',
    file: null,
    kanbanColumn: '',
    settings: {
      speed: 'normal',
      validateNumbers: true,
      removeNinthDigit: true,
      personalization: {
        enabled: false,
        defaultName: 'Cliente'
      },
      schedule: {
        enabled: false,
        startTime: '08:00',
        endTime: '18:00',
        daysOfWeek: [1, 2, 3, 4, 5],
        timezone: 'America/Sao_Paulo'
      }
    }
  });
  
  // Estados do template
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    type: 'text',
    text: '',
    caption: '',
    fileName: '',
    media: null
  });

  // Estados para agendamento
  const [schedulingEnabled, setSchedulingEnabled] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    startDate: '',
    startTime: '',
    pauseDate: '',
    pauseTime: '',
    resumeDate: '',
    resumeTime: '',
    timezone: 'America/Sao_Paulo'
  });
  const [scheduledDispatches, setScheduledDispatches] = useState([]);
  // const [activeScheduledDispatch, setActiveScheduledDispatch] = useState(null);

  const speedOptions = [
    { value: 'fast', label: 'Rápido (2 segundos)', description: 'Ideal para listas pequenas' },
    { value: 'normal', label: 'Normal (30 segundos)', description: 'Recomendado para a maioria dos casos' },
    { value: 'slow', label: 'Lento (1 minuto)', description: 'Mais seguro, menor chance de bloqueio' },
    { value: 'random', label: 'Randomizado (45-85s)', description: 'Intervalos aleatórios para evitar detecção' }
  ];

  // Carregar colunas do Kanban
  const loadKanbanColumns = async (instanceName) => {
    try {
      const response = await api.get(`/api/chats/${instanceName}/kanban/columns`);
      if (response.data.success) {
        setKanbanColumns(response.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar colunas do Kanban:', error);
    }
  };

  // Carregar contatos de uma coluna específica
  const loadColumnContacts = async (instanceName, columnId) => {
    try {
      setLoadingContacts(true);
      const response = await api.get(`/api/chats/${instanceName}/kanban/column/${columnId}/contacts`);
      if (response.data.success) {
        const contacts = response.data.data || [];
        setColumnContacts(contacts);
        
        // Extrair números dos contatos e adicionar ao campo numbers
        const numbers = contacts.map(contact => contact.chatId?.replace('@s.whatsapp.net', '')).join('\n');
        setFormData(prev => ({ ...prev, numbers }));
        
        toast.success(`${contacts.length} contatos carregados da coluna`);
      }
    } catch (error) {
      console.error('Erro ao carregar contatos da coluna:', error);
      toast.error('Erro ao carregar contatos da coluna');
    } finally {
      setLoadingContacts(false);
    }
  };

  // Carregar dados iniciais (apenas se não estiver em trial ou for admin)
  useEffect(() => {
    // Aguardar usuário estar carregado
    if (!user) return;
    
    // Não carregar dados se usuário estiver em trial (exceto admins)
    if (!isAdmin() && isInTrial()) {
      console.log('⚠️ Usuário em trial - dados de disparo não carregados');
      return;
    }
    
    loadDispatches();
    loadTemplates();
    loadStats();
    loadScheduledDispatches();
  }, [user]);

  // Carregar colunas do Kanban quando a instância mudar
  useEffect(() => {
    if (formData.instanceName) {
      loadKanbanColumns(formData.instanceName);
      setSelectedColumn('');
      setColumnContacts([]);
    }
  }, [formData.instanceName]);

  // Escutar eventos WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleDispatchUpdate = (data) => {
      console.log('Disparo atualizado:', data);
      loadDispatches();
      loadStats();
    };

    const handleDispatchProgress = (data) => {
      console.log('Progresso do disparo:', data);
      setDispatches(prev => prev.map(dispatch => 
        dispatch._id === data.dispatchId 
          ? { ...dispatch, progress: data.progress, statistics: data.statistics }
          : dispatch
      ));
    };

    socket.on('mass-dispatch-updated', handleDispatchUpdate);
    socket.on('mass-dispatch-started', handleDispatchUpdate);
    socket.on('mass-dispatch-completed', handleDispatchUpdate);
    socket.on('mass-dispatch-paused', handleDispatchUpdate);
    socket.on('mass-dispatch-cancelled', handleDispatchUpdate);
    socket.on('mass-dispatch-progress', handleDispatchProgress);

    return () => {
      socket.off('mass-dispatch-updated', handleDispatchUpdate);
      socket.off('mass-dispatch-started', handleDispatchUpdate);
      socket.off('mass-dispatch-completed', handleDispatchUpdate);
      socket.off('mass-dispatch-paused', handleDispatchUpdate);
      socket.off('mass-dispatch-cancelled', handleDispatchUpdate);
      socket.off('mass-dispatch-progress', handleDispatchProgress);
    };
  }, [socket]);

  // Verificar periodicamente se é hora de iniciar disparos agendados
  useEffect(() => {
    const interval = setInterval(() => {
      // Forçar re-render dos componentes para atualizar botões
      setScheduledDispatches(prev => [...prev]);
    }, 60000); // Verificar a cada minuto

    return () => clearInterval(interval);
  }, []);

  // Funções de carregamento
  const loadDispatches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/mass-dispatch');
      setDispatches(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar disparos:', error);
      toast.error('Erro ao carregar disparos');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await api.get('/api/mass-dispatch/templates/list');
      setTemplates(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      toast.error('Erro ao carregar templates');
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/api/mass-dispatch/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  // Criar disparo
  const handleCreateDispatch = async () => {
    try {
      setLoading(true);

      // Validar dados obrigatórios
      if (!formData.name || !formData.instanceName || !formData.selectedTemplate) {
        toast.error('Nome, instância e template são obrigatórios');
        return;
      }

      if (!formData.numbers.trim() && !formData.file) {
        toast.error('Adicione números manualmente ou faça upload de um arquivo');
        return;
      }

      // Buscar template selecionado
      const selectedTemplate = templates.find(t => t._id === formData.selectedTemplate);
      if (!selectedTemplate) {
        toast.error('Template não encontrado');
        return;
      }

      // 1. Criar o disparo
      const dispatchData = {
        name: formData.name,
        instanceName: formData.instanceName,
        template: {
          type: selectedTemplate.type,
          content: selectedTemplate.content
        },
        settings: formData.settings,
        // Adicionar dados de agendamento se ativado
        ...(schedulingEnabled && {
          schedule: {
            enabled: true,
            startDateTime: scheduleData.startDate && scheduleData.startTime ? 
              new Date(`${scheduleData.startDate}T${scheduleData.startTime}`).toISOString() : null,
            pauseDateTime: scheduleData.pauseDate && scheduleData.pauseTime ? 
              new Date(`${scheduleData.pauseDate}T${scheduleData.pauseTime}`).toISOString() : null,
            resumeDateTime: scheduleData.resumeDate && scheduleData.resumeTime ? 
              new Date(`${scheduleData.resumeDate}T${scheduleData.resumeTime}`).toISOString() : null,
            timezone: scheduleData.timezone
          }
        })
      };

      console.log('📅 Criando disparo com dados:', {
        schedulingEnabled,
        scheduleData,
        dispatchData: schedulingEnabled ? dispatchData.schedule : 'Não agendado'
      });

      const createResponse = await api.post('/api/mass-dispatch', dispatchData);
      const dispatchId = createResponse.data.data._id;

      // 2. Upload dos números
      const uploadData = new FormData();
      
      if (formData.file) {
        uploadData.append('file', formData.file);
      }
      
      if (formData.numbers.trim()) {
        uploadData.append('numbers', formData.numbers.trim());
      }

      await api.post(`/api/mass-dispatch/${dispatchId}/upload-numbers`, uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success(t('massDispatch.dispatchCreated'));
      setCreateDialogOpen(false);
      resetForm();
      loadDispatches();
      loadScheduledDispatches(); // Atualizar lista de disparos agendados

    } catch (error) {
      console.error('Erro ao criar disparo:', error);
      toast.error(error.response?.data?.error || t('massDispatch.dispatchCreateError'));
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      instanceName: '',
      selectedTemplate: '',
      numbers: '',
      file: null,
      kanbanColumn: '',
      settings: {
        speed: 'normal',
        validateNumbers: true,
        removeNinthDigit: true,
        personalization: {
          enabled: false,
          defaultName: 'Cliente'
        },
        schedule: {
          enabled: false,
          startTime: '08:00',
          endTime: '18:00',
          daysOfWeek: [1, 2, 3, 4, 5],
          timezone: 'America/Sao_Paulo'
        }
      }
    });
    setSchedulingEnabled(false);
    setScheduleData({
      startDate: '',
      startTime: '',
      pauseDate: '',
      pauseTime: '',
      resumeDate: '',
      resumeTime: '',
      timezone: 'America/Sao_Paulo'
    });
  };

  // Funções para gerenciar disparos agendados
  const handleStartScheduledDispatch = async (dispatchId) => {
    try {
      // Buscar dados do disparo agendado
      const dispatch = scheduledDispatches.find(d => d.id === dispatchId);
      if (!dispatch) {
        toast.error(t('massDispatch.scheduledDispatchNotFound'));
        return;
      }

      // Verificar se é hora de iniciar
      if (dispatch.schedule && dispatch.schedule.startDateTime) {
        const startTime = new Date(dispatch.schedule.startDateTime);
        const now = new Date();
        
        if (now < startTime) {
          const timeDiff = startTime - now;
          const hours = Math.floor(timeDiff / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          
          toast.error(t('massDispatch.scheduledDispatchTimeError', { 
            time: startTime.toLocaleString('pt-BR'), 
            hours, 
            minutes 
          }));
          return;
        }
      }

      const response = await api.post(`/api/mass-dispatch/${dispatchId}/start`);
      if (response.data.success) {
        toast.success(t('massDispatch.scheduledDispatchStarted'));
        loadScheduledDispatches();
      }
    } catch (error) {
      console.error('Erro ao iniciar disparo agendado:', error);
      
      // Tratar erro específico de agendamento
      if (error.response?.status === 400 && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error(t('massDispatch.scheduledDispatchStartError'));
      }
    }
  };

  const handlePauseDispatch = async (dispatchId) => {
    try {
      const response = await api.post(`/api/mass-dispatch/${dispatchId}/pause`);
      if (response.data.success) {
        toast.success(t('massDispatch.dispatchPaused'));
        loadScheduledDispatches();
      }
    } catch (error) {
      console.error('Erro ao pausar disparo:', error);
      toast.error(t('massDispatch.dispatchPauseError'));
    }
  };

  const handleResumeDispatch = async (dispatchId) => {
    try {
      const response = await api.post(`/api/mass-dispatch/${dispatchId}/resume`);
      if (response.data.success) {
        toast.success(t('massDispatch.dispatchResumed'));
        loadScheduledDispatches();
      }
    } catch (error) {
      console.error('Erro ao retomar disparo:', error);
      toast.error(t('massDispatch.dispatchResumeError'));
    }
  };

  const handleCancelScheduledDispatch = async (dispatchId) => {
    if (!window.confirm(t('massDispatch.confirmCancelScheduled'))) return;
    
    try {
      const response = await api.delete(`/api/mass-dispatch/${dispatchId}`);
      if (response.data.success) {
        toast.success(t('massDispatch.scheduledDispatchCancelled'));
        loadScheduledDispatches();
      }
    } catch (error) {
      console.error('Erro ao cancelar disparo agendado:', error);
      toast.error(t('massDispatch.scheduledDispatchCancelError'));
    }
  };

  const loadScheduledDispatches = async () => {
    try {
      const response = await api.get('/api/mass-dispatch/scheduled');
      if (response.data.success) {
        console.log('📅 Disparos agendados carregados:', response.data.data);
        setScheduledDispatches(response.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar disparos agendados:', error);
    }
  };

  // Função auxiliar para calcular tempo restante
  const getTimeRemaining = (targetDate) => {
    if (!targetDate) return null;
    
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target - now;
    
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}min`;
    return `${minutes}min`;
  };

  // Criar template
  const handleCreateTemplate = async () => {
    try {
      setLoading(true);

      const templateData = new FormData();
      templateData.append('name', templateForm.name);
      templateData.append('description', templateForm.description);
      templateData.append('type', templateForm.type);

      if (templateForm.text) templateData.append('text', templateForm.text);
      if (templateForm.caption) templateData.append('caption', templateForm.caption);
      if (templateForm.fileName) templateData.append('fileName', templateForm.fileName);
      if (templateForm.media) templateData.append('media', templateForm.media);

      await api.post('/api/mass-dispatch/templates', templateData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success(t('massDispatch.templateCreated'));
      setTemplateDialogOpen(false);
      setTemplateForm({
        name: '',
        description: '',
        type: 'text',
        text: '',
        caption: '',
        fileName: '',
        media: null
      });
      loadTemplates();

    } catch (error) {
      console.error('Erro ao criar template:', error);
      toast.error(error.response?.data?.error || t('massDispatch.templateCreateError'));
    } finally {
      setLoading(false);
    }
  };

  // Excluir template
  const handleDeleteTemplate = async (templateId) => {
    try {
      if (!window.confirm(t('massDispatch.confirmDeleteTemplate'))) {
        return;
      }

      setLoading(true);
      await api.delete(`/api/mass-dispatch/templates/${templateId}`);
      
      toast.success(t('massDispatch.templateDeleted'));
      loadTemplates();

    } catch (error) {
      console.error('Erro ao excluir template:', error);
      toast.error(error.response?.data?.error || t('massDispatch.templateDeleteError'));
    } finally {
      setLoading(false);
    }
  };

  // Ações do disparo
  const handleStartDispatch = async (dispatchId) => {
    try {
      await api.post(`/api/mass-dispatch/${dispatchId}/start`);
      toast.success(t('massDispatch.dispatchStarted'));
      loadDispatches();
    } catch (error) {
      console.error('Erro ao iniciar disparo:', error);
      toast.error(error.response?.data?.error || t('massDispatch.dispatchStartError'));
    }
  };

  const handleCancelDispatch = async (dispatchId) => {
    if (!window.confirm(t('massDispatch.confirmCancelDispatch'))) return;

    try {
      await api.post(`/api/mass-dispatch/${dispatchId}/cancel`);
      toast.success(t('massDispatch.dispatchCancelled'));
      loadDispatches();
    } catch (error) {
      console.error('Erro ao cancelar disparo:', error);
      toast.error(error.response?.data?.error || t('massDispatch.dispatchCancelError'));
    }
  };

  const handleDeleteDispatch = async (dispatchId) => {
    if (!window.confirm(t('massDispatch.confirmDeleteDispatch'))) return;

    try {
      await api.delete(`/api/mass-dispatch/${dispatchId}`);
      toast.success(t('massDispatch.dispatchDeleted'));
      loadDispatches();
    } catch (error) {
      console.error('Erro ao deletar disparo:', error);
      toast.error(error.response?.data?.error || t('massDispatch.dispatchDeleteError'));
    }
  };

  // Função para obter cor do status
  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      validating: 'info',
      ready: 'success',
      running: 'warning',
      paused: 'warning',
      completed: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  // Função para obter texto do status
  const getStatusText = (status) => {
    const texts = {
      draft: t('massDispatch.status.draft'),
      validating: t('massDispatch.status.validating'),
      ready: t('massDispatch.status.ready'),
      running: t('massDispatch.status.running'),
      paused: t('massDispatch.status.paused'),
      completed: t('massDispatch.status.completed'),
      cancelled: t('massDispatch.status.cancelled')
    };
    return texts[status] || status;
  };

  // Função para obter ícone do tipo de template
  const getTemplateIcon = (type) => {
    const icons = {
      text: <FileIcon />,
      image: <ImageIcon />,
      image_caption: <ImageIcon />,
      audio: <AudioIcon />,
      file: <AttachIcon />,
      file_caption: <AttachIcon />
    };
    return icons[type] || <FileIcon />;
  };

  // Verificar se usuário está em trial (exceto admins)
  const showTrialWarning = !isAdmin() && isInTrial();
  const trialDaysRemaining = getTrialDaysRemaining();

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      {/* Aviso de Trial */}
      {showTrialWarning && (
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: '2px solid #fff',
          boxShadow: '0 8px 32px 0 rgba(102, 126, 234, 0.37)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <WarningIcon sx={{ fontSize: 40, color: '#fff' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold', mb: 1 }}>
                🎯 Período de Teste - Funcionalidade Restrita
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 1 }}>
                Você está no período de teste de 7 dias e esta funcionalidade não está disponível durante este período.
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                ⏰ <strong>{trialDaysRemaining} dias restantes</strong> | Após a aprovação completa da sua conta, você terá acesso total ao Disparo em Massa.
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" sx={{ color: '#e9edef', fontWeight: 'bold', mb: 1 }}>
            {t('massDispatch.title')}
          </Typography>
          <Typography variant="body1" sx={{ color: '#8696a0' }}>
            {t('massDispatch.pageDescription')}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setTemplateDialogOpen(true)}
          >
            {t('massDispatch.newTemplate')}
          </Button>
          
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ background: '#00a884', '&:hover': { background: '#008069' } }}
          >
            {t('massDispatch.newDispatch')}
          </Button>
        </Box>
      </Box>

      {/* Seção de Templates */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#e9edef' }}>
          {t('massDispatch.availableTemplates')}
        </Typography>
        
        {templates.length === 0 ? (
          <Card sx={{ background: '#202c33', border: '1px solid #313d43', p: 3, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: '#8696a0', mb: 2 }}>
              {t('massDispatch.noTemplatesCreated')}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setTemplateDialogOpen(true)}
              sx={{
                borderColor: '#00a884',
                color: '#00a884',
                '&:hover': { borderColor: '#008069', backgroundColor: 'rgba(0, 168, 132, 0.1)' }
              }}
            >
              {t('massDispatch.createFirstTemplate')}
            </Button>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {templates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template._id}>
                <Card sx={{ 
                  background: '#202c33', 
                  border: '1px solid #313d43',
                  '&:hover': { borderColor: '#00a884' },
                  transition: 'border-color 0.3s ease'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTemplateIcon(template.type)}
                        <Typography variant="h6" sx={{ color: '#e9edef' }}>
                          {template.name}
                        </Typography>
                      </Box>
                      <Tooltip title={t('massDispatch.deleteTemplate')}>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteTemplate(template._id)}
                          sx={{ 
                            color: '#f15c6d',
                            '&:hover': { backgroundColor: 'rgba(241, 92, 109, 0.1)' }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <Typography variant="body2" sx={{ color: '#8696a0', mb: 1 }}>
                      {template.description || t('massDispatch.noDescription')}
                    </Typography>
                    
                    <Chip 
                      label={template.type === 'text' ? t('massDispatch.templateTypes.text') : 
                             template.type === 'image' ? t('massDispatch.templateTypes.image') :
                             template.type === 'image_caption' ? t('massDispatch.templateTypes.imageCaption') :
                             template.type === 'audio' ? t('massDispatch.templateTypes.audio') :
                             template.type === 'file' ? t('massDispatch.templateTypes.file') :
                             template.type === 'file_caption' ? t('massDispatch.templateTypes.fileCaption') : t('massDispatch.templateTypes.unknown')}
                      size="small"
                      sx={{ 
                        backgroundColor: '#313d43',
                        color: '#8696a0',
                        fontSize: '0.75rem'
                      }}
                    />
                    
                    {template.content?.text && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#e9edef', 
                          mt: 1, 
                          fontStyle: 'italic',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        "{template.content.text}"
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Disparos Agendados */}
      {scheduledDispatches.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 2, color: '#e9edef', display: 'flex', alignItems: 'center' }}>
            <ScheduleIcon sx={{ mr: 1, color: '#667eea' }} />
            {t('massDispatch.scheduledDispatches')}
          </Typography>
          <Grid container spacing={2}>
            {scheduledDispatches.map((dispatch, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ 
                  background: '#202c33', 
                  border: '1px solid #313d43',
                  position: 'relative',
                  overflow: 'visible'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" sx={{ color: '#e9edef', fontSize: '1rem' }}>
                        {dispatch.name}
                      </Typography>
                      <Chip 
                        label={dispatch.status === 'scheduled' ? t('massDispatch.status.scheduled') : 
                               dispatch.status === 'paused' ? t('massDispatch.status.paused') : 
                               dispatch.status === 'running' ? t('massDispatch.status.running') : t('massDispatch.status.completed')}
                        size="small"
                        sx={{
                          backgroundColor: dispatch.status === 'scheduled' ? 'rgba(102, 126, 234,0.2)' :
                                         dispatch.status === 'paused' ? 'rgba(255, 193, 7,0.2)' :
                                         dispatch.status === 'running' ? 'rgba(0, 168, 132,0.2)' : 'rgba(76, 175, 80,0.2)',
                          color: dispatch.status === 'scheduled' ? '#667eea' :
                                 dispatch.status === 'paused' ? '#ffc107' :
                                 dispatch.status === 'running' ? '#00a884' : '#4caf50',
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>
                    
                    <Typography variant="body2" sx={{ color: '#8696a0', mb: 1 }}>
                      📅 {t('massDispatch.schedule.start')}: {new Date(dispatch.schedule.startDateTime).toLocaleString('pt-BR')}
                      {dispatch.status === 'scheduled' && dispatch.schedule?.startDateTime && new Date(dispatch.schedule.startDateTime) > new Date() && (
                        <Typography component="span" variant="caption" sx={{ color: '#ffc107', ml: 1 }}>
                          ({t('massDispatch.schedule.timeRemaining')} {getTimeRemaining(dispatch.schedule.startDateTime)})
                        </Typography>
                      )}
                    </Typography>
                    
                    {dispatch.schedule.pauseDateTime && (
                      <Typography variant="body2" sx={{ color: '#8696a0', mb: 1 }}>
                        ⏸️ {t('massDispatch.schedule.pause')}: {new Date(dispatch.schedule.pauseDateTime).toLocaleString('pt-BR')}
                      </Typography>
                    )}
                    
                    {dispatch.schedule.resumeDateTime && (
                      <Typography variant="body2" sx={{ color: '#8696a0', mb: 1 }}>
                        ▶️ {t('massDispatch.schedule.resume')}: {new Date(dispatch.schedule.resumeDateTime).toLocaleString('pt-BR')}
                      </Typography>
                    )}
                    
                    <Typography variant="caption" sx={{ color: '#8696a0', display: 'block' }}>
                      📱 {dispatch.instanceName} • 📊 {dispatch.numbers?.split('\n').length || 0} {t('massDispatch.numbers')}
                    </Typography>
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {dispatch.status === 'scheduled' && (
                        <Button
                          size="small"
                          startIcon={<PlayIcon />}
                          onClick={() => handleStartScheduledDispatch(dispatch.id)}
                          disabled={dispatch.schedule?.startDateTime && new Date(dispatch.schedule.startDateTime) > new Date()}
                          sx={{ 
                            color: dispatch.schedule?.startDateTime && new Date(dispatch.schedule.startDateTime) > new Date() ? 
                              'rgba(255,255,255,0.3)' : '#00a884',
                            fontSize: '0.7rem',
                            minWidth: 'auto',
                            px: 1,
                            '&:disabled': {
                              color: 'rgba(255,255,255,0.3)'
                            }
                          }}
                        >
                          {dispatch.schedule?.startDateTime && new Date(dispatch.schedule.startDateTime) > new Date() ? 
                            t('massDispatch.waiting') : t('massDispatch.start')}
                        </Button>
                      )}
                      
                      {dispatch.status === 'running' && (
                        <Button
                          size="small"
                          startIcon={<PauseIcon />}
                          onClick={() => handlePauseDispatch(dispatch.id)}
                          sx={{ 
                            color: '#ffc107',
                            fontSize: '0.7rem',
                            minWidth: 'auto',
                            px: 1
                          }}
                        >
                          {t('massDispatch.pause')}
                        </Button>
                      )}
                      
                      {dispatch.status === 'paused' && (
                        <Button
                          size="small"
                          startIcon={<PlayIcon />}
                          onClick={() => handleResumeDispatch(dispatch.id)}
                          sx={{ 
                            color: '#00a884',
                            fontSize: '0.7rem',
                            minWidth: 'auto',
                            px: 1
                          }}
                        >
                          {t('massDispatch.resume')}
                        </Button>
                      )}
                    </Box>
                    
                    <Button
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleCancelScheduledDispatch(dispatch.id)}
                      sx={{ 
                        color: '#f44336',
                        fontSize: '0.7rem',
                        minWidth: 'auto',
                        px: 1
                      }}
                    >
                      Cancelar
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Estatísticas */}
      {stats && Object.keys(stats).length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ background: '#202c33', border: '1px solid #313d43' }}>
              <CardContent>
                <Typography variant="h4" sx={{ color: '#00a884', fontWeight: 'bold' }}>
                  {stats.total || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#8696a0' }}>
                  Total de Disparos
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card sx={{ background: '#202c33', border: '1px solid #313d43' }}>
              <CardContent>
                <Typography variant="h4" sx={{ color: '#ffab00', fontWeight: 'bold' }}>
                  {stats.running || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#8696a0' }}>
                  Em Execução
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card sx={{ background: '#202c33', border: '1px solid #313d43' }}>
              <CardContent>
                <Typography variant="h4" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                  {stats.totalMessagesSent || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#8696a0' }}>
                  Mensagens Enviadas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card sx={{ background: '#202c33', border: '1px solid #313d43' }}>
              <CardContent>
                <Typography variant="h4" sx={{ color: '#f15c6d', fontWeight: 'bold' }}>
                  {stats.totalMessagesFailed || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#8696a0' }}>
                  Falhas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Lista de Disparos */}
      <Grid container spacing={3}>
        {dispatches.map((dispatch) => (
          <Grid item xs={12} md={6} lg={4} key={dispatch._id}>
            <Card
              sx={{
                background: '#202c33',
                border: '1px solid #313d43',
                transition: 'all 0.2s',
                '&:hover': {
                  background: '#2a3942',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ color: '#e9edef', mb: 1 }}>
                      {dispatch.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#8696a0', mb: 1 }}>
                      Instância: {dispatch.instanceName}
                    </Typography>
                    <Chip
                      label={getStatusText(dispatch.status)}
                      color={getStatusColor(dispatch.status)}
                      size="small"
                    />
                  </Box>
                </Box>

                {/* Progresso */}
                {dispatch.status === 'running' && dispatch.progress && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ color: '#8696a0', mb: 1 }}>
                      {t('massDispatch.progress.label')}: {dispatch.progress.current}/{dispatch.progress.total} ({dispatch.progress.percentage}%)
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={dispatch.progress.percentage} 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: '#313d43',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#00a884'
                        }
                      }} 
                    />
                  </Box>
                )}

                {/* Estatísticas */}
                <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: '#8696a0' }}>
                    {t('massDispatch.stats.total')}: {dispatch.statistics?.total || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#00a884' }}>
                    {t('massDispatch.stats.sent')}: {dispatch.statistics?.sent || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#f15c6d' }}>
                    {t('massDispatch.stats.failed')}: {dispatch.statistics?.failed || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#ffab00' }}>
                    {t('massDispatch.stats.pending')}: {dispatch.statistics?.pending || 0}
                  </Typography>
                </Box>

                {/* Template */}
                <Box sx={{ mt: 2, p: 1, background: '#313d43', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: '#8696a0', display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getTemplateIcon(dispatch.template?.type)}
                    Template: {dispatch.template?.type === 'text' ? 'Texto' : 
                              dispatch.template?.type === 'image' ? 'Imagem' :
                              dispatch.template?.type === 'image_caption' ? 'Imagem + Legenda' :
                              dispatch.template?.type === 'audio' ? 'Áudio' :
                              dispatch.template?.type === 'file' ? 'Arquivo' :
                              dispatch.template?.type === 'file_caption' ? 'Arquivo + Legenda' : 'Desconhecido'}
                  </Typography>
                </Box>
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {dispatch.status === 'ready' && (
                    <Tooltip title="Iniciar Disparo">
                      <IconButton
                        onClick={() => handleStartDispatch(dispatch._id)}
                        sx={{ color: '#00a884' }}
                      >
                        <PlayIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  {dispatch.status === 'running' && (
                    <Tooltip title="Pausar Disparo">
                      <IconButton
                        onClick={() => handlePauseDispatch(dispatch._id)}
                        sx={{ color: '#ffab00' }}
                      >
                        <PauseIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  {(dispatch.status === 'running' || dispatch.status === 'paused') && (
                    <Tooltip title="Cancelar Disparo">
                      <IconButton
                        onClick={() => handleCancelDispatch(dispatch._id)}
                        sx={{ color: '#f15c6d' }}
                      >
                        <StopIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  <Tooltip title="Ver Detalhes">
                    <IconButton
                      onClick={() => {
                        setSelectedDispatch(dispatch);
                        setViewDialogOpen(true);
                      }}
                      sx={{ color: '#2196f3' }}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                </Box>

                {dispatch.status !== 'running' && (
                  <Tooltip title={t('massDispatch.delete')}>
                    <IconButton
                      onClick={() => handleDeleteDispatch(dispatch._id)}
                      sx={{ color: '#f15c6d' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Mensagem quando não há disparos */}
      {!loading && dispatches.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '40vh',
            textAlign: 'center',
          }}
        >
          <SendIcon sx={{ fontSize: 64, color: '#8696a0', mb: 2 }} />
          <Typography variant="h5" sx={{ color: '#e9edef', mb: 1 }}>
            {t('massDispatch.noDispatchesFound')}
          </Typography>
          <Typography variant="body1" sx={{ color: '#8696a0', mb: 3 }}>
            {t('massDispatch.createFirstDispatch')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ background: '#00a884', '&:hover': { background: '#008069' } }}
          >
            {t('massDispatch.newDispatch')}
          </Button>
        </Box>
      )}

      {/* Dialog de Criação de Disparo */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { background: '#202c33', color: '#e9edef' }
        }}
      >
        <DialogTitle>{t('massDispatch.createNewDispatch')}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t('massDispatch.dispatchName')}
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            margin="normal"
            required
            sx={{
              '& .MuiInputLabel-root': { color: '#8696a0' },
              '& .MuiOutlinedInput-root': {
                color: '#e9edef',
                '& fieldset': { borderColor: '#313d43' },
                '&:hover fieldset': { borderColor: '#00a884' },
                '&.Mui-focused fieldset': { borderColor: '#00a884' },
              }
            }}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel sx={{ color: '#8696a0' }}>{t('massDispatch.instance')}</InputLabel>
            <Select
              value={formData.instanceName}
              onChange={(e) => setFormData(prev => ({ ...prev, instanceName: e.target.value }))}
              sx={{
                color: '#e9edef',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#313d43' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00a884' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00a884' }
              }}
            >
              {instances.filter(i => i.status === 'connected').map((instance) => (
                <MenuItem key={instance.instanceName} value={instance.instanceName}>
                  {instance.instanceName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel sx={{ color: '#8696a0' }}>Template</InputLabel>
            <Select
              value={formData.selectedTemplate}
              onChange={(e) => setFormData(prev => ({ ...prev, selectedTemplate: e.target.value }))}
              sx={{
                color: '#e9edef',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#313d43' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00a884' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00a884' }
              }}
            >
              {templates.map((template) => (
                <MenuItem key={template._id} value={template._id}>
                  {getTemplateIcon(template.type)} {template.name} ({template.type})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label={t('massDispatch.form.numbers')}
            value={formData.numbers}
            onChange={(e) => setFormData(prev => ({ ...prev, numbers: e.target.value }))}
            margin="normal"
            multiline
            rows={4}
            placeholder="556293557070&#10;556298448536&#10;..."
            sx={{
              '& .MuiInputLabel-root': { color: '#8696a0' },
              '& .MuiOutlinedInput-root': {
                color: '#e9edef',
                '& fieldset': { borderColor: '#313d43' },
                '&:hover fieldset': { borderColor: '#00a884' },
                '&.Mui-focused fieldset': { borderColor: '#00a884' },
              }
            }}
          />

          {/* Seção de Seleção de Contatos do Kanban */}
          <Box sx={{ mt: 2, p: 2, border: '1px solid #313d43', borderRadius: 1 }}>
            <Typography variant="h6" sx={{ color: '#00a884', mb: 2 }}>
              📋 Selecionar Contatos do Kanban
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel 
                sx={{ 
                  color: '#8696a0',
                  '&.Mui-focused': { 
                    color: '#00a884',
                    transform: 'translate(14px, -9px) scale(0.75)',
                    backgroundColor: '#202c33',
                    paddingLeft: '4px',
                    paddingRight: '4px'
                  },
                  '&.MuiInputLabel-shrink': {
                    transform: 'translate(14px, -9px) scale(0.75)',
                    backgroundColor: '#202c33',
                    paddingLeft: '4px',
                    paddingRight: '4px'
                  }
                }}
              >
                Coluna do Kanban
              </InputLabel>
              <Select
                value={selectedColumn}
                onChange={(e) => {
                  setSelectedColumn(e.target.value);
                  if (e.target.value && formData.instanceName) {
                    loadColumnContacts(formData.instanceName, e.target.value);
                  }
                }}
                disabled={!formData.instanceName || loadingContacts}
                sx={{
                  color: '#e9edef',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#313d43' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00a884' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00a884' },
                  '& .MuiInputLabel-root': {
                    backgroundColor: '#202c33',
                    paddingLeft: '4px',
                    paddingRight: '4px'
                  }
                }}
              >
                <MenuItem value="">
                  <em>Selecione uma coluna</em>
                </MenuItem>
                {kanbanColumns.map((column) => (
                  <MenuItem key={column.id} value={column.id}>
                    {column.title} ({column.chatCount || 0} contatos)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {loadingContacts && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress sx={{ background: '#313d43', '& .MuiLinearProgress-bar': { background: '#00a884' } }} />
                <Typography variant="body2" sx={{ color: '#8696a0', mt: 1 }}>
                  Carregando contatos da coluna...
                </Typography>
              </Box>
            )}

            {columnContacts.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ color: '#8696a0' }}>
                  ✅ {columnContacts.length} contatos carregados da coluna
                </Typography>
                <Typography variant="caption" sx={{ color: '#8696a0', display: 'block', mt: 1 }}>
                  Os números foram automaticamente adicionados ao campo acima
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              sx={{ mr: 2 }}
            >
              Upload CSV/XML
              <input
                type="file"
                hidden
                accept=".csv,.xml,.txt"
                onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files[0] }))}
              />
            </Button>
            {formData.file && (
              <Typography variant="body2" sx={{ color: '#8696a0', mt: 1 }}>
                Arquivo selecionado: {formData.file.name}
              </Typography>
            )}
          </Box>

          <FormControl fullWidth margin="normal">
            <InputLabel sx={{ color: '#8696a0' }}>Velocidade</InputLabel>
            <Select
              value={formData.settings.speed}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                settings: { ...prev.settings, speed: e.target.value }
              }))}
              sx={{
                color: '#e9edef',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#313d43' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00a884' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00a884' }
              }}
            >
              {speedOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.settings.validateNumbers}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    settings: { ...prev.settings, validateNumbers: e.target.checked }
                  }))}
                  color="primary"
                />
              }
              label="Validar números no WhatsApp"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.settings.removeNinthDigit}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    settings: { ...prev.settings, removeNinthDigit: e.target.checked }
                  }))}
                  color="primary"
                />
              }
              label="Remover 9º dígito para DDDs fora de SP/RJ"
            />
          </Box>

          {/* Configurações de Personalização */}
          <Box sx={{ mt: 3, p: 2, border: '1px solid #313d43', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#00a884' }}>
              🎭 Personalização de Mensagens
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.settings.personalization.enabled}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    settings: { 
                      ...prev.settings, 
                      personalization: { 
                        ...prev.settings.personalization, 
                        enabled: e.target.checked 
                      }
                    }
                  }))}
                  color="primary"
                />
              }
              label="Ativar personalização com nomes dos contatos"
            />

            {formData.settings.personalization.enabled && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Nome padrão (quando contato não tem nome)"
                  value={formData.settings.personalization.defaultName}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    settings: { 
                      ...prev.settings, 
                      personalization: { 
                        ...prev.settings.personalization, 
                        defaultName: e.target.value 
                      }
                    }
                  }))}
                  placeholder="Ex: Cliente, Amigo, Senhor(a)"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#e9edef',
                      '& fieldset': { borderColor: '#313d43' },
                      '&:hover fieldset': { borderColor: '#00a884' },
                      '&.Mui-focused fieldset': { borderColor: '#00a884' }
                    },
                    '& .MuiInputLabel-root': { color: '#8696a0' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#00a884' }
                  }}
                />
                
                <Box sx={{ mt: 2, p: 2, bgcolor: '#1e2428', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ color: '#8696a0', mb: 1 }}>
                    📝 Variáveis disponíveis no template:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#e9edef', fontFamily: 'monospace' }}>
                    $name - Nome completo do contato<br/>
                    $firstName - Primeiro nome<br/>
                    $lastName - Último nome<br/>
                    $number - Número formatado<br/>
                    $originalNumber - Número original
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#8696a0', mt: 1 }}>
                    Exemplo: "Olá $firstName! Seu número $number foi cadastrado com sucesso."
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {/* Seção de Agendamento */}
          <Box sx={{ mt: 3, p: 2, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ScheduleIcon sx={{ mr: 1, color: '#667eea' }} />
              <Typography variant="h6" sx={{ color: '#e9edef' }}>
                Agendamento
              </Typography>
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={schedulingEnabled}
                  onChange={(e) => setSchedulingEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label={t('massDispatch.form.enableScheduling')}
            />

            {schedulingEnabled && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  {/* Data e Hora de Início */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ color: '#667eea', mb: 1, display: 'flex', alignItems: 'center' }}>
                      <PlayCircleIcon sx={{ mr: 1, fontSize: 20 }} />
                      {t('massDispatch.schedule.startSending')}
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          type="date"
                          label={t('massDispatch.schedule.startDate')}
                          value={scheduleData.startDate}
                          onChange={(e) => setScheduleData(prev => ({ ...prev, startDate: e.target.value }))}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              background: 'rgba(255,255,255,0.1)',
                              color: '#fff',
                              '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                              '&.Mui-focused fieldset': { borderColor: '#667eea' },
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255,255,255,0.7)',
                              '&.Mui-focused': { color: '#667eea' },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          type="time"
                          label="Hora de Início"
                          value={scheduleData.startTime}
                          onChange={(e) => setScheduleData(prev => ({ ...prev, startTime: e.target.value }))}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              background: 'rgba(255,255,255,0.1)',
                              color: '#fff',
                              '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                              '&.Mui-focused fieldset': { borderColor: '#667eea' },
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255,255,255,0.7)',
                              '&.Mui-focused': { color: '#667eea' },
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Data e Hora de Pausa */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ color: '#ffc107', mb: 1, display: 'flex', alignItems: 'center' }}>
                      <PauseCircleIcon sx={{ mr: 1, fontSize: 20 }} />
                      Pausa do Envio
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          type="date"
                          label="Data de Pausa"
                          value={scheduleData.pauseDate}
                          onChange={(e) => setScheduleData(prev => ({ ...prev, pauseDate: e.target.value }))}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              background: 'rgba(255,255,255,0.1)',
                              color: '#fff',
                              '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                              '&.Mui-focused fieldset': { borderColor: '#ffc107' },
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255,255,255,0.7)',
                              '&.Mui-focused': { color: '#ffc107' },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          type="time"
                          label="Hora de Pausa"
                          value={scheduleData.pauseTime}
                          onChange={(e) => setScheduleData(prev => ({ ...prev, pauseTime: e.target.value }))}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              background: 'rgba(255,255,255,0.1)',
                              color: '#fff',
                              '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                              '&.Mui-focused fieldset': { borderColor: '#ffc107' },
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255,255,255,0.7)',
                              '&.Mui-focused': { color: '#ffc107' },
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Data e Hora de Retorno */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ color: '#4caf50', mb: 1, display: 'flex', alignItems: 'center' }}>
                      <PlayCircleIcon sx={{ mr: 1, fontSize: 20 }} />
                      Retorno do Envio
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          type="date"
                          label="Data de Retorno"
                          value={scheduleData.resumeDate}
                          onChange={(e) => setScheduleData(prev => ({ ...prev, resumeDate: e.target.value }))}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              background: 'rgba(255,255,255,0.1)',
                              color: '#fff',
                              '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                              '&.Mui-focused fieldset': { borderColor: '#4caf50' },
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255,255,255,0.7)',
                              '&.Mui-focused': { color: '#4caf50' },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          type="time"
                          label="Hora de Retorno"
                          value={scheduleData.resumeTime}
                          onChange={(e) => setScheduleData(prev => ({ ...prev, resumeTime: e.target.value }))}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              background: 'rgba(255,255,255,0.1)',
                              color: '#fff',
                              '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                              '&.Mui-focused fieldset': { borderColor: '#4caf50' },
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255,255,255,0.7)',
                              '&.Mui-focused': { color: '#4caf50' },
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Informações do Agendamento */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                        📅 Resumo do Agendamento:
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block' }}>
                        • Início: {scheduleData.startDate && scheduleData.startTime ? 
                          `${scheduleData.startDate} às ${scheduleData.startTime}` : 'Não definido'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block' }}>
                        • Pausa: {scheduleData.pauseDate && scheduleData.pauseTime ? 
                          `${scheduleData.pauseDate} às ${scheduleData.pauseTime}` : 'Não definido'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block' }}>
                        • Retorno: {scheduleData.resumeDate && scheduleData.resumeTime ? 
                          `${scheduleData.resumeDate} às ${scheduleData.resumeTime}` : 'Não definido'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setCreateDialogOpen(false); resetForm(); }}>
            {t('massDispatch.form.cancel')}
          </Button>
          <Button
            onClick={handleCreateDispatch}
            variant="contained"
            disabled={loading}
            sx={{ background: '#00a884', '&:hover': { background: '#008069' } }}
          >
            {loading ? <CircularProgress size={20} /> : t('massDispatch.form.createDispatch')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Criação de Template */}
      <Dialog
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { background: '#202c33', color: '#e9edef' }
        }}
      >
        <DialogTitle>{t('massDispatch.createNewTemplate')}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t('massDispatch.templateName')}
            value={templateForm.name}
            onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
            margin="normal"
            required
            sx={{
              '& .MuiInputLabel-root': { color: '#8696a0' },
              '& .MuiOutlinedInput-root': {
                color: '#e9edef',
                '& fieldset': { borderColor: '#313d43' },
                '&:hover fieldset': { borderColor: '#00a884' },
                '&.Mui-focused fieldset': { borderColor: '#00a884' },
              }
            }}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel sx={{ color: '#8696a0' }}>{t('massDispatch.templateType')}</InputLabel>
            <Select
              value={templateForm.type}
              onChange={(e) => setTemplateForm(prev => ({ ...prev, type: e.target.value }))}
              sx={{
                color: '#e9edef',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#313d43' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00a884' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00a884' }
              }}
            >
              <MenuItem value="text">{t('massDispatch.templateTypes.text')}</MenuItem>
              <MenuItem value="image">{t('massDispatch.templateTypes.image')}</MenuItem>
              <MenuItem value="image_caption">{t('massDispatch.templateTypes.imageCaption')}</MenuItem>
              <MenuItem value="audio">{t('massDispatch.templateTypes.audio')}</MenuItem>
              <MenuItem value="file">{t('massDispatch.templateTypes.file')}</MenuItem>
              <MenuItem value="file_caption">{t('massDispatch.templateTypes.fileCaption')}</MenuItem>
            </Select>
          </FormControl>

          {/* Campos condicionais baseados no tipo */}
          {templateForm.type === 'text' && (
            <TextField
              fullWidth
              label={t('massDispatch.messageText')}
              value={templateForm.text}
              onChange={(e) => setTemplateForm(prev => ({ ...prev, text: e.target.value }))}
              margin="normal"
              multiline
              rows={4}
              required
              sx={{
                '& .MuiInputLabel-root': { color: '#8696a0' },
                '& .MuiOutlinedInput-root': {
                  color: '#e9edef',
                  '& fieldset': { borderColor: '#313d43' },
                  '&:hover fieldset': { borderColor: '#00a884' },
                  '&.Mui-focused fieldset': { borderColor: '#00a884' },
                }
              }}
            />
          )}

          {(templateForm.type.includes('caption')) && (
            <TextField
              fullWidth
              label="Legenda"
              value={templateForm.caption}
              onChange={(e) => setTemplateForm(prev => ({ ...prev, caption: e.target.value }))}
              margin="normal"
              multiline
              rows={2}
              required
              sx={{
                '& .MuiInputLabel-root': { color: '#8696a0' },
                '& .MuiOutlinedInput-root': {
                  color: '#e9edef',
                  '& fieldset': { borderColor: '#313d43' },
                  '&:hover fieldset': { borderColor: '#00a884' },
                  '&.Mui-focused fieldset': { borderColor: '#00a884' },
                }
              }}
            />
          )}

          {templateForm.type !== 'text' && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{ mr: 2 }}
              >
                Escolher Arquivo
                <input
                  type="file"
                  hidden
                  accept={
                    templateForm.type.includes('image') ? 'image/*' :
                    templateForm.type.includes('audio') ? 'audio/*' : '*/*'
                  }
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, media: e.target.files[0] }))}
                />
              </Button>
              {templateForm.media && (
                <Typography variant="body2" sx={{ color: '#8696a0', mt: 1 }}>
                  Arquivo selecionado: {templateForm.media.name}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateTemplate}
            variant="contained"
            disabled={loading}
            sx={{ background: '#00a884', '&:hover': { background: '#008069' } }}
          >
            {loading ? <CircularProgress size={20} /> : 'Criar Template'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Visualização */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { background: '#202c33', color: '#e9edef' }
        }}
      >
        <DialogTitle>
          Detalhes do Disparo: {selectedDispatch?.name}
        </DialogTitle>
        <DialogContent>
          {selectedDispatch && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: '#00a884' }}>
                Informações Gerais
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: '#8696a0' }}>Status:</Typography>
                  <Chip label={getStatusText(selectedDispatch.status)} color={getStatusColor(selectedDispatch.status)} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: '#8696a0' }}>Instância:</Typography>
                  <Typography variant="body1">{selectedDispatch.instanceName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: '#8696a0' }}>Criado em:</Typography>
                  <Typography variant="body1">{new Date(selectedDispatch.createdAt).toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: '#8696a0' }}>Velocidade:</Typography>
                  <Typography variant="body1">
                    {speedOptions.find(s => s.value === selectedDispatch.settings?.speed)?.label || 'Normal'}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mb: 2, color: '#00a884' }}>
                {t('massDispatch.stats.title')}
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={3}>
                  <Paper sx={{ p: 2, background: '#313d43', textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: '#2196f3' }}>
                      {selectedDispatch.statistics?.total || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#8696a0' }}>
                      {t('massDispatch.stats.total')}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={3}>
                  <Paper sx={{ p: 2, background: '#313d43', textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: '#00a884' }}>
                      {selectedDispatch.statistics?.sent || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#8696a0' }}>
                      {t('massDispatch.stats.sent')}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={3}>
                  <Paper sx={{ p: 2, background: '#313d43', textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: '#f15c6d' }}>
                      {selectedDispatch.statistics?.failed || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#8696a0' }}>
                      Falhas
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={3}>
                  <Paper sx={{ p: 2, background: '#313d43', textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: '#ffab00' }}>
                      {selectedDispatch.statistics?.pending || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#8696a0' }}>
                      Pendentes
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Template Preview */}
              <Typography variant="h6" sx={{ mb: 2, color: '#00a884' }}>
                Template
              </Typography>
              
              <Paper sx={{ p: 2, background: '#313d43', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {getTemplateIcon(selectedDispatch.template?.type)}
                  <Typography variant="body1">
                    {selectedDispatch.template?.type === 'text' ? 'Mensagem de Texto' :
                     selectedDispatch.template?.type === 'image' ? 'Imagem' :
                     selectedDispatch.template?.type === 'image_caption' ? 'Imagem com Legenda' :
                     selectedDispatch.template?.type === 'audio' ? 'Áudio' :
                     selectedDispatch.template?.type === 'file' ? 'Arquivo' :
                     selectedDispatch.template?.type === 'file_caption' ? 'Arquivo com Legenda' : 'Desconhecido'}
                  </Typography>
                </Box>
                
                {selectedDispatch.template?.content?.text && (
                  <Typography variant="body2" sx={{ color: '#e9edef', fontStyle: 'italic' }}>
                    "{selectedDispatch.template.content.text}"
                  </Typography>
                )}
                
                {selectedDispatch.template?.content?.caption && (
                  <Typography variant="body2" sx={{ color: '#8696a0', mt: 1 }}>
                    Legenda: "{selectedDispatch.template.content.caption}"
                  </Typography>
                )}
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MassDispatch;