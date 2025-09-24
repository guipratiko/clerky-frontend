import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  // IconButton,
  Chip,
  Button,
  Paper,
  Container
} from '@mui/material';
import {
  WhatsApp as WhatsAppIcon,
  Dashboard as DashboardIcon,
  Chat as ChatIcon,
  Business as BusinessIcon,
  // TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Support as SupportIcon,
  ArrowForward as ArrowForwardIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useInstance } from '../contexts/InstanceContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { instances } = useInstance();

  const features = [
    {
      icon: <WhatsAppIcon sx={{ fontSize: 40, color: '#00a884' }} />,
      title: 'Conexões WhatsApp',
      description: 'Gerencie múltiplas instâncias do WhatsApp Business de forma centralizada',
      color: 'linear-gradient(135deg, #00a884 0%, #008069 100%)'
    },
    {
      icon: <DashboardIcon sx={{ fontSize: 40, color: '#667eea' }} />,
      title: 'Dashboard Avançado',
      description: 'Monitore métricas, estatísticas e performance em tempo real',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      icon: <BusinessIcon sx={{ fontSize: 40, color: '#f093fb' }} />,
      title: 'CRM Integrado',
      description: 'Sistema Kanban para gestão de leads e pipeline de vendas',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: '#4facfe' }} />,
      title: 'Alta Performance',
      description: 'Processamento rápido de mensagens com WebSocket em tempo real',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: '#43e97b' }} />,
      title: 'Segurança',
      description: 'Conexões seguras e dados protegidos com criptografia avançada',
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    {
      icon: <SupportIcon sx={{ fontSize: 40, color: '#fa709a' }} />,
      title: 'Suporte 24/7',
      description: 'Assistência técnica completa e documentação detalhada',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    }
  ];

  const stats = [
    { label: 'Instâncias Ativas', value: instances.filter(i => i.status === 'connected').length, color: '#00a884' },
    { label: 'Total de Instâncias', value: instances.length, color: '#667eea' },
    { label: 'Desconectadas', value: instances.filter(i => i.status === 'disconnected').length, color: '#f44336' },
    { label: 'Conectando', value: instances.filter(i => i.status === 'connecting').length, color: '#ff9800' }
  ];

  const handleNavigateToInstances = () => {
    navigate('/instances');
  };

  const handleNavigateToInstance = (instanceName) => {
    navigate(`/chat/${instanceName}`);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      position: 'relative'
    }}>
      {/* Background Effects */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 20%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(244, 67, 54, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(0, 168, 132, 0.1) 0%, transparent 50%)
        `,
        zIndex: 0
      }} />
      
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ py: 6 }}>
          {/* Hero Section */}
          <Box sx={{ 
            textAlign: 'center', 
            mb: 8,
            py: 4
          }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                mx: 'auto',
                mb: 4,
                background: 'linear-gradient(135deg, #00a884 0%, #008069 100%)',
                boxShadow: '0 20px 60px rgba(0, 168, 132, 0.3)'
              }}
            >
              <WhatsAppIcon sx={{ fontSize: 60 }} />
            </Avatar>
            
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #fff 0%, #e0e0e0 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              Gerenciador de Conexões
            </Typography>
            
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'rgba(255,255,255,0.7)',
                mb: 4,
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Plataforma completa para gerenciamento de múltiplas instâncias WhatsApp Business
              com Evolution API
            </Typography>

            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleNavigateToInstances}
                startIcon={<SettingsIcon />}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #00a884 0%, #008069 100%)',
                  color: '#fff',
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 10px 30px rgba(0, 168, 132, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #008069 0%, #00695c 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 15px 40px rgba(0, 168, 132, 0.5)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                Gerenciar Conexões
              </Button>

              {instances.length > 0 && (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => handleNavigateToInstance(instances[0].instanceName)}
                  startIcon={<ChatIcon />}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: '#fff',
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#667eea',
                      background: 'rgba(102, 126, 234, 0.1)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  Abrir Chat
                </Button>
              )}
            </Box>
          </Box>

          {/* Stats Section */}
          <Grid container spacing={3} sx={{ mb: 8 }}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 3,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      background: 'rgba(255,255,255,0.08)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: stat.color,
                      mb: 1
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255,255,255,0.7)',
                      fontWeight: 500
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Features Section */}
          <Box sx={{ mb: 6 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                textAlign: 'center',
                fontWeight: 700,
                color: '#fff',
                mb: 2
              }}
            >
              Recursos Principais
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                textAlign: 'center',
                color: 'rgba(255,255,255,0.7)',
                mb: 6,
                maxWidth: '600px',
                mx: 'auto'
              }}
            >
              Descubra todas as funcionalidades que fazem desta plataforma a melhor escolha
              para seu negócio
            </Typography>

            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      background: 'rgba(255,255,255,0.05)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 3,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-10px)',
                        background: 'rgba(255,255,255,0.08)',
                        boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
                        '& .feature-icon': {
                          transform: 'scale(1.1) rotate(5deg)'
                        }
                      }
                    }}
                  >
                    <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 3
                      }}>
                        <Avatar
                          className="feature-icon"
                          sx={{
                            width: 70,
                            height: 70,
                            background: feature.color,
                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        >
                          {feature.icon}
                        </Avatar>
                      </Box>
                      
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700,
                          color: '#fff',
                          mb: 2
                        }}
                      >
                        {feature.title}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'rgba(255,255,255,0.7)',
                          lineHeight: 1.6,
                          flex: 1
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Quick Actions */}
          {instances.length > 0 && (
            <Box sx={{ 
              textAlign: 'center',
              py: 6,
              borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                  color: '#fff',
                  mb: 4
                }}
              >
                Acesso Rápido às Instâncias
              </Typography>
              
              <Grid container spacing={3} justifyContent="center">
                {instances.slice(0, 6).map((instance, index) => (
                  <Grid item key={index}>
                    <Paper
                      onClick={() => handleNavigateToInstance(instance.instanceName)}
                      sx={{
                        p: 3,
                        minWidth: 200,
                        background: 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 3,
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          background: 'rgba(255,255,255,0.08)',
                          boxShadow: '0 15px 40px rgba(0,0,0,0.3)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            background: instance.status === 'connected' 
                              ? 'linear-gradient(135deg, #00a884 0%, #008069 100%)'
                              : 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)'
                          }}
                        >
                          <WhatsAppIcon />
                        </Avatar>
                        <Box sx={{ flex: 1, textAlign: 'left' }}>
                          <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600 }}>
                            {instance.instanceName}
                          </Typography>
                          <Chip
                            size="small"
                            label={instance.status === 'connected' ? 'Conectado' : 
                                   instance.status === 'connecting' ? 'Conectando' : 'Desconectado'}
                            color={instance.status === 'connected' ? 'success' : 
                                   instance.status === 'connecting' ? 'warning' : 'error'}
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
