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
  CircularProgress,
  Tooltip,
  Tabs,
  Tab,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as TestIcon,
  Webhook as WebhookIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as HideIcon,
  SmartToy as AIIcon,
  MoreVert as MoreVertIcon
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
  getAIWorkflows,
  createAIWorkflow,
  updateAIWorkflowPrompt,
  testAIWorkflow,
  toggleAIWorkflow,
  deleteAIWorkflow
} from '../services/api';

// Componente para Card de AI Workflow com Menu
const AIWorkflowCard = ({ workflow, onToggle, onEdit, onTest, onDelete, testingWorkflow, t }) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleOpenMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setMenuOpen(false);
  };

  const getAIStatusIcon = (workflow) => {
    if (workflow.lastTestStatus === 'success') return <SuccessIcon />;
    if (workflow.lastTestStatus === 'failed') return <ErrorIcon />;
    return <WarningIcon />;
  };

  const getAIStatusColor = (workflow) => {
    if (workflow.lastTestStatus === 'success') return 'success';
    if (workflow.lastTestStatus === 'failed') return 'error';
    return 'warning';
  };

  const formatDate = (date) => {
    if (!date) return 'Nunca';
    return new Date(date).toLocaleString('pt-BR');
  };

  return (
    <>
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Typography variant="h6" component="h2">
              {workflow.workflowName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {workflow.instanceName}
            </Typography>
            <IconButton
              size="small"
              onClick={handleOpenMenu}
              aria-label="Mais opções"
            >
              <MoreVertIcon />
            </IconButton>
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

      {/* Menu específico para este card */}
      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => {
          onToggle(workflow._id, !workflow.isActive);
          handleCloseMenu();
        }}>
          <ListItemIcon>
            {workflow.isActive ? <HideIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>
            {workflow.isActive ? t('n8nIntegration.aiWorkflows.deactivate') : t('n8nIntegration.aiWorkflows.activate')}
          </ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          onEdit(workflow);
          handleCloseMenu();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar Prompt</ListItemText>
        </MenuItem>
        
        <MenuItem 
          onClick={() => {
            onTest(workflow._id);
            handleCloseMenu();
          }}
          disabled={testingWorkflow === workflow._id}
        >
          <ListItemIcon>
            {testingWorkflow === workflow._id ? (
              <CircularProgress size={20} />
            ) : (
              <TestIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>{t('n8nIntegration.aiWorkflows.testWorkflow')}</ListItemText>
        </MenuItem>
        
        <MenuItem 
          onClick={() => {
            onDelete(workflow._id);
            handleCloseMenu();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>{t('n8nIntegration.delete')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

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
    instanceName: '',
    prompt: '',
    promptType: 'custom', // 'custom' ou 'structured'
    structuredData: {
      // Produto/Serviço
      produtoNome: '',
      produtoDescricao: '',
      produtoCategoria: '',
      
      // Público-Alvo
      publicoIdade: '',
      publicoProfissao: '',
      publicoDor: '',
      publicoConsciencia: '',
      publicoObjecoes: '',
      
      // Investimento
      preco: '',
      formasPagamento: '',
      parcelamento: '',
      garantia: '',
      
      // Proposta de Valor
      transformacao: '',
      beneficio1: '',
      beneficio2: '',
      beneficio3: '',
      diferencial: '',
      
      // Prova Social
      numeroClientes: '',
      depoimentos: '',
      autoridade: '',
      
      // Objeções e Respostas
      objecao1: '',
      resposta1: '',
      objecao2: '',
      resposta2: '',
      objecao3: '',
      resposta3: '',
      
      // Tom de Voz
      tomVoz: '',
      emojis: '',
      estilo: '',
      
      // Objetivo Final
      acaoDesejada: '',
      linkCTA: ''
    }
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
      
      loadData();
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
        instanceName: workflow.instanceName || '',
        prompt: workflow.prompt || '',
        promptType: 'custom',
        structuredData: {
          produtoNome: '',
          produtoDescricao: '',
          produtoCategoria: '',
          publicoIdade: '',
          publicoProfissao: '',
          publicoDor: '',
          publicoConsciencia: '',
          publicoObjecoes: '',
          preco: '',
          formasPagamento: '',
          parcelamento: '',
          garantia: '',
          transformacao: '',
          beneficio1: '',
          beneficio2: '',
          beneficio3: '',
          diferencial: '',
          numeroClientes: '',
          depoimentos: '',
          autoridade: '',
          objecao1: '',
          resposta1: '',
          objecao2: '',
          resposta2: '',
          objecao3: '',
          resposta3: '',
          tomVoz: '',
          emojis: '',
          estilo: '',
          acaoDesejada: '',
          linkCTA: ''
        }
      });
    } else {
      setEditingAIWorkflow(null);
      setAiFormData({
        instanceName: '',
        prompt: '',
        promptType: 'custom',
        structuredData: {
          produtoNome: '',
          produtoDescricao: '',
          produtoCategoria: '',
          publicoIdade: '',
          publicoProfissao: '',
          publicoDor: '',
          publicoConsciencia: '',
          publicoObjecoes: '',
          preco: '',
          formasPagamento: '',
          parcelamento: '',
          garantia: '',
          transformacao: '',
          beneficio1: '',
          beneficio2: '',
          beneficio3: '',
          diferencial: '',
          numeroClientes: '',
          depoimentos: '',
          autoridade: '',
          objecao1: '',
          resposta1: '',
          objecao2: '',
          resposta2: '',
          objecao3: '',
          resposta3: '',
          tomVoz: '',
          emojis: '',
          estilo: '',
          acaoDesejada: '',
          linkCTA: ''
        }
      });
    }
    setAiDialogOpen(true);
  };

  const handleCloseAIDialog = () => {
    setAiDialogOpen(false);
    setEditingAIWorkflow(null);
  };

  // Função para gerar prompt baseado no modelo estruturado de vendas
  const generateStructuredPrompt = (data) => {
    const {
      produtoNome, produtoDescricao, produtoCategoria,
      publicoIdade, publicoProfissao, publicoDor, publicoConsciencia, publicoObjecoes,
      preco, formasPagamento, parcelamento, garantia,
      transformacao, beneficio1, beneficio2, beneficio3, diferencial,
      numeroClientes, depoimentos, autoridade,
      objecao1, resposta1, objecao2, resposta2, objecao3, resposta3,
      tomVoz, emojis, estilo,
      acaoDesejada, linkCTA
    } = data;

    return `Você é um vendedor profissional especializado em conversões via WhatsApp. Sua missão é conduzir leads através de uma jornada de vendas natural, empática e persuasiva, levando-os ao fechamento da compra.

Você NÃO é um robô. Você é um ser humano experiente em vendas consultivas, que entende as dores do cliente, constrói rapport genuíno e utiliza técnicas de copywriting e persuasão de forma sutil e eficaz.

---

PRODUTO/SERVIÇO:
- Nome: ${produtoNome}
- Descrição: ${produtoDescricao}
- Categoria: ${produtoCategoria}

PÚBLICO-ALVO:
- Idade: ${publicoIdade}
- Profissão: ${publicoProfissao}
- Principal dor: ${publicoDor}
- Nível de consciência: ${publicoConsciencia}
- Objeções típicas: ${publicoObjecoes}

INVESTIMENTO:
- Preço: ${preco}
- Formas de pagamento: ${formasPagamento}
- Parcelamento: ${parcelamento}
- Garantia: ${garantia}

PROPOSTA DE VALOR:
- Principal transformação: ${transformacao}
- Benefícios principais:
  1. ${beneficio1}
  2. ${beneficio2}
  3. ${beneficio3}
- Diferencial: ${diferencial}

PROVA SOCIAL:
- Número de clientes: ${numeroClientes}
- Depoimentos: ${depoimentos}
- Autoridade: ${autoridade}

OBJEÇÕES E RESPOSTAS:
1. "${objecao1}"
   → ${resposta1}

2. "${objecao2}"
   → ${resposta2}

3. "${objecao3}"
   → ${resposta3}

TOM DE VOZ:
- Tom: ${tomVoz}
- Emojis: ${emojis}
- Estilo: ${estilo}

OBJETIVO FINAL:
- Ação desejada: ${acaoDesejada}
- Link/CTA: ${linkCTA}

---

ROTEIRO DE VENDAS:

ETAPA 1 - ABORDAGEM INICIAL:
Comece com uma mensagem amigável, quebrando o gelo.

ETAPA 2 - RAPPORT E QUALIFICAÇÃO:
Faça perguntas para entender o contexto do lead.

ETAPA 3 - EXPLORAÇÃO DA DOR:
Amplifie a consciência do problema fazendo o lead verbalizar.

ETAPA 4 - APRESENTAÇÃO DO PRODUTO:
Conecte a solução com a dor específica mencionada.

ETAPA 5 - PROVA SOCIAL:
Compartilhe resultados de alunos/clientes similares.

ETAPA 6 - TRATAMENTO DE OBJEÇÕES:
Valide a objeção e apresente nova perspectiva.

ETAPA 7 - OFERTA DIRETA:
Apresente o investimento de forma clara e confiante.

ETAPA 8 - FECHAMENTO:
Assuma a venda e conduza à ação.

---

REGRAS DE COMPORTAMENTO:

✅ FAZER:
- Mensagens curtas (máximo 2-3 linhas)
- UMA pergunta por vez
- Usar o nome do lead naturalmente
- Pedir pequenos "sins" (microcomprometimentos)
- Demonstrar empatia genuína
- Espelhar o tom do lead

❌ NÃO FAZER:
- Textos longos
- Linguagem robótica
- Forçar vendas agressivamente
- Ignorar objeções
- Mentir ou inventar informações
- Desistir após primeira objeção
- Enviar links antes de construir rapport`;
  };

  const handleSaveAIWorkflow = async () => {
    try {
      // Gerar prompt baseado no tipo selecionado
      let finalPrompt = aiFormData.prompt;
      if (aiFormData.promptType === 'structured') {
        finalPrompt = generateStructuredPrompt(aiFormData.structuredData);
      }

      if (editingAIWorkflow) {
        await updateAIWorkflowPrompt(editingAIWorkflow._id, finalPrompt);
        toast.success(t('n8nIntegration.aiWorkflows.workflowUpdated'));
      } else {
        if (!aiFormData.instanceName) {
          toast.error(t('n8nIntegration.aiWorkflows.instanceRequired'));
          return;
        }
        
        await createAIWorkflow({ 
          instanceName: aiFormData.instanceName, 
          prompt: finalPrompt 
        });
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
                <AIWorkflowCard
                  workflow={workflow}
                  onToggle={handleToggleAIWorkflow}
                  onEdit={handleOpenAIDialog}
                  onTest={handleTestAIWorkflow}
                  onDelete={handleDeleteAIWorkflow}
                  testingWorkflow={testingAIWorkflow}
                  t={t}
                />
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
      <Dialog open={aiDialogOpen} onClose={handleCloseAIDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingAIWorkflow ? t('n8nIntegration.aiWorkflows.editWorkflow') : t('n8nIntegration.aiWorkflows.newWorkflow')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {!editingAIWorkflow && (
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>{t('n8nIntegration.instance')}</InputLabel>
                  <Select
                    value={aiFormData.instanceName}
                    onChange={(e) => setAiFormData({ ...aiFormData, instanceName: e.target.value })}
                    label={t('n8nIntegration.instance')}
                  >
                    {instances
                      .filter(instance => instance.status === 'connected')
                      .length === 0 ? (
                      <MenuItem disabled>
                        {t('n8nIntegration.aiWorkflows.noConnectedInstances')}
                      </MenuItem>
                    ) : (
                      instances
                        .filter(instance => instance.status === 'connected')
                        .map((instance) => (
                          <MenuItem key={instance.instanceName} value={instance.instanceName}>
                            {instance.instanceName} ({instance.status})
                          </MenuItem>
                        ))
                    )}
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            {/* Seleção do tipo de prompt */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{t('n8nIntegration.aiWorkflows.promptType')}</InputLabel>
                <Select
                  value={aiFormData.promptType}
                  onChange={(e) => setAiFormData({ ...aiFormData, promptType: e.target.value })}
                  label={t('n8nIntegration.aiWorkflows.promptType')}
                >
                  <MenuItem value="custom">{t('n8nIntegration.aiWorkflows.customPrompt')}</MenuItem>
                  <MenuItem value="structured">{t('n8nIntegration.aiWorkflows.structuredPrompt')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Prompt personalizado */}
            {aiFormData.promptType === 'custom' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label={t('n8nIntegration.aiWorkflows.prompt')}
                  value={aiFormData.prompt}
                  onChange={(e) => setAiFormData({ ...aiFormData, prompt: e.target.value })}
                  placeholder={t('n8nIntegration.aiWorkflows.promptPlaceholder')}
                  helperText={`${aiFormData.prompt.length}/500.000 caracteres - ${t('n8nIntegration.aiWorkflows.promptHelp')}`}
                  inputProps={{ maxLength: 500000 }}
                  required
                />
              </Grid>
            )}

            {/* Formulário estruturado - NOVO MODELO DE VENDAS */}
            {aiFormData.promptType === 'structured' && (
              <>
                {/* 1. Produto/Serviço */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                    1. Produto/Serviço
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nome do Produto/Serviço"
                    value={aiFormData.structuredData.produtoNome}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, produtoNome: e.target.value }
                    })}
                    placeholder="Ex: Curso Online 'Inglês Fluente em 6 Meses'"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Descrição"
                    value={aiFormData.structuredData.produtoDescricao}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, produtoDescricao: e.target.value }
                    })}
                    placeholder="Ex: Curso online completo de inglês com método imersivo, aulas ao vivo semanais e comunidade exclusiva"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Categoria"
                    value={aiFormData.structuredData.produtoCategoria}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, produtoCategoria: e.target.value }
                    })}
                    placeholder="Ex: Infoproduto, curso online, mentoria, produto físico, serviço"
                    required
                  />
                </Grid>

                {/* 2. Público-Alvo */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', mt: 2 }}>
                    2. Público-Alvo (Persona)
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Idade"
                    value={aiFormData.structuredData.publicoIdade}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, publicoIdade: e.target.value }
                    })}
                    placeholder="Ex: 25-45 anos"
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Profissão/Segmento"
                    value={aiFormData.structuredData.publicoProfissao}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, publicoProfissao: e.target.value }
                    })}
                    placeholder="Ex: Profissionais que precisam de inglês para crescer na carreira"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Principal Dor ou Desejo"
                    value={aiFormData.structuredData.publicoDor}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, publicoDor: e.target.value }
                    })}
                    placeholder="Ex: Frustração por ter tentado aprender inglês várias vezes sem sucesso, sentindo-se travado em conversações"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nível de Consciência"
                    value={aiFormData.structuredData.publicoConsciencia}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, publicoConsciencia: e.target.value }
                    })}
                    placeholder="Ex: Cientes do problema, já tentaram apps e cursos tradicionais"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Objeções Típicas"
                    value={aiFormData.structuredData.publicoObjecoes}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, publicoObjecoes: e.target.value }
                    })}
                    placeholder="Ex: 'Não tenho tempo', 'Já tentei antes e não funcionou', 'É muito caro'"
                    required
                  />
                </Grid>

                {/* 3. Investimento */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', mt: 2 }}>
                    3. Investimento
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Preço"
                    value={aiFormData.structuredData.preco}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, preco: e.target.value }
                    })}
                    placeholder="Ex: R$ 1.997,00"
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Formas de Pagamento"
                    value={aiFormData.structuredData.formasPagamento}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, formasPagamento: e.target.value }
                    })}
                    placeholder="Ex: PIX (5% desconto), cartão de crédito"
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Parcelamento"
                    value={aiFormData.structuredData.parcelamento}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, parcelamento: e.target.value }
                    })}
                    placeholder="Ex: Até 12x de R$ 197,00"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Garantia"
                    value={aiFormData.structuredData.garantia}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, garantia: e.target.value }
                    })}
                    placeholder="Ex: 30 dias de garantia incondicional"
                  />
                </Grid>

                {/* 4. Proposta de Valor */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', mt: 2 }}>
                    4. Proposta de Valor
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Principal Transformação"
                    value={aiFormData.structuredData.transformacao}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, transformacao: e.target.value }
                    })}
                    placeholder="Ex: Sair do básico para conseguir manter conversações fluentes em inglês em 6 meses"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Benefício Principal 1"
                    value={aiFormData.structuredData.beneficio1}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, beneficio1: e.target.value }
                    })}
                    placeholder="Ex: Método comprovado que elimina o 'travamento' ao falar"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Benefício Principal 2"
                    value={aiFormData.structuredData.beneficio2}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, beneficio2: e.target.value }
                    })}
                    placeholder="Ex: Aulas ao vivo semanais com feedback personalizado"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Benefício Principal 3"
                    value={aiFormData.structuredData.beneficio3}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, beneficio3: e.target.value }
                    })}
                    placeholder="Ex: Comunidade ativa para praticar todos os dias"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Diferencial"
                    value={aiFormData.structuredData.diferencial}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, diferencial: e.target.value }
                    })}
                    placeholder="Ex: Foco 100% em conversação real, não em gramática decoreba"
                    required
                  />
                </Grid>

                {/* 5. Prova Social */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', mt: 2 }}>
                    5. Prova Social
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Número de Clientes Atendidos"
                    value={aiFormData.structuredData.numeroClientes}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, numeroClientes: e.target.value }
                    })}
                    placeholder="Ex: Mais de 3.000 alunos formados"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Depoimentos Principais"
                    value={aiFormData.structuredData.depoimentos}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, depoimentos: e.target.value }
                    })}
                    placeholder="Ex: 'Consegui minha promoção depois de 3 meses no curso. Hoje faço reuniões em inglês sem medo!' - Marina, 32 anos"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Autoridade"
                    value={aiFormData.structuredData.autoridade}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, autoridade: e.target.value }
                    })}
                    placeholder="Ex: Professor com 15 anos de experiência em ensino de idiomas"
                    required
                  />
                </Grid>

                {/* 6. Objeções e Respostas */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', mt: 2 }}>
                    6. Objeções Comuns e Respostas
                  </Typography>
                </Grid>
                
                {/* Objeção 1 */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                    Objeção 1
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Objeção"
                    value={aiFormData.structuredData.objecao1}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, objecao1: e.target.value }
                    })}
                    placeholder="Ex: Está muito caro"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Resposta"
                    value={aiFormData.structuredData.resposta1}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, resposta1: e.target.value }
                    })}
                    placeholder="Ex: Entendo! Mas pensa comigo: quanto vale uma promoção ou uma oportunidade internacional? O investimento se paga rápido."
                    required
                  />
                </Grid>

                {/* Objeção 2 */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1, mt: 2, color: 'text.secondary' }}>
                    Objeção 2
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Objeção"
                    value={aiFormData.structuredData.objecao2}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, objecao2: e.target.value }
                    })}
                    placeholder="Ex: Não tenho tempo"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Resposta"
                    value={aiFormData.structuredData.resposta2}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, resposta2: e.target.value }
                    })}
                    placeholder="Ex: O curso foi feito pensando nisso. São apenas 30min por dia. Você consegue encaixar no intervalo do almoço."
                    required
                  />
                </Grid>

                {/* Objeção 3 */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1, mt: 2, color: 'text.secondary' }}>
                    Objeção 3
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Objeção"
                    value={aiFormData.structuredData.objecao3}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, objecao3: e.target.value }
                    })}
                    placeholder="Ex: Já tentei e não funcionou"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Resposta"
                    value={aiFormData.structuredData.resposta3}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, resposta3: e.target.value }
                    })}
                    placeholder="Ex: O problema não é você, é o método. Cursos tradicionais focam em gramática. O nosso foca em te fazer FALAR desde o dia 1."
                    required
                  />
                </Grid>

                {/* 7. Tom de Voz */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', mt: 2 }}>
                    7. Tom de Voz
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Tom"
                    value={aiFormData.structuredData.tomVoz}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, tomVoz: e.target.value }
                    })}
                    placeholder="Ex: Empático e consultivo"
                    required
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Uso de Emojis"
                    value={aiFormData.structuredData.emojis}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, emojis: e.target.value }
                    })}
                    placeholder="Ex: Usar com moderação (1-2 por mensagem)"
                    required
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Estilo"
                    value={aiFormData.structuredData.estilo}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, estilo: e.target.value }
                    })}
                    placeholder="Ex: Consultor amigo"
                    required
                  />
                </Grid>

                {/* 8. Objetivo Final */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', mt: 2 }}>
                    8. Objetivo Final
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Ação Desejada"
                    value={aiFormData.structuredData.acaoDesejada}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, acaoDesejada: e.target.value }
                    })}
                    placeholder="Ex: Enviar link de pagamento e confirmar a compra"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Link/CTA Final"
                    value={aiFormData.structuredData.linkCTA}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, linkCTA: e.target.value }
                    })}
                    placeholder="Ex: https://pagar.com/ingles-fluente"
                    required
                  />
                </Grid>
              </>
            )}
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

