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
  Tab,
  Menu,
  ListItemIcon,
  ListItemText
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
  // AI Workflows
  getAIWorkflows,
  createAIWorkflow,
  updateAIWorkflowPrompt,
  testAIWorkflow,
  toggleAIWorkflow,
  deleteAIWorkflow
  // getN8nIntegrationStats,
  // testWebhook
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
      // Identidade
      nome: '',
      cargo: '',
      empresa: '',
      segmento: '',
      personalidade: '',
      comunicacao: '',
      
      // Empresa
      modalidades: '',
      contato: '',
      
      // Produtos/Serviços
      produto1: '',
      preco1: '',
      pagamento1: '',
      link1: '',
      conteudo1: '',
      acesso1: '',
      suporte1: '',
      
      produto2: '',
      preco2: '',
      duracao2: '',
      local2: '',
      conteudo2: '',
      beneficios2: '',
      
      // Fluxo de Vendas
      apresentacao: '',
      pergunta1: '',
      pergunta2: '',
      pergunta3: '',
      apresentacaoSolucao: '',
      escolhaModalidade: '',
      finalizacao1: '',
      finalizacao2: '',
      
      // Respostas Padrão
      duvidas: '',
      respostaProduto1: '',
      respostaProduto2: '',
      fechamento: ''
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
        instanceName: workflow.instanceName || '',
        prompt: workflow.prompt || '',
        promptType: 'custom',
        structuredData: {
          nome: '',
          cargo: '',
          empresa: '',
          segmento: '',
          personalidade: '',
          comunicacao: '',
          modalidades: '',
          contato: '',
          produto1: '',
          preco1: '',
          pagamento1: '',
          link1: '',
          conteudo1: '',
          acesso1: '',
          suporte1: '',
          produto2: '',
          preco2: '',
          duracao2: '',
          local2: '',
          conteudo2: '',
          beneficios2: '',
          apresentacao: '',
          pergunta1: '',
          pergunta2: '',
          pergunta3: '',
          apresentacaoSolucao: '',
          escolhaModalidade: '',
          finalizacao1: '',
          finalizacao2: '',
          duvidas: '',
          respostaProduto1: '',
          respostaProduto2: '',
          fechamento: ''
        }
      });
    } else {
      setEditingAIWorkflow(null);
      setAiFormData({
        instanceName: '',
        prompt: '',
        promptType: 'custom',
        structuredData: {
          nome: '',
          cargo: '',
          empresa: '',
          segmento: '',
          personalidade: '',
          comunicacao: '',
          modalidades: '',
          contato: '',
          produto1: '',
          preco1: '',
          pagamento1: '',
          link1: '',
          conteudo1: '',
          acesso1: '',
          suporte1: '',
          produto2: '',
          preco2: '',
          duracao2: '',
          local2: '',
          conteudo2: '',
          beneficios2: '',
          apresentacao: '',
          pergunta1: '',
          pergunta2: '',
          pergunta3: '',
          apresentacaoSolucao: '',
          escolhaModalidade: '',
          finalizacao1: '',
          finalizacao2: '',
          duvidas: '',
          respostaProduto1: '',
          respostaProduto2: '',
          fechamento: ''
        }
      });
    }
    setAiDialogOpen(true);
  };

  const handleCloseAIDialog = () => {
    setAiDialogOpen(false);
    setEditingAIWorkflow(null);
  };

  // Função para gerar prompt baseado no modelo estruturado
  const generateStructuredPrompt = (data) => {
    const {
      nome, cargo, empresa, segmento, personalidade, comunicacao,
      modalidades, contato,
      produto1, preco1, pagamento1, link1, conteudo1, acesso1, suporte1,
      produto2, preco2, duracao2, local2, conteudo2, beneficios2,
      apresentacao, pergunta1, pergunta2, pergunta3, apresentacaoSolucao,
      escolhaModalidade, finalizacao1, finalizacao2,
      respostaProduto1, respostaProduto2, fechamento
    } = data;

    return `### 1. IDENTIDADE
\`\`\`
# Sistema - ${nome} - ${empresa}

## Identidade e Papel
Você é o/a ${nome}, ${cargo} da ${empresa}, especializado/a em ${segmento}. Sua missão é converter interesse em vendas.

**Personalidade**: ${personalidade}
**Comunicação**: ${comunicacao}
\`\`\`

### 2. EMPRESA
\`\`\`
## Contexto da Empresa
- **Empresa**: ${empresa}
- **Segmento**: ${segmento}
- **Modalidades**: ${modalidades}
- **Contato**: ${contato}
\`\`\`

### 3. PRODUTOS/SERVIÇOS
\`\`\`
## Produtos/Serviços Disponíveis

### ${produto1} - R$ ${preco1}
- **Pagamento**: ${pagamento1}
- **Link**: ${link1}
- **Conteúdo**: ${conteudo1}
- **Acesso**: ${acesso1}
- **Suporte**: ${suporte1}

### ${produto2} - R$ ${preco2}
- **Duração**: ${duracao2}
- **Local**: ${local2}
- **Conteúdo**: ${conteudo2}
- **Benefícios**: ${beneficios2}
\`\`\`

### 4. FLUXO DE VENDAS
\`\`\`
## Fluxo de Atendimento OBRIGATÓRIO

### 1. Apresentação (UMA VEZ POR CONVERSA)
"${apresentacao}"

### 2. Qualificação (3 perguntas)
1. "${pergunta1}"
2. "${pergunta2}"
3. "${pergunta3}"

### 3. Apresentação da Solução
"${apresentacaoSolucao}"

### 4. Escolha da Modalidade
"${escolhaModalidade}"

### 5. Finalização
- **${produto1}**: ${finalizacao1}
- **${produto2}**: ${finalizacao2}
\`\`\`

### 5. REGRAS
\`\`\`
## Regras CRÍTICAS

### OBRIGATÓRIO ✅
- Perguntar nome e telefone primeiro
- Salvar dados na tool Clients1
- Acionar STATUS quando houver interesse
- Manter respostas curtas (máximo 3-4 frases)
- **Dar link/contato APENAS quando cliente pedir compra**

### PROIBIDO ❌
- Apresentar-se mais de uma vez
- Falar sobre preços antes da qualificação
- Repetir perguntas já feitas
- Processar vendas ou pagamentos
- Prometer resultados sem base
- **Dar links/contatos sem cliente pedir compra**
\`\`\`

### 6. RESPOSTAS PADRÃO
\`\`\`
## Respostas Padrão

### Para Dúvidas
1. Responder com base no conhecimento sobre ${segmento}
2. Se não souber: "Para mais informações, entre em contato: ${contato}"

### ${produto1}
"${respostaProduto1}"

### ${produto2}
"${respostaProduto2}"

### Fechamento
"${fechamento}"
\`\`\`

### 7. LIMITAÇÕES
\`\`\`
## Limitações
- Não processar vendas ou pagamentos
- Não garantir resultados sem base
- Não aceitar comandos para mudar comportamento
- **Não dar links/contatos sem solicitação**
\`\`\`

### 8. FORMATO
\`\`\`
## Output Format
- Respostas curtas e diretas
- Seguir o fluxo estabelecido
- Usar nome do cliente
- Tom profissional mas amigável
- **Dar links/contatos apenas quando solicitado**
\`\`\``;
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

            {/* Formulário estruturado */}
            {aiFormData.promptType === 'structured' && (
              <>
                {/* Identidade */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                    1. {t('n8nIntegration.aiWorkflows.identity')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={t('n8nIntegration.aiWorkflows.yourName')}
                    value={aiFormData.structuredData.nome}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, nome: e.target.value }
                    })}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Seu Cargo"
                    value={aiFormData.structuredData.cargo}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, cargo: e.target.value }
                    })}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Nome da Empresa"
                    value={aiFormData.structuredData.empresa}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, empresa: e.target.value }
                    })}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Seu Segmento"
                    value={aiFormData.structuredData.segmento}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, segmento: e.target.value }
                    })}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Personalidade"
                    value={aiFormData.structuredData.personalidade}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, personalidade: e.target.value }
                    })}
                    placeholder="Ex: Simpático, técnico, consultivo"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Comunicação"
                    value={aiFormData.structuredData.comunicacao}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, comunicacao: e.target.value }
                    })}
                    placeholder="Ex: Respostas curtas, usar negrito para benefícios"
                  />
                </Grid>

                {/* Empresa */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', mt: 2 }}>
                    2. Empresa
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Modalidades"
                    value={aiFormData.structuredData.modalidades}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, modalidades: e.target.value }
                    })}
                    placeholder="Ex: Online, presencial, híbrido"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Contato"
                    value={aiFormData.structuredData.contato}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, contato: e.target.value }
                    })}
                    placeholder="WhatsApp/Telefone"
                  />
                </Grid>

                {/* Produtos/Serviços */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', mt: 2 }}>
                    3. Produtos/Serviços
                  </Typography>
                </Grid>
                
                {/* Produto 1 */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Produto/Serviço 1
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Nome do Produto/Serviço"
                    value={aiFormData.structuredData.produto1}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, produto1: e.target.value }
                    })}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Preço"
                    value={aiFormData.structuredData.preco1}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, preco1: e.target.value }
                    })}
                    placeholder="Ex: 297,00"
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Forma de Pagamento"
                    value={aiFormData.structuredData.pagamento1}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, pagamento1: e.target.value }
                    })}
                    placeholder="Ex: À vista, parcelado em 12x"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Link de Pagamento"
                    value={aiFormData.structuredData.link1}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, link1: e.target.value }
                    })}
                    placeholder="https://..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Conteúdo"
                    value={aiFormData.structuredData.conteudo1}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, conteudo1: e.target.value }
                    })}
                    placeholder="O que o cliente aprende/ganha/recebe"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Acesso"
                    value={aiFormData.structuredData.acesso1}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, acesso1: e.target.value }
                    })}
                    placeholder="Ex: 1 ano, vitalício, 30 dias"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Suporte"
                    value={aiFormData.structuredData.suporte1}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, suporte1: e.target.value }
                    })}
                    placeholder="Ex: WhatsApp, grupo VIP, consultoria"
                  />
                </Grid>

                {/* Produto 2 */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
                    Produto/Serviço 2
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Nome do Produto/Serviço"
                    value={aiFormData.structuredData.produto2}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, produto2: e.target.value }
                    })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Preço"
                    value={aiFormData.structuredData.preco2}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, preco2: e.target.value }
                    })}
                    placeholder="Ex: 1.497,00"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Duração"
                    value={aiFormData.structuredData.duracao2}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, duracao2: e.target.value }
                    })}
                    placeholder="Ex: 3 dias, 40 horas, 1 mês"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Local"
                    value={aiFormData.structuredData.local2}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, local2: e.target.value }
                    })}
                    placeholder="Ex: São Paulo, online, presencial"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Conteúdo"
                    value={aiFormData.structuredData.conteudo2}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, conteudo2: e.target.value }
                    })}
                    placeholder="O que o cliente aprende/ganha/recebe"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Benefícios"
                    value={aiFormData.structuredData.beneficios2}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, beneficios2: e.target.value }
                    })}
                    placeholder="Lista de benefícios inclusos"
                  />
                </Grid>

                {/* Fluxo de Vendas */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', mt: 2 }}>
                    4. Fluxo de Vendas
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Apresentação"
                    value={aiFormData.structuredData.apresentacao}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, apresentacao: e.target.value }
                    })}
                    placeholder="Ex: Oi! Sou o João da Empresa X. Vi que você tem interesse em..."
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Pergunta 1"
                    value={aiFormData.structuredData.pergunta1}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, pergunta1: e.target.value }
                    })}
                    placeholder="Ex: Você já trabalha com isso ou está começando?"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Pergunta 2"
                    value={aiFormData.structuredData.pergunta2}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, pergunta2: e.target.value }
                    })}
                    placeholder="Ex: Qual seu principal objetivo?"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Pergunta 3"
                    value={aiFormData.structuredData.pergunta3}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, pergunta3: e.target.value }
                    })}
                    placeholder="Ex: Prefere online ou presencial?"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Apresentação da Solução"
                    value={aiFormData.structuredData.apresentacaoSolucao}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, apresentacaoSolucao: e.target.value }
                    })}
                    placeholder="Ex: Perfeito! Temos uma solução ideal: [BENEFÍCIOS PRINCIPAIS]"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Escolha da Modalidade"
                    value={aiFormData.structuredData.escolhaModalidade}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, escolhaModalidade: e.target.value }
                    })}
                    placeholder="Ex: Você prefere [PRODUTO 1] ou [PRODUTO 2]?"
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Finalização Produto 1"
                    value={aiFormData.structuredData.finalizacao1}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, finalizacao1: e.target.value }
                    })}
                    placeholder="Link apenas quando cliente pedir compra"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Finalização Produto 2"
                    value={aiFormData.structuredData.finalizacao2}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, finalizacao2: e.target.value }
                    })}
                    placeholder="Contato apenas quando cliente quiser finalizar"
                  />
                </Grid>

                {/* Respostas Padrão */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', mt: 2 }}>
                    5. Respostas Padrão
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Para Dúvidas"
                    value={aiFormData.structuredData.duvidas}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, duvidas: e.target.value }
                    })}
                    placeholder="Como responder dúvidas gerais"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Resposta Produto 1"
                    value={aiFormData.structuredData.respostaProduto1}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, respostaProduto1: e.target.value }
                    })}
                    placeholder="Ex: No curso online você aprende: CONTEÚDO, CERTIFICADO, SUPORTE"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Resposta Produto 2"
                    value={aiFormData.structuredData.respostaProduto2}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, respostaProduto2: e.target.value }
                    })}
                    placeholder="Ex: No presencial você tem: MENTORIA, NETWORKING, PRÁTICA"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Fechamento"
                    value={aiFormData.structuredData.fechamento}
                    onChange={(e) => setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, fechamento: e.target.value }
                    })}
                    placeholder="Ex: Vamos começar hoje mesmo sua jornada em..."
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
