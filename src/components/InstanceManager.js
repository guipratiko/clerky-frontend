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
  // TextField,
  FormControlLabel,
  Switch,
  CircularProgress,
  Avatar,
  Tooltip,
  Paper
  // Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  PlayArrow as ConnectIcon,
  Stop as DisconnectIcon,
  Delete as DeleteIcon,
  QrCode as QrCodeIcon,
  WhatsApp as WhatsAppIcon,
  RestartAlt as RestartIcon,
  Dashboard as DashboardIcon,
  ContentCopy as CopyIcon,
  Key as KeyIcon
} from '@mui/icons-material';
import { useInstance } from '../contexts/InstanceContext';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const InstanceManager = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { 
    instances, 
    loading, 
    loadInstances, 
    createInstance, 
    connectInstance,
    restartInstance,
    logoutInstance,
    deleteInstance 
  } = useInstance();
  const { socket, connected: socketConnected } = useSocket();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);
  const [newlyCreatedInstance, setNewlyCreatedInstance] = useState(null);
  const [formData, setFormData] = useState({
    rejectCall: false,
    groupsIgnore: true,
    alwaysOnline: false,
    readMessages: false,
    readStatus: false,
  });

  // Escutar eventos WebSocket
  useEffect(() => {
    if (!socketConnected) return;

    // Escutar eventos de QR code atualizado
    const handleQrCodeUpdate = (event) => {
      console.log('🔔 QR Code recebido via WebSocket:', event);
      
      // Acessar dados diretamente do evento
      const data = event.data || event;
      
      if (data.instanceName && data.qrCode) {
        console.log(`📱 QR Code para instância: ${data.instanceName}`);
        
        // Se a instância for recém-criada, abrir popup automaticamente
        if (newlyCreatedInstance === data.instanceName) {
          console.log(`🎯 Abrindo popup automático para: ${data.instanceName}`);
          handleShowQrCode(data.qrCode);
          setNewlyCreatedInstance(null); // Reset após mostrar
        }
        
        // Atualizar instâncias para mostrar QR code nos cards
        loadInstances();
        toast.success(`QR Code gerado para ${data.instanceName}`);
      }
    };

    // Escutar status das instâncias
    const handleInstanceStatus = (event) => {
      console.log('🔔 Status da instância atualizado:', event);
      
      // Acessar dados diretamente do evento
      const data = event.data || event;
      
      if (data.status === 'connected' && newlyCreatedInstance === data.instanceName) {
        toast.success(`Instância ${data.instanceName} conectada com sucesso!`);
        setQrDialogOpen(false); // Fechar popup se estiver aberto
        setNewlyCreatedInstance(null);
      }
      
      // Atualizar lista de instâncias
      loadInstances();
    };

    // Registrar listeners
    socket.on('qr-code-updated', handleQrCodeUpdate);
    socket.on('instance-status', handleInstanceStatus);

    // Cleanup
    return () => {
      socket.off('qr-code-updated', handleQrCodeUpdate);
      socket.off('instance-status', handleInstanceStatus);
    };
  }, [socketConnected, socket, newlyCreatedInstance, loadInstances]);

  // Manipular mudanças no formulário
  const handleInputChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Copiar token para área de transferência
  const handleCopyToken = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedToken(true);
      toast.success('Token copiado para a área de transferência!');
      setTimeout(() => setCopiedToken(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar token:', error);
      toast.error('Erro ao copiar token');
    }
  };

  // Gerar nome de instância aleatório de 7 caracteres
  const generateRandomInstanceName = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 7; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Criar nova instância
  const handleCreateInstance = async () => {
    try {
      // Gerar nome de instância aleatório
      const randomInstanceName = generateRandomInstanceName();

      const settings = {
        rejectCall: formData.rejectCall,
        groupsIgnore: formData.groupsIgnore,
        alwaysOnline: formData.alwaysOnline,
        readMessages: formData.readMessages,
        readStatus: formData.readStatus,
      };

      // Marcar como nova instância para abrir popup automaticamente
      setNewlyCreatedInstance(randomInstanceName);

      await createInstance({
        instanceName: randomInstanceName,
        settings,
      });

      setCreateDialogOpen(false);
      
      // Manter temporariamente o nome da instância para aguardar o QR code
      const createdInstanceName = randomInstanceName;
      
      setFormData({
        rejectCall: false,
        groupsIgnore: true,
        alwaysOnline: false,
        readMessages: false,
        readStatus: false,
      });

      // Informar ao usuário que está aguardando o QR code
      toast.success(`Instância ${createdInstanceName} criada! Nome gerado automaticamente. Aguardando QR Code...`);

    } catch (error) {
      console.error('Erro ao criar instância:', error);
      setNewlyCreatedInstance(null); // Reset em caso de erro
    }
  };

  // Conectar instância
  const handleConnect = async (instanceName) => {
    try {
      await connectInstance(instanceName);
    } catch (error) {
      console.error('Erro ao conectar:', error);
    }
  };

  // Reiniciar instância
  const handleRestart = async (instanceName) => {
    try {
      await restartInstance(instanceName);
    } catch (error) {
      console.error('Erro ao reiniciar:', error);
    }
  };

  // Logout da instância
  const handleLogout = async (instanceName) => {
    try {
      await logoutInstance(instanceName);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Deletar instância
  const handleDelete = async (instanceName) => {
    if (window.confirm('Tem certeza que deseja deletar esta instância?')) {
      try {
        await deleteInstance(instanceName);
      } catch (error) {
        console.error('Erro ao deletar:', error);
      }
    }
  };

  // Mostrar QR Code
  const handleShowQrCode = (qrCodeImage) => {
    try {
      if (qrCodeImage) {
        // A Evolution API já envia a imagem base64 pronta, só precisamos mostrar
        console.log('📱 Abrindo popup com QR Code da Evolution API');
        setSelectedQrCode(qrCodeImage);
        setQrDialogOpen(true);
      }
    } catch (error) {
      console.error('Erro ao exibir QR Code:', error);
      toast.error('Erro ao exibir QR Code');
    }
  };


  // Abrir CRM da instância
  const handleOpenCRM = (instanceName) => {
    navigate(`/crm/${instanceName}`);
  };

  // Obter cor do status
  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'success';
      case 'connecting':
        return 'warning';
      case 'created':
        return 'info';
      case 'disconnected':
        return 'error';
      default:
        return 'default';
    }
  };

  // Obter texto do status
  const getStatusText = (status) => {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'connecting':
        return 'Conectando';
      case 'created':
        return 'Criado';
      case 'disconnected':
        return 'Desconectado';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <WhatsAppIcon sx={{ fontSize: 32, color: '#00a884' }} />
          <Typography variant="h4" sx={{ color: '#e9edef', fontWeight: 'bold' }}>
            Gerenciador de Conexões
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip
            label={socketConnected ? 'WebSocket Conectado' : 'WebSocket Desconectado'}
            color={socketConnected ? 'success' : 'error'}
            variant="outlined"
          />
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadInstances}
            disabled={loading}
          >
            Atualizar
          </Button>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ background: '#00a884', '&:hover': { background: '#008069' } }}
          >
            Nova Instância
          </Button>
        </Box>
      </Box>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Grid de Instâncias */}
      <Grid container spacing={3}>
        {instances.map((instance) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={instance._id}>
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
                {/* Header da instância */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    src={instance.profilePicture}
                    sx={{ width: 40, height: 40, mr: 2, background: '#00a884' }}
                  >
                    <WhatsAppIcon />
                  </Avatar>
                  
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ color: '#e9edef', fontSize: '1rem' }}>
                      {instance.instanceName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#8696a0' }}>
                      {instance.phone || 'Não conectado'}
                    </Typography>
                  </Box>
                </Box>

                {/* Status */}
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={getStatusText(instance.status)}
                    color={getStatusColor(instance.status)}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  
                  <Typography variant="body2" sx={{ color: '#8696a0' }}>
                    Última atividade: {new Date(instance.lastSeen).toLocaleString()}
                  </Typography>
                </Box>

                {/* Token de Autenticação */}
                <Paper 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #333',
                    borderRadius: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <KeyIcon sx={{ color: '#00a884', mr: 1, fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ color: '#e9edef', fontWeight: 600 }}>
                      Token de Autenticação
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#8696a0', 
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        flex: 1,
                        wordBreak: 'break-all',
                        backgroundColor: '#0a0a0a',
                        p: 1,
                        borderRadius: 1,
                        border: '1px solid #333'
                      }}
                    >
                      {token ? `${token.substring(0, 20)}...` : 'Token não disponível'}
                    </Typography>
                    
                    <Tooltip title={copiedToken ? "Copiado!" : "Copiar token"}>
                      <IconButton
                        size="small"
                        onClick={handleCopyToken}
                        sx={{ 
                          color: copiedToken ? '#00a884' : '#8696a0',
                          '&:hover': { color: '#00a884' }
                        }}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
                    Use este token para enviar mensagens via API
                  </Typography>
                </Paper>

                {/* QR Code se disponível */}
                {instance.qrCode && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<QrCodeIcon />}
                    onClick={() => handleShowQrCode(instance.qrCode)}
                    sx={{ mb: 2, color: '#00a884', borderColor: '#00a884' }}
                  >
                    Mostrar QR Code
                  </Button>
                )}
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                {/* Ações primárias */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {instance.status === 'connected' ? (
                    <Tooltip title="Abrir CRM">
                      <IconButton
                        onClick={() => handleOpenCRM(instance.instanceName)}
                        sx={{ color: '#2196f3' }}
                      >
                        <DashboardIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Conectar">
                      <IconButton
                        onClick={() => handleConnect(instance.instanceName)}
                        sx={{ color: '#00a884' }}
                        disabled={loading}
                      >
                        <ConnectIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  <Tooltip title="Reiniciar">
                    <IconButton
                      onClick={() => handleRestart(instance.instanceName)}
                      sx={{ color: '#ffab00' }}
                      disabled={loading}
                    >
                      <RestartIcon />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Ações secundárias */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Logout">
                    <IconButton
                      onClick={() => handleLogout(instance.instanceName)}
                      sx={{ color: '#f15c6d' }}
                      disabled={loading}
                    >
                      <DisconnectIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Deletar">
                    <IconButton
                      onClick={() => handleDelete(instance.instanceName)}
                      sx={{ color: '#f15c6d' }}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Mensagem quando não há instâncias */}
      {!loading && instances.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '50vh',
            textAlign: 'center',
          }}
        >
          <WhatsAppIcon sx={{ fontSize: 64, color: '#8696a0', mb: 2 }} />
          <Typography variant="h5" sx={{ color: '#e9edef', mb: 1 }}>
            Nenhuma instância encontrada
          </Typography>
          <Typography variant="body1" sx={{ color: '#8696a0', mb: 3 }}>
            Crie sua primeira instância para começar
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ background: '#00a884', '&:hover': { background: '#008069' } }}
          >
            Criar Instância
          </Button>
        </Box>
      )}

      {/* Dialog Criar Instância */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { background: '#202c33', color: '#e9edef' }
        }}
      >
        <DialogTitle>Criar Nova Instância</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#8696a0', mb: 2 }}>
            O nome da instância será gerado automaticamente (7 caracteres aleatórios).
            O token também será criado automaticamente pelo sistema.
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 2, color: '#e9edef' }}>
            Configurações
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={formData.rejectCall}
                onChange={handleInputChange('rejectCall')}
                color="primary"
              />
            }
            label="Rejeitar chamadas"
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.groupsIgnore}
                onChange={handleInputChange('groupsIgnore')}
                color="primary"
              />
            }
            label="Ignorar grupos"
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.alwaysOnline}
                onChange={handleInputChange('alwaysOnline')}
                color="primary"
              />
            }
            label="Sempre online"
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.readMessages}
                onChange={handleInputChange('readMessages')}
                color="primary"
              />
            }
            label="Ler mensagens automaticamente"
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.readStatus}
                onChange={handleInputChange('readStatus')}
                color="primary"
              />
            }
            label="Ler status automaticamente"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateInstance}
            variant="contained"
            disabled={loading}
            sx={{ background: '#00a884', '&:hover': { background: '#008069' } }}
          >
            {loading ? <CircularProgress size={20} /> : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog QR Code */}
      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            background: '#202c33', 
            color: '#e9edef',
            textAlign: 'center'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <WhatsAppIcon sx={{ color: '#00a884', fontSize: 32 }} />
            <Typography variant="h5" component="span">
              Conectar Instância
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2, color: '#e9edef', fontWeight: 500 }}>
            Escaneie o QR Code com seu WhatsApp
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 3, color: '#8696a0' }}>
            1. Abra o WhatsApp no seu telefone<br />
            2. Toque em "Mais opções" → "Dispositivos conectados"<br />
            3. Toque em "Conectar um dispositivo"<br />
            4. Aponte para esta tela e escaneie o código
          </Typography>

          {selectedQrCode ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <img
                src={selectedQrCode}
                alt="QR Code"
                style={{
                  maxWidth: '280px',
                  width: '100%',
                  height: 'auto',
                  border: '4px solid #00a884',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 168, 132, 0.3)'
                }}
              />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <CircularProgress sx={{ color: '#00a884' }} />
            </Box>
          )}

          <Typography variant="caption" sx={{ color: '#8696a0', display: 'block' }}>
            O código será atualizado automaticamente a cada 20 segundos
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            onClick={() => setQrDialogOpen(false)}
            variant="outlined"
            sx={{ 
              color: '#8696a0', 
              borderColor: '#313d43',
              '&:hover': {
                borderColor: '#8696a0'
              }
            }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InstanceManager;
