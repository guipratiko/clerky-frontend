import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import CategoryIcon from '@mui/icons-material/Category';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ApiIcon from '@mui/icons-material/Api';
import DeleteIcon from '@mui/icons-material/Delete';
import toast from 'react-hot-toast';
import api from '../../services/api';
import MindClerkyBuilder from './MindClerkyBuilder';
import MindClerkyExecutionList from './MindClerkyExecutionList';
import MindClerkyTemplates from './MindClerkyTemplates';
import { useInstance } from '../../contexts/InstanceContext';

const MindClerkyPage = () => {
  const [loading, setLoading] = useState(true);
  const [flows, setFlows] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [mode, setMode] = useState('list'); // list | builder | executions
  const { instances } = useInstance();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [flowToDelete, setFlowToDelete] = useState(null);

  const fetchFlows = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/mind-clerky/flows');
      setFlows(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar fluxos MindClerky:', error);
      toast.error(error.response?.data?.error || 'Erro ao carregar fluxos MindClerky');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await api.get('/api/mind-clerky/templates');
      setTemplates(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar templates MindClerky:', error);
    }
  }, []);

  useEffect(() => {
    fetchFlows();
    fetchTemplates();
  }, [fetchFlows, fetchTemplates]);

  const handleCreateFlow = async () => {
    if (!instances || instances.length === 0) {
      toast.error('Nenhuma instância disponível. Crie ou selecione uma instância antes de criar um fluxo.');
      return;
    }

    const defaultInstance = instances[0];
    const defaultNodeId = `node-${Date.now()}`;

    try {
      const response = await api.post('/api/mind-clerky/flows', {
        name: `Fluxo MindClerky ${new Date().toLocaleString('pt-BR')}`,
        description: 'Fluxo criado automaticamente. Personalize no builder.',
        instanceName: defaultInstance.instanceName,
        status: 'draft',
        triggers: [
          {
            type: 'manual',
            metadata: {
              createdFrom: 'frontend'
            }
          }
        ],
        nodes: [
          {
            id: defaultNodeId,
            type: 'whatsapp-message',
            name: 'Mensagem inicial',
            position: { x: 320, y: 180 },
            data: {
              templateType: 'text',
              content: {
                text: 'Olá {{contact.name || "Cliente"}}, estamos aqui para ajudar.'
              }
            }
          }
        ],
        edges: [],
        settings: {
          logging: { level: 'info', storePayloads: true }
        }
      });
      toast.success('Fluxo criado em rascunho');
      setSelectedFlow(response.data.data);
      setMode('builder');
      fetchFlows();
    } catch (error) {
      console.error('Erro ao criar fluxo MindClerky:', error);
      toast.error(error.response?.data?.error || 'Erro ao criar fluxo MindClerky');
    }
  };

  const handleOpenBuilder = (flow) => {
    setSelectedFlow(flow);
    setMode('builder');
  };

  const handleOpenExecutions = (flow) => {
    setSelectedFlow(flow);
    setMode('executions');
  };

  const handleActivateFlow = async (flow) => {
    try {
      const response = await api.post(`/api/mind-clerky/flows/${flow._id}/status`, {
        status: 'active'
      });
      toast.success('Fluxo ativado!');
      fetchFlows();
    } catch (error) {
      console.error('Erro ao ativar fluxo MindClerky:', error);
      toast.error(error.response?.data?.error || 'Erro ao ativar fluxo');
    }
  };

  const handleConfirmDelete = (flow) => {
    setFlowToDelete(flow);
    setDeleteDialogOpen(true);
  };

  const handleDeleteFlow = async () => {
    if (!flowToDelete) return;

    try {
      await api.delete(`/api/mind-clerky/flows/${flowToDelete._id}`);
      toast.success('Fluxo removido com sucesso');
      setDeleteDialogOpen(false);
      setFlowToDelete(null);
      fetchFlows();
    } catch (error) {
      console.error('Erro ao deletar fluxo MindClerky:', error);
      toast.error(error.response?.data?.error || 'Erro ao deletar fluxo');
    }
  };

  const handleBackToList = () => {
    setMode('list');
    setSelectedFlow(null);
    fetchFlows();
  };

  const activeFlows = useMemo(
    () => flows.filter((flow) => flow.status === 'active'),
    [flows]
  );

  const draftFlows = useMemo(() => {
    const result = flows.filter((flow) => flow.status !== 'active');
    return result;
  }, [flows]);

  if (mode === 'builder' && selectedFlow) {
    return (
      <MindClerkyBuilder
        flow={selectedFlow}
        onClose={handleBackToList}
        onRefresh={fetchFlows}
        templates={templates}
      />
    );
  }

  if (mode === 'executions' && selectedFlow) {
    return (
      <MindClerkyExecutionList
        flow={selectedFlow}
        onClose={handleBackToList}
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            MindClerky
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Construa fluxos inteligentes de atendimento, combine IA e disparos em massa e monitore resultados em tempo real.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchFlows}
          >
            Atualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateFlow}
          >
            Novo Fluxo
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              mb: 3,
              background: 'linear-gradient(140deg, rgba(16,27,43,0.9), rgba(30,64,95,0.85))',
              color: '#f1f5f9'
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <DesignServicesIcon fontSize="large" />
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Builder Visual de Fluxos
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Arraste e conecte nós com curvas Bézier para criar funis completos que unem disparos em massa, IA e automações.
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  Fluxos Ativos
                </Typography>
                <Chip color="success" label={activeFlows.length} size="small" />
              </Stack>

              {loading ? (
                <Stack alignItems="center" py={4}>
                  <CircularProgress />
                </Stack>
              ) : activeFlows.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nenhum fluxo ativo. Ative um fluxo para automatizar seus atendimentos.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {activeFlows.map((flow) => (
                    <Grid item xs={12} md={6} key={flow._id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Stack spacing={1}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle1" fontWeight={600}>
                                {flow.name}
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip label="Ativo" size="small" color="success" />
                                <Tooltip title="Excluir fluxo">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleConfirmDelete(flow)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                              Instância: {flow.instanceName || 'N/A'}
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              {(flow.tags || []).map((tag) => (
                                <Chip key={tag} label={tag} size="small" />
                              ))}
                            </Stack>
                          </Stack>
                        </CardContent>
                        <CardActions>
                          <Button size="small" startIcon={<DesignServicesIcon />} onClick={() => handleOpenBuilder(flow)}>
                            Builder
                          </Button>
                          <Button size="small" startIcon={<PlayArrowIcon />} onClick={() => handleOpenExecutions(flow)}>
                            Execuções
                          </Button>
                          {flow.status !== 'active' && (
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="success"
                              startIcon={<PlayArrowIcon />} 
                              onClick={() => handleActivateFlow(flow)}
                            >
                              Ativar
                            </Button>
                          )}
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}

              <Divider sx={{ my: 3 }} />

              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  Rascunhos
                </Typography>
                <Chip label={draftFlows.length} size="small" />
              </Stack>

              {loading ? (
                <Stack alignItems="center" py={4}>
                  <CircularProgress />
                </Stack>
              ) : draftFlows.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nenhum rascunho. Crie um novo fluxo para começar.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {draftFlows.map((flow) => (
                    <Grid item xs={12} md={6} key={flow._id}>
                      <Card variant="outlined" sx={{ borderStyle: 'dashed' }}>
                        <CardContent>
                          <Stack spacing={1}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle1" fontWeight={600}>
                                {flow.name}
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip label={flow.status} size="small" />
                                <Tooltip title="Excluir fluxo">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleConfirmDelete(flow)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                              Atualizado em {new Date(flow.updatedAt).toLocaleString('pt-BR')}
                            </Typography>
                          </Stack>
                        </CardContent>
                        <CardActions>
                          <Button size="small" startIcon={<DesignServicesIcon />} onClick={() => handleOpenBuilder(flow)}>
                            Builder
                          </Button>
                          <Button size="small" startIcon={<PlayArrowIcon />} onClick={() => handleOpenExecutions(flow)}>
                            Execuções
                          </Button>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            color="success"
                            startIcon={<PlayArrowIcon />} 
                            onClick={() => handleActivateFlow(flow)}
                          >
                            Ativar
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <MindClerkyTemplates
            templates={templates}
            onRefresh={fetchTemplates}
            onUseTemplate={(template) => {
              setSelectedFlow(template);
              setMode('builder');
            }}
          />

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <ApiIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Execuções recentes
                </Typography>
              </Stack>
              <MindClerkyExecutionList compact />
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <CategoryIcon color="secondary" />
                <Typography variant="h6" fontWeight={600}>
                  Biblioteca de templates
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Explore funis prontos (boas-vindas, recuperação de carrinho, pós-venda) e personalize para suas instâncias.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

    <Dialog
      open={deleteDialogOpen}
      onClose={() => {
        setDeleteDialogOpen(false);
        setFlowToDelete(null);
      }}
    >
      <DialogTitle>Remover fluxo</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Tem certeza de que deseja remover o fluxo "{flowToDelete?.name}"? Esta ação não pode ser desfeita.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteDialogOpen(false)}>
          Cancelar
        </Button>
        <Button color="error" onClick={handleDeleteFlow}>
          Remover
        </Button>
      </DialogActions>
    </Dialog>
    </Box>
  );
};

export default MindClerkyPage;

