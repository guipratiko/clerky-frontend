import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Refresh,
  Storage,
  Api,
  Computer,
  Memory,
  Speed,
  Cloud
} from '@mui/icons-material';

const StatusPage = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/status');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setStatus(data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(`Erro ao carregar status dos serviços: ${err.message}`);
      console.error('Erro ao buscar status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Atualizar automaticamente a cada 30 segundos
    const interval = setInterval(fetchStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return 'success';
      case 'checking':
        return 'info';
      case 'degraded':
        return 'warning';
      case 'offline':
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return <CheckCircle color="success" />;
      case 'checking':
        return <CircularProgress size={20} />;
      case 'degraded':
        return <Warning color="warning" />;
      case 'offline':
      case 'error':
        return <Error color="error" />;
      default:
        return <Warning color="warning" />;
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading && !status) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default'
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4
          }}
        >
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              Status dos Serviços
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Monitoramento em tempo real dos serviços do sistema
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {lastUpdate && (
              <Typography variant="caption" color="text.secondary">
                Última atualização: {lastUpdate.toLocaleTimeString()}
              </Typography>
            )}
            <Tooltip title="Atualizar status">
              <IconButton onClick={fetchStatus} disabled={loading}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Status Geral */}
        {status && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                {getStatusIcon(status.overall?.status)}
                <Typography variant="h5">
                  Status Geral: {status.overall?.status?.toUpperCase()}
                </Typography>
                <Chip
                  label={status.overall?.status}
                  color={getStatusColor(status.overall?.status)}
                  size="small"
                />
              </Box>
              <Typography variant="body1" color="text.secondary">
                {status.overall?.message}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Verificado em: {new Date(status.timestamp).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Erro */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Serviços */}
        {status?.services && (
          <Grid container spacing={3}>
            {/* API */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Api color="primary" />
                    <Typography variant="h6">API Backend</Typography>
                    <Chip
                      label={status.services.api?.status}
                      color={getStatusColor(status.services.api?.status)}
                      size="small"
                    />
                  </Box>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Speed />
                      </ListItemIcon>
                      <ListItemText
                        primary="Uptime"
                        secondary={formatUptime(status.services.api?.uptime || 0)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Computer />
                      </ListItemIcon>
                      <ListItemText
                        primary="Versão"
                        secondary={status.services.api?.version || 'N/A'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Memory />
                      </ListItemIcon>
                      <ListItemText
                        primary="Memória"
                        secondary={`${formatBytes(status.services.api?.memory?.rss || 0)} RSS`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Database */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Storage color="primary" />
                    <Typography variant="h6">Database</Typography>
                    <Chip
                      label={status.services.database?.status}
                      color={getStatusColor(status.services.database?.status)}
                      size="small"
                    />
                  </Box>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Cloud />
                      </ListItemIcon>
                      <ListItemText
                        primary="Estado da Conexão"
                        secondary={status.services.database?.connection || 'N/A'}
                      />
                    </ListItem>
                    {status.services.database?.responseTime && (
                      <ListItem>
                        <ListItemIcon>
                          <Speed />
                        </ListItemIcon>
                        <ListItemText
                          primary="Tempo de Resposta"
                          secondary={status.services.database.responseTime}
                        />
                      </ListItem>
                    )}
                    {status.services.database?.collections && (
                      <ListItem>
                        <ListItemIcon>
                          <Storage />
                        </ListItemIcon>
                        <ListItemText
                          primary="Coleções"
                          secondary={status.services.database.collections}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Evolution API */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Api color="primary" />
                    <Typography variant="h6">Evolution API</Typography>
                    <Chip
                      label={status.services.evolutionApi?.status}
                      color={getStatusColor(status.services.evolutionApi?.status)}
                      size="small"
                    />
                  </Box>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Computer />
                      </ListItemIcon>
                      <ListItemText
                        primary="Instâncias Totais"
                        secondary={Array.isArray(status.services.evolutionApi?.instances) 
                          ? status.services.evolutionApi.instances.length 
                          : status.services.evolutionApi?.totalInstances || 0}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle />
                      </ListItemIcon>
                      <ListItemText
                        primary="Instâncias Ativas"
                        secondary={Array.isArray(status.services.evolutionApi?.instances) 
                          ? status.services.evolutionApi.instances.filter(inst => inst.status === 'connected').length
                          : status.services.evolutionApi?.activeInstances || 0}
                      />
                    </ListItem>
                    {status.services.evolutionApi?.responseTime && (
                      <ListItem>
                        <ListItemIcon>
                          <Speed />
                        </ListItemIcon>
                        <ListItemText
                          primary="Tempo de Resposta"
                          secondary={status.services.evolutionApi.responseTime}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Sistema */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Computer color="primary" />
                    <Typography variant="h6">Sistema</Typography>
                  </Box>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Computer />
                      </ListItemIcon>
                      <ListItemText
                        primary="Plataforma"
                        secondary={status.services.system?.platform || 'N/A'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Speed />
                      </ListItemIcon>
                      <ListItemText
                        primary="Node.js"
                        secondary={status.services.system?.nodeVersion || 'N/A'}
                      />
                    </ListItem>
                    {status.services.system?.memory && (
                      <ListItem>
                        <ListItemIcon>
                          <Memory />
                        </ListItemIcon>
                        <ListItemText
                          primary="Memória"
                          secondary={`${status.services.system.memory.used || 0}${status.services.system.memory.unit || 'MB'} / ${status.services.system.memory.total || 0}${status.services.system.memory.unit || 'MB'}`}
                        />
                      </ListItem>
                    )}
                    {status.services.system?.uptime && (
                      <ListItem>
                        <ListItemIcon>
                          <Speed />
                        </ListItemIcon>
                        <ListItemText
                          primary="Uptime do Sistema"
                          secondary={status.services.system.uptime.human || formatUptime(status.services.system.uptime.seconds || 0)}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Webhook */}
            {status.services.webhook && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Api color="primary" />
                      <Typography variant="h6">Webhook</Typography>
                      <Chip
                        label={status.services.webhook?.status}
                        color={getStatusColor(status.services.webhook?.status)}
                        size="small"
                      />
                    </Box>
                    
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <Cloud />
                        </ListItemIcon>
                        <ListItemText
                          primary="URL"
                          secondary={status.services.webhook?.url || 'N/A'}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        )}

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Sistema de Monitoramento - Clerky CRM
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default StatusPage;
