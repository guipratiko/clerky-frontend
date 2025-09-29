import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
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
  Switch,
  FormControlLabel,
  FormGroup,
  // Divider,
  // Alert,
  CircularProgress,
  Tooltip,
  // Table,
  // TableBody,
  // TableCell,
  // TableContainer,
  // TableHead,
  // TableRow,
  // Paper,
  Tabs,
  Tab
  // Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as TestIcon,
  // Settings as SettingsIcon,
  Webhook as WebhookIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  // Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as HideIcon,
  SmartToy as AIIcon,
  OpenInNew as OpenIcon
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useI18n } from '../contexts/I18nContext';
import {
  getN8nIntegrations,
  createN8nIntegration,
  updateN8nIntegration,
  deleteN8nIntegration,
  testN8nIntegration,
  toggleN8nIntegration,
  getInstances,
  // AI Workflows
  getAIWorkflows,
  createAIWorkflow,
  updateAIWorkflowPrompt,
  testAIWorkflow,
  toggleAIWorkflow,
  deleteAIWorkflow,
  getAIWorkflowStats
  // getN8nIntegrationStats,
  // testWebhook
} from '../services/api';

const N8nIntegration = () => {
  const { t } = useI18n();
  const [integrations, setIntegrations] = useState([]);
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState(null);
  const [testingIntegration, setTestingIntegration] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // AI Workflows states
  const [aiWorkflows, setAiWorkflows] = useState([]);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [editingAIWorkflow, setEditingAIWorkflow] = useState(null);
  const [testingAIWorkflow, setTestingAIWorkflow] = useState(null);
  const [aiFormData, setAiFormData] = useState({
    prompt: ''
  });
  
  const [formData, setFormData] = useState({
    instanceName: '',
    webhookUrl: '',
    webhookSecret: '',
    isActive: true,
    events: {
      newMessage: true,
      messageSent: true,
      messageUpsert: true,
      newContact: true,
      contactUpdate: true,
      chatUpdate: true,
      connectionUpdate: true,
      qrCodeUpdate: true
    },
    filters: {
      includeGroups: false,
      includeMedia: true,
      includeContacts: true,
      minMessageLength: 0,
      excludeKeywords: [],
      includeKeywords: []
    },
    retryConfig: {
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 10000
    }
  });

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [integrationsResponse, instancesResponse, aiWorkflowsResponse] = await Promise.all([
        getN8nIntegrations(),
        getInstances(),
        getAIWorkflows()
      ]);
      
      setIntegrations(integrationsResponse.data || []);
      setInstances(instancesResponse.data || []);
      setAiWorkflows(aiWorkflowsResponse.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar integrações N8N');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (integration = null) => {
    if (integration) {
      setEditingIntegration(integration);
      setFormData({
        instanceName: integration.instanceName || '',
        webhookUrl: integration.webhookUrl || '',
        webhookSecret: integration.webhookSecret || '',
        isActive: integration.isActive,
        events: { ...integration.events },
        filters: { ...integration.filters },
        retryConfig: { ...integration.retryConfig }
      });
    } else {
      setEditingIntegration(null);
      setFormData({
        instanceName: '',
        webhookUrl: '',
        webhookSecret: '',
        isActive: true,
        events: {
          newMessage: true,
          messageSent: true,
          messageUpsert: true,
          newContact: true,
          contactUpdate: true,
          chatUpdate: true,
          connectionUpdate: true,
          qrCodeUpdate: true
        },
        filters: {
          includeGroups: false,
          includeMedia: true,
          includeContacts: true,
          minMessageLength: 0,
          excludeKeywords: [],
          includeKeywords: []
        },
        retryConfig: {
          maxRetries: 3,
          retryDelay: 1000,
          timeout: 10000
        }
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingIntegration(null);
  };

  const handleSave = async () => {
    try {
      if (editingIntegration) {
        await updateN8nIntegration(editingIntegration._id, formData);
        toast.success('Integração N8N atualizada com sucesso!');
      } else {
        await createN8nIntegration(formData);
        toast.success('Integração N8N criada com sucesso!');
      }
      
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar integração:', error);
      toast.error(error.response?.data?.error || 'Erro ao salvar integração');
    }
  };

  const handleDelete = async (integrationId) => {
    if (window.confirm('Tem certeza que deseja deletar esta integração?')) {
      try {
        await deleteN8nIntegration(integrationId);
        toast.success(t('n8nIntegration.integrationDeleted'));
        loadData();
      } catch (error) {
        console.error('Erro ao deletar integração:', error);
        toast.error(t('n8nIntegration.integrationDeleteError'));
      }
    }
  };

  const handleTest = async (integrationId) => {
    try {
      setTestingIntegration(integrationId);
      const result = await testN8nIntegration(integrationId, {
        message: t('n8nIntegration.testMessage'),
        timestamp: new Date().toISOString()
      });
      
      if (result.data.success) {
        toast.success(t('n8nIntegration.integrationTested'));
      } else {
        toast.error(`${t('n8nIntegration.testFailed')}: ${result.data.error}`);
      }
      
      loadData(); // Recarregar para atualizar estatísticas
    } catch (error) {
      console.error('Erro ao testar integração:', error);
      toast.error(t('n8nIntegration.integrationTestError'));
    } finally {
      setTestingIntegration(null);
    }
  };

  const handleToggle = async (integrationId, isActive) => {
    try {
      await toggleN8nIntegration(integrationId, isActive);
      toast.success(t('n8nIntegration.integrationToggled', { status: isActive ? t('n8nIntegration.activated') : t('n8nIntegration.deactivated') }));
      loadData();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error(t('n8nIntegration.integrationToggleError'));
    }
  };

  const getStatusColor = (integration) => {
    if (!integration.isActive) return 'default';
    if (integration.lastTestStatus === 'success') return 'success';
    if (integration.lastTestStatus === 'failed') return 'error';
    return 'warning';
  };

  const getStatusIcon = (integration) => {
    if (!integration.isActive) return <HideIcon />;
    if (integration.lastTestStatus === 'success') return <SuccessIcon />;
    if (integration.lastTestStatus === 'failed') return <ErrorIcon />;
    return <WarningIcon />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // ===== AI WORKFLOWS FUNCTIONS =====

  const handleOpenAIDialog = (workflow = null) => {
    if (workflow) {
      setEditingAIWorkflow(workflow);
      setAiFormData({
        prompt: workflow.prompt || ''
      });
    } else {
      setEditingAIWorkflow(null);
      setAiFormData({
        prompt: ''
      });
    }
    setAiDialogOpen(true);
  };

  const handleCloseAIDialog = () => {
    setAiDialogOpen(false);
    setEditingAIWorkflow(null);
  };

  const handleSaveAIWorkflow = async () => {
    try {
      if (editingAIWorkflow) {
        await updateAIWorkflowPrompt(editingAIWorkflow._id, aiFormData.prompt);
        toast.success(t('n8nIntegration.aiWorkflows.workflowUpdated'));
      } else {
        await createAIWorkflow({ prompt: aiFormData.prompt });
        toast.success(t('n8nIntegration.aiWorkflows.workflowCreated'));
      }
      
      handleCloseAIDialog();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar workflow de IA:', error);
      toast.error(error.response?.data?.error || 'Erro ao salvar workflow');
    }
  };

  const handleDeleteAIWorkflow = async (workflowId) => {
    if (window.confirm(t('n8nIntegration.aiWorkflows.deleteConfirm'))) {
      try {
        await deleteAIWorkflow(workflowId);
        toast.success(t('n8nIntegration.aiWorkflows.workflowDeleted'));
        loadData();
      } catch (error) {
        console.error('Erro ao deletar workflow:', error);
        toast.error(t('n8nIntegration.aiWorkflows.workflowDeleteError'));
      }
    }
  };

  const handleTestAIWorkflow = async (workflowId) => {
    try {
      setTestingAIWorkflow(workflowId);
      const result = await testAIWorkflow(workflowId, t('n8nIntegration.aiWorkflows.testMessage'));
      
      if (result.data.success) {
        toast.success(t('n8nIntegration.aiWorkflows.workflowTested'));
      } else {
        toast.error(`${t('n8nIntegration.aiWorkflows.testFailed')}: ${result.data.error}`);
      }
      
      loadData();
    } catch (error) {
      console.error('Erro ao testar workflow:', error);
      toast.error(t('n8nIntegration.aiWorkflows.workflowTestError'));
    } finally {
      setTestingAIWorkflow(null);
    }
  };

  const handleToggleAIWorkflow = async (workflowId, isActive) => {
    try {
      await toggleAIWorkflow(workflowId, isActive);
      toast.success(t('n8nIntegration.aiWorkflows.workflowToggled', { 
        status: isActive ? t('n8nIntegration.aiWorkflows.activated') : t('n8nIntegration.aiWorkflows.deactivated') 
      }));
      loadData();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error(t('n8nIntegration.aiWorkflows.workflowToggleError'));
    }
  };

  const getAIStatusColor = (workflow) => {
    if (!workflow.isActive) return 'default';
    if (workflow.lastTestStatus === 'success') return 'success';
    if (workflow.lastTestStatus === 'failed') return 'error';
    return 'warning';
  };

  const getAIStatusIcon = (workflow) => {
    if (!workflow.isActive) return <HideIcon />;
    if (workflow.lastTestStatus === 'success') return <SuccessIcon />;
    if (workflow.lastTestStatus === 'failed') return <ErrorIcon />;
    return <WarningIcon />;
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('n8nIntegration.title')}
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<AIIcon />}
            onClick={() => handleOpenAIDialog()}
            color="secondary"
          >
            {t('n8nIntegration.aiWorkflows.createWorkflow')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            {t('n8nIntegration.addIntegration')}
          </Button>
        </Box>
      </Box>

      {/* Tabs para alternar entre Integrações N8N e AI Workflows */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab 
            label={t('n8nIntegration.title')} 
            icon={<WebhookIcon />} 
            iconPosition="start"
          />
          <Tab 
            label={t('n8nIntegration.aiWorkflows.title')} 
            icon={<AIIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Panel para Integrações N8N */}
      <TabPanel value={activeTab} index={0}>
        {integrations.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <WebhookIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('n8nIntegration.noIntegrations')}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              {t('n8nIntegration.subtitle')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              {t('n8nIntegration.createFirstIntegration')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {integrations.map((integration) => (
            <Grid item xs={12} md={6} lg={4} key={integration._id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="h2">
                      {integration.instanceName || t('n8nIntegration.allInstances')}
                    </Typography>
                    <Box display="flex" gap={1}>
                      <Tooltip title={integration.isActive ? t('n8nIntegration.deactivate') : t('n8nIntegration.activate')}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggle(integration._id, !integration.isActive)}
                        >
                          {integration.isActive ? <VisibilityIcon /> : <HideIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('n8nIntegration.edit')}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(integration)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('n8nIntegration.test')}>
                        <IconButton
                          size="small"
                          onClick={() => handleTest(integration._id)}
                          disabled={testingIntegration === integration._id}
                        >
                          {testingIntegration === integration._id ? (
                            <CircularProgress size={20} />
                          ) : (
                            <TestIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('n8nIntegration.delete')}>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(integration._id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box mb={2}>
                    <Chip
                      icon={getStatusIcon(integration)}
                      label={integration.isActive ? t('n8nIntegration.active') : t('n8nIntegration.inactive')}
                      color={getStatusColor(integration)}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" mb={1}>
                    <strong>{t('n8nIntegration.webhook')}:</strong> {integration.webhookUrl}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mb={1}>
                    <strong>{t('n8nIntegration.lastTest')}:</strong> {formatDate(integration.lastTest)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mb={2}>
                    <strong>{t('n8nIntegration.webhooksSent')}:</strong> {integration.stats?.totalWebhooks || 0}
                  </Typography>

                  <Box display="flex" gap={1} flexWrap="wrap">
                    {Object.entries(integration.events)
                      .filter(([_, enabled]) => enabled)
                      .map(([event, _]) => {
                        const eventLabels = {
                          newMessage: t('n8nIntegration.eventLabels.newMessage'),
                          messageSent: t('n8nIntegration.eventLabels.messageSent'),
                          messageUpsert: t('n8nIntegration.eventLabels.messageUpsert'),
                          newContact: t('n8nIntegration.eventLabels.newContact'),
                          contactUpdate: t('n8nIntegration.eventLabels.contactUpdate'),
                          chatUpdate: t('n8nIntegration.eventLabels.chatUpdate'),
                          connectionUpdate: t('n8nIntegration.eventLabels.connectionUpdate'),
                          qrCodeUpdate: t('n8nIntegration.eventLabels.qrCodeUpdate')
                        };
                        
                        return (
                          <Chip
                            key={event}
                            label={eventLabels[event] || event.replace(/([A-Z])/g, ' $1').trim()}
                            size="small"
                            variant="outlined"
                          />
                        );
                      })}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        )}
      </TabPanel>

      {/* Tab Panel para AI Workflows */}
      <TabPanel value={activeTab} index={1}>
        {aiWorkflows.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <AIIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('n8nIntegration.aiWorkflows.noWorkflows')}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                {t('n8nIntegration.aiWorkflows.subtitle')}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AIIcon />}
                onClick={() => handleOpenAIDialog()}
                color="secondary"
              >
                {t('n8nIntegration.aiWorkflows.createFirstWorkflow')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {aiWorkflows.map((workflow) => (
              <Grid item xs={12} md={6} lg={4} key={workflow._id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="h6" component="h2">
                        {workflow.workflowName}
                      </Typography>
                      <Box display="flex" gap={1}>
                        <Tooltip title={workflow.isActive ? t('n8nIntegration.aiWorkflows.deactivate') : t('n8nIntegration.aiWorkflows.activate')}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleAIWorkflow(workflow._id, !workflow.isActive)}
                          >
                            {workflow.isActive ? <VisibilityIcon /> : <HideIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar Prompt">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenAIDialog(workflow)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('n8nIntegration.aiWorkflows.testWorkflow')}>
                          <IconButton
                            size="small"
                            onClick={() => handleTestAIWorkflow(workflow._id)}
                            disabled={testingAIWorkflow === workflow._id}
                          >
                            {testingAIWorkflow === workflow._id ? (
                              <CircularProgress size={20} />
                            ) : (
                              <TestIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Abrir no N8N">
                          <IconButton
                            size="small"
                            onClick={() => window.open(workflow.n8nUrl, '_blank')}
                          >
                            <OpenIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('n8nIntegration.delete')}>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteAIWorkflow(workflow._id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Box mb={2}>
                      <Chip
                        icon={getAIStatusIcon(workflow)}
                        label={workflow.isActive ? t('n8nIntegration.aiWorkflows.active') : t('n8nIntegration.aiWorkflows.inactive')}
                        color={getAIStatusColor(workflow)}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" mb={1}>
                      <strong>{t('n8nIntegration.aiWorkflows.webhookUrl')}:</strong> {workflow.webhookUrl}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" mb={1}>
                      <strong>{t('n8nIntegration.aiWorkflows.lastTest')}:</strong> {formatDate(workflow.lastTest)}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" mb={2}>
                      <strong>{t('n8nIntegration.aiWorkflows.messagesProcessed')}:</strong> {workflow.stats?.totalMessages || 0}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" mb={1}>
                      <strong>Prompt:</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      maxHeight: '60px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {workflow.prompt || 'Nenhum prompt configurado'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Dialog de Criação/Edição */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingIntegration ? t('n8nIntegration.editIntegration') : t('n8nIntegration.newIntegration')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label={t('n8nIntegration.tabs.basic')} />
              <Tab label={t('n8nIntegration.tabs.events')} />
              <Tab label={t('n8nIntegration.tabs.filters')} />
              <Tab label={t('n8nIntegration.tabs.advanced')} />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{t('n8nIntegration.instance')}</InputLabel>
                  <Select
                    value={formData.instanceName}
                    onChange={(e) => setFormData({ ...formData, instanceName: e.target.value })}
                    label={t('n8nIntegration.instance')}
                  >
                    <MenuItem value="">{t('n8nIntegration.allInstances')}</MenuItem>
                    {instances.map((instance) => (
                      <MenuItem key={instance.instanceName} value={instance.instanceName}>
                        {instance.instanceName} ({instance.status})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('n8nIntegration.webhookUrl')}
                  value={formData.webhookUrl}
                  onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                  placeholder="https://seu-n8n.com/webhook/abc123"
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('n8nIntegration.webhookSecret')}
                  value={formData.webhookSecret}
                  onChange={(e) => setFormData({ ...formData, webhookSecret: e.target.value })}
                  type="password"
                  placeholder="Chave secreta para autenticação"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                  }
                  label={t('n8nIntegration.integrationActive')}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Typography variant="h6" gutterBottom>
              {t('n8nIntegration.eventsToSend')}
            </Typography>
            <FormGroup>
              {Object.entries(formData.events).map(([event, enabled]) => {
                // Debug: mostrar eventos disponíveis
                console.log('Evento disponível:', event, enabled);
                
                // Mapear nomes dos eventos para exibição mais amigável
                const eventLabels = {
                  newMessage: t('n8nIntegration.eventLabels.newMessage'),
                  messageSent: t('n8nIntegration.eventLabels.messageSent'),
                  messageUpsert: t('n8nIntegration.eventLabels.messageUpsert'),
                  newContact: t('n8nIntegration.eventLabels.newContact'),
                  contactUpdate: t('n8nIntegration.eventLabels.contactUpdate'),
                  chatUpdate: t('n8nIntegration.eventLabels.chatUpdate'),
                  connectionUpdate: t('n8nIntegration.eventLabels.connectionUpdate'),
                  qrCodeUpdate: t('n8nIntegration.eventLabels.qrCodeUpdate')
                };
                
                return (
                  <FormControlLabel
                    key={event}
                    control={
                      <Switch
                        checked={enabled}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            events: { ...formData.events, [event]: e.target.checked }
                          })
                        }
                      />
                    }
                    label={eventLabels[event] || event.replace(/([A-Z])/g, ' $1').trim()}
                  />
                );
              })}
            </FormGroup>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" gutterBottom>
              {t('n8nIntegration.dataFilters')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.filters.includeGroups}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          filters: { ...formData.filters, includeGroups: e.target.checked }
                        })
                      }
                    />
                  }
                  label={t('n8nIntegration.includeGroups')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.filters.includeMedia}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          filters: { ...formData.filters, includeMedia: e.target.checked }
                        })
                      }
                    />
                  }
                  label={t('n8nIntegration.includeMedia')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.filters.includeContacts}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          filters: { ...formData.filters, includeContacts: e.target.checked }
                        })
                      }
                    />
                  }
                  label={t('n8nIntegration.includeContacts')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('n8nIntegration.minMessageLength')}
                  type="number"
                  value={formData.filters.minMessageLength}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      filters: { ...formData.filters, minMessageLength: parseInt(e.target.value) || 0 }
                    })
                  }
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Typography variant="h6" gutterBottom>
              {t('n8nIntegration.retrySettings')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label={t('n8nIntegration.maxRetries')}
                  type="number"
                  value={formData.retryConfig.maxRetries}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      retryConfig: { ...formData.retryConfig, maxRetries: parseInt(e.target.value) || 3 }
                    })
                  }
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label={t('n8nIntegration.retryDelay')}
                  type="number"
                  value={formData.retryConfig.retryDelay}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      retryConfig: { ...formData.retryConfig, retryDelay: parseInt(e.target.value) || 1000 }
                    })
                  }
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label={t('n8nIntegration.timeout')}
                  type="number"
                  value={formData.retryConfig.timeout}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      retryConfig: { ...formData.retryConfig, timeout: parseInt(e.target.value) || 10000 }
                    })
                  }
                />
              </Grid>
            </Grid>
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('n8nIntegration.cancel')}</Button>
          <Button onClick={handleSave} variant="contained">
            {editingIntegration ? t('n8nIntegration.update') : t('n8nIntegration.create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Criação/Edição AI Workflow */}
      <Dialog open={aiDialogOpen} onClose={handleCloseAIDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAIWorkflow ? t('n8nIntegration.aiWorkflows.editWorkflow') : t('n8nIntegration.aiWorkflows.newWorkflow')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label={t('n8nIntegration.aiWorkflows.prompt')}
                value={aiFormData.prompt}
                onChange={(e) => setAiFormData({ ...aiFormData, prompt: e.target.value })}
                placeholder={t('n8nIntegration.aiWorkflows.promptPlaceholder')}
                helperText={t('n8nIntegration.aiWorkflows.promptHelp')}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAIDialog}>{t('n8nIntegration.cancel')}</Button>
          <Button onClick={handleSaveAIWorkflow} variant="contained" color="secondary">
            {editingAIWorkflow ? t('n8nIntegration.update') : t('n8nIntegration.aiWorkflows.createWorkflow')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default N8nIntegration;
