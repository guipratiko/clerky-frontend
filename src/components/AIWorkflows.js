import React, { useState, useEffect, useRef } from 'react';
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
  CircularProgress,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as TestIcon,
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
import { useAuth } from '../contexts/AuthContext';
import {
  getInstances,
  getAIWorkflows,
  createAIWorkflow,
  updateAIWorkflowPrompt,
  updateAIWorkflowWaitTime,
  updateAIWorkflowKanbanTool,
  updateAIWorkflowAudioReply,
  updateAIWorkflowSingleReply,
  testAIWorkflow,
  toggleAIWorkflow,
  deleteAIWorkflow
} from '../services/api';

const AIWorkflowCard = ({ workflow, onToggle, onEdit, onTest, onDelete, testingWorkflow, instanceLabel, t }) => {
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
            <Box>
              <Typography variant="h6" component="h2">
                {workflow.workflowName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {instanceLabel || workflow.instanceDisplayName || workflow.instanceName}
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleOpenMenu} aria-label="Mais opções">
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
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              maxHeight: '60px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {workflow.prompt || 'Nenhum prompt configurado'}
          </Typography>
        </CardContent>
      </Card>

      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            onToggle(workflow._id, !workflow.isActive);
            handleCloseMenu();
          }}
        >
          <ListItemIcon>
            {workflow.isActive ? <HideIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>
            {workflow.isActive ? t('n8nIntegration.aiWorkflows.deactivate') : t('n8nIntegration.aiWorkflows.activate')}
          </ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            onEdit(workflow);
            handleCloseMenu();
          }}
        >
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
            {testingWorkflow === workflow._id ? <CircularProgress size={20} /> : <TestIcon fontSize="small" />}
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

const AIWorkflows = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const [instances, setInstances] = useState([]);
  const [aiWorkflows, setAiWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [editingAIWorkflow, setEditingAIWorkflow] = useState(null);
  const [testingAIWorkflow, setTestingAIWorkflow] = useState(null);
  const promptInputRef = useRef(null);

  const [aiFormData, setAiFormData] = useState({
    instanceName: '',
    prompt: '',
    promptType: 'custom',
    waitTime: 13,
    audioReply: {
      enabled: false,
      voice: 'fable'
    },
    singleReply: {
      enabled: false
    },
    kanbanTool: {
      enabled: false,
      authToken: '',
      targetColumn: 2
    },
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

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [instancesResponse, aiWorkflowsResponse] = await Promise.all([
        getInstances(),
        getAIWorkflows()
      ]);

      const rawInstances = (instancesResponse.data || []).map((instance) => {
        const display = instance.displayName?.trim();
        return {
          ...instance,
          displayLabel: display && display.length > 0 ? display : instance.instanceName
        };
      });

      const rawWorkflows = (aiWorkflowsResponse.data || []).map((workflow) => {
        const matchingInstance = rawInstances.find((inst) => inst.instanceName === workflow.instanceName);
        return {
          ...workflow,
          instanceDisplayName: matchingInstance?.displayLabel || workflow.instanceName
        };
      });

      setInstances(rawInstances);
      setAiWorkflows(rawWorkflows);
    } catch (error) {
      console.error('Erro ao carregar workflows de IA:', error);
      toast.error('Erro ao carregar workflows de IA');
    } finally {
      setLoading(false);
    }
  };

  const getInstanceDisplayName = (instanceName) => {
    if (!instanceName) return '';
    const instance = instances.find((item) => item.instanceName === instanceName);
    if (!instance) return instanceName;
    return instance.displayLabel || instance.displayName || instance.instanceName;
  };

  const handleOpenAIDialog = (workflow = null) => {
    if (workflow) {
      setEditingAIWorkflow(workflow);
      setAiFormData({
        instanceName: workflow.instanceName || '',
        prompt: workflow.prompt || '',
        promptType: 'custom',
        waitTime: workflow.waitTime !== undefined && workflow.waitTime !== null ? workflow.waitTime : 13,
        audioReply: {
          enabled: workflow.audioReply?.enabled === true,
          voice: workflow.audioReply?.voice || 'fable'
        },
        singleReply: {
          enabled: workflow.singleReply?.enabled === true
        },
        kanbanTool: {
          enabled: workflow.kanbanTool?.enabled === true,
          authToken: workflow.kanbanTool?.authToken || '',
          targetColumn: workflow.kanbanTool?.targetColumn || 2
        },
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
        waitTime: 13,
        audioReply: {
          enabled: false,
          voice: 'fable'
        },
        singleReply: {
          enabled: false
        },
        kanbanTool: {
          enabled: false,
          authToken: '',
          targetColumn: 2
        },
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

  const handleInsertPromptVariable = (variable) => {
    if (aiFormData.promptType !== 'custom') return;

    const textarea = promptInputRef.current;
    const hasSelection =
      textarea && typeof textarea.selectionStart === 'number' && typeof textarea.selectionEnd === 'number';

    const selectionStart = hasSelection ? textarea.selectionStart : null;
    const selectionEnd = hasSelection ? textarea.selectionEnd : null;

    setAiFormData((prev) => {
      const start = hasSelection ? selectionStart : prev.prompt.length;
      const end = hasSelection ? selectionEnd : prev.prompt.length;
      const newPrompt = `${prev.prompt.slice(0, start)}${variable}${prev.prompt.slice(end)}`;

      requestAnimationFrame(() => {
        if (promptInputRef.current) {
          const cursorPosition = start + variable.length;
          promptInputRef.current.focus();
          promptInputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
      });

      return {
        ...prev,
        prompt: newPrompt
      };
    });
  };

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

Siga um roteiro consultivo, conduzindo o lead desde o rapport até o fechamento, validando objeções e reforçando a proposta de valor.`;
  };

  const handleSaveAIWorkflow = async () => {
    try {
      if (aiFormData.waitTime < 0 || aiFormData.waitTime > 60) {
        toast.error('O tempo de espera deve estar entre 0 e 60 segundos');
        return;
      }

      if (aiFormData.kanbanTool.enabled && !aiFormData.kanbanTool.authToken) {
        toast.error('Token de autenticação é obrigatório quando a tool de Kanban está ativada');
        return;
      }

      let finalPrompt = aiFormData.prompt;
      if (aiFormData.promptType === 'structured') {
        finalPrompt = generateStructuredPrompt(aiFormData.structuredData);
      }

      const audioReplyConfig = {
        enabled: aiFormData.audioReply?.enabled === true,
        voice: aiFormData.audioReply?.voice || 'fable'
      };

      const singleReplyConfig = {
        enabled: aiFormData.singleReply?.enabled === true
      };

      if (editingAIWorkflow) {
        await updateAIWorkflowPrompt(editingAIWorkflow._id, finalPrompt);
        const waitTimeToUpdate = aiFormData.waitTime !== undefined ? aiFormData.waitTime : 13;
        await updateAIWorkflowWaitTime(editingAIWorkflow._id, waitTimeToUpdate);
        const kanbanToolToUpdate = {
          enabled: aiFormData.kanbanTool?.enabled || false,
          authToken: aiFormData.kanbanTool?.authToken || '',
          targetColumn: aiFormData.kanbanTool?.targetColumn || 2
        };
        await updateAIWorkflowKanbanTool(editingAIWorkflow._id, kanbanToolToUpdate);
        await updateAIWorkflowAudioReply(editingAIWorkflow._id, audioReplyConfig);
        await updateAIWorkflowSingleReply(editingAIWorkflow._id, singleReplyConfig);
        toast.success(t('n8nIntegration.aiWorkflows.workflowUpdated'));
      } else {
        if (!aiFormData.instanceName) {
          toast.error(t('n8nIntegration.aiWorkflows.instanceRequired'));
          return;
        }

        await createAIWorkflow({
          instanceName: aiFormData.instanceName,
          prompt: finalPrompt,
          waitTime: aiFormData.waitTime,
          kanbanTool: aiFormData.kanbanTool,
          audioReply: audioReplyConfig,
          singleReply: singleReplyConfig
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
      toast.success(
        t('n8nIntegration.aiWorkflows.workflowToggled', {
          status: isActive ? t('n8nIntegration.aiWorkflows.activated') : t('n8nIntegration.aiWorkflows.deactivated')
        })
      );
      loadData();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error(t('n8nIntegration.aiWorkflows.workflowToggleError'));
    }
  };

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
        <Typography variant="h4" component="h1" display="flex" alignItems="center" gap={1}>
          <AIIcon />
          {t('n8nIntegration.aiWorkflows.title')}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenAIDialog()} color="secondary">
          {t('n8nIntegration.aiWorkflows.createWorkflow')}
        </Button>
      </Box>

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
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenAIDialog()} color="secondary">
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
                instanceLabel={getInstanceDisplayName(workflow.instanceName)}
                t={t}
              />
            </Grid>
          ))}
        </Grid>
      )}

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
                    {instances.filter((instance) => instance.status === 'connected').length === 0 ? (
                      <MenuItem disabled>{t('n8nIntegration.aiWorkflows.noConnectedInstances')}</MenuItem>
                    ) : (
                      instances
                        .filter((instance) => instance.status === 'connected')
                        .map((instance) => (
                          <MenuItem key={instance.instanceName} value={instance.instanceName}>
                            {instance.displayLabel || instance.displayName || instance.instanceName}
                          </MenuItem>
                        ))
                    )}
                  </Select>
                </FormControl>
              </Grid>
            )}

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

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                ⚙️ Configurações do Workflow
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tempo de Espera (Wait Time): {aiFormData.waitTime}s
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Tempo que o agente aguarda para agrupar mensagens antes de responder (evita responder mensagem por mensagem)
              </Typography>
              <Box sx={{ px: 2 }}>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={aiFormData.waitTime}
                  onChange={(e) => setAiFormData({ ...aiFormData, waitTime: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                📊 Tool de Mudança de Coluna no Kanban
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={aiFormData.kanbanTool.enabled}
                    onChange={(e) =>
                      setAiFormData({
                        ...aiFormData,
                        kanbanTool: { ...aiFormData.kanbanTool, enabled: e.target.checked }
                      })
                    }
                  />
                }
                label="Ativar tool de mudança de coluna"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Permite que o agente mova o contato de coluna quando houver interesse no produto/serviço
              </Typography>
            </Grid>

            {aiFormData.kanbanTool.enabled && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Token de Autenticação"
                    value={aiFormData.kanbanTool.authToken}
                    onChange={(e) =>
                      setAiFormData({
                        ...aiFormData,
                        kanbanTool: { ...aiFormData.kanbanTool, authToken: e.target.value }
                      })
                    }
                    placeholder="Cole seu token JWT aqui"
                    helperText="Token fornecido no card de integração. Exemplo: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Coluna de Destino</InputLabel>
                    <Select
                      value={aiFormData.kanbanTool.targetColumn}
                      onChange={(e) =>
                        setAiFormData({
                          ...aiFormData,
                          kanbanTool: { ...aiFormData.kanbanTool, targetColumn: parseInt(e.target.value) }
                        })
                      }
                      label="Coluna de Destino"
                    >
                      <MenuItem value={1}>Coluna 1 - Novo</MenuItem>
                      <MenuItem value={2}>Coluna 2 - Andamento</MenuItem>
                      <MenuItem value={3}>Coluna 3 - Carrinho</MenuItem>
                      <MenuItem value={4}>Coluna 4 - Aprovado</MenuItem>
                      <MenuItem value={5}>Coluna 5 - Reprovado</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', my: 2 }} />
            </Grid>

            {aiFormData.promptType === 'custom' && (
              <Grid item xs={12}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {t('n8nIntegration.aiWorkflows.promptVariablesTitle')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() =>
                        handleInsertPromptVariable("{{ $('Trata dados pos concatenar').item.json.PrimeiroNome }}")
                      }
                    >
                      {t('n8nIntegration.aiWorkflows.promptVariableFirstName')}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() =>
                        handleInsertPromptVariable("{{ $('Trata dados pos concatenar').item.json.NomeCompleto }}")
                      }
                    >
                      {t('n8nIntegration.aiWorkflows.promptVariableFullName')}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() =>
                        handleInsertPromptVariable("{{ $('Trata dados pos concatenar').item.json.Sobrenome }}")
                      }
                    >
                      {t('n8nIntegration.aiWorkflows.promptVariableLastName')}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() =>
                        handleInsertPromptVariable("{{ $('Trata dados pos concatenar').item.json.telefoneCliente }}")
                      }
                    >
                      {t('n8nIntegration.aiWorkflows.promptVariablePhone')}
                    </Button>
                  </Box>
                </Box>
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
                  inputRef={promptInputRef}
                  required
                />
              </Grid>
            )}

            {aiFormData.promptType === 'structured' && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Informe os principais dados do produto para gerar automaticamente um prompt estruturado com foco em vendas consultivas.
                </Typography>
                {/* Para simplificar, reusar os mesmos campos da versão original */}
                <TextField
                  fullWidth
                  label="Nome do Produto/Serviço"
                  value={aiFormData.structuredData.produtoNome}
                  onChange={(e) =>
                    setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, produtoNome: e.target.value }
                    })
                  }
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Descrição"
                  value={aiFormData.structuredData.produtoDescricao}
                  onChange={(e) =>
                    setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, produtoDescricao: e.target.value }
                    })
                  }
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Principal Transformação"
                  value={aiFormData.structuredData.transformacao}
                  onChange={(e) =>
                    setAiFormData({
                      ...aiFormData,
                      structuredData: { ...aiFormData.structuredData, transformacao: e.target.value }
                    })
                  }
                  sx={{ mb: 2 }}
                />
              </Grid>
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

export default AIWorkflows;
