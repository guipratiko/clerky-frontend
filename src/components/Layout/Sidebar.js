import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Divider,
  Tooltip,
  Avatar,
  Chip,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Chat as ChatIcon,
  ViewKanban as KanbanIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  People as PeopleIcon,
  Campaign as CampaignIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon,
  Send as SendIcon,
  Webhook as WebhookIcon,
  Description as DocsIcon
} from '@mui/icons-material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useInstance } from '../../contexts/InstanceContext';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import LanguageSelector from '../LanguageSelector';

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 64;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { instanceName } = useParams();
  const { getInstance } = useInstance();
  const { user, logout, isAdmin } = useAuth();
  const { t } = useI18n();
  
  const currentInstance = instanceName ? getInstance(instanceName) : null;

  const menuItems = [
    {
      text: t('nav.home'),
      icon: <HomeIcon />,
      path: '/',
      description: 'Página inicial do sistema'
    },
    {
      text: t('nav.instances'),
      icon: <BusinessIcon />,
      path: '/instances',
      description: 'Gerenciar conexões WhatsApp'
    },
    {
      text: t('nav.campaigns'),
      icon: <SendIcon />,
      path: '/mass-dispatch',
      description: 'Envio de mensagens em massa'
    },
    {
      text: t('nav.webhooks'),
      icon: <WebhookIcon />,
      path: '/n8n-integration',
      description: 'Configurar integrações com N8N'
    },
    {
      text: t('nav.documentation'),
      icon: <DocsIcon />,
      path: '/webhook-docs',
      description: 'Guia completo de integração via webhooks'
    },
    ...(isAdmin() ? [{
      text: t('nav.admin'),
      icon: <AdminIcon />,
      path: '/admin',
      description: 'Gerenciar usuários e aprovações'
    }] : []),
    ...(instanceName ? [
      {
        text: t('nav.dashboard'),
        icon: <DashboardIcon />,
        path: `/dashboard/${instanceName}`,
        description: 'Visão geral e métricas'
      },
      {
        text: t('nav.chat'),
        icon: <ChatIcon />,
        path: `/chat/${instanceName}`,
        description: 'Conversas do WhatsApp'
      },
      {
        text: t('nav.kanban'),
        icon: <KanbanIcon />,
        path: `/crm/${instanceName}`,
        description: 'Gerenciamento de leads'
      },
      {
        text: t('nav.contacts'),
        icon: <PeopleIcon />,
        path: `/contacts/${instanceName}`,
        description: 'Lista de contatos'
      },
      {
        text: t('nav.campaigns'),
        icon: <CampaignIcon />,
        path: `/campaigns/${instanceName}`,
        description: 'Disparos em massa'
      },
      {
        text: 'Relatórios',
        icon: <AnalyticsIcon />,
        path: `/reports/${instanceName}`,
        description: 'Análises e relatórios'
      },
      {
        text: 'Configurações',
        icon: <SettingsIcon />,
        path: `/settings/${instanceName}`,
        description: 'Configurações da instância'
      }
    ] : [])
  ];

  const handleToggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(180deg, #1e1e2e 0%, #2d2d44 100%)',
      borderRight: '1px solid rgba(255,255,255,0.1)'
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        minHeight: 64
      }}>
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon sx={{ color: '#00a884', fontSize: 28 }} />
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#fff',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #00a884 0%, #26d367 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Clerky CRM
            </Typography>
          </Box>
        )}
        
        <IconButton 
          onClick={handleToggleCollapsed}
          sx={{ 
            color: 'rgba(255,255,255,0.7)',
            '&:hover': { 
              color: '#00a884',
              background: 'rgba(0,168,132,0.1)' 
            }
          }}
        >
          {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      {/* Instance Info */}
      {currentInstance && (
        <Box sx={{ 
          p: collapsed ? 1 : 2, 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: collapsed ? 0 : 2
        }}>
          <Avatar 
            sx={{ 
              width: collapsed ? 32 : 40, 
              height: collapsed ? 32 : 40,
              background: 'linear-gradient(135deg, #00a884 0%, #128c7e 100%)',
              fontSize: collapsed ? '0.8rem' : '1rem'
            }}
          >
            {currentInstance.instanceName.charAt(0).toUpperCase()}
          </Avatar>
          
          {!collapsed && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: '#fff',
                  fontWeight: 600,
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }}
              >
                {currentInstance.instanceName}
              </Typography>
              <Chip
                label={currentInstance.status === 'connected' ? 'Conectado' : 'Desconectado'}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  background: currentInstance.status === 'connected' 
                    ? 'rgba(0,168,132,0.2)' 
                    : 'rgba(241,92,109,0.2)',
                  color: currentInstance.status === 'connected' ? '#00a884' : '#f15c6d',
                  border: `1px solid ${currentInstance.status === 'connected' ? '#00a884' : '#f15c6d'}`,
                  '& .MuiChip-label': {
                    padding: '0 6px'
                  }
                }}
              />
            </Box>
          )}
        </Box>
      )}

      {/* Menu Items */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ pt: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ px: collapsed ? 0.5 : 1 }}>
              <Tooltip 
                title={collapsed ? `${item.text} - ${item.description}` : ''} 
                placement="right"
                arrow
              >
                <ListItemButton
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    minHeight: 48,
                    borderRadius: 2,
                    mx: 0.5,
                    mb: 0.5,
                    background: isActive(item.path) 
                      ? 'linear-gradient(135deg, rgba(0,168,132,0.2) 0%, rgba(38,211,103,0.1) 100%)'
                      : 'transparent',
                    border: isActive(item.path) ? '1px solid rgba(0,168,132,0.3)' : '1px solid transparent',
                    color: isActive(item.path) ? '#00a884' : 'rgba(255,255,255,0.8)',
                    '&:hover': {
                      background: isActive(item.path)
                        ? 'linear-gradient(135deg, rgba(0,168,132,0.3) 0%, rgba(38,211,103,0.2) 100%)'
                        : 'rgba(255,255,255,0.05)',
                      color: '#00a884',
                      transform: 'translateX(4px)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    },
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    px: collapsed ? 0 : 2,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed ? 'auto' : 40,
                      color: 'inherit',
                      justifyContent: 'center'
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  
                  {!collapsed && (
                    <ListItemText 
                      primary={item.text}
                      secondary={item.description}
                      primaryTypographyProps={{
                        fontSize: '0.9rem',
                        fontWeight: isActive(item.path) ? 600 : 500
                      }}
                      secondaryTypographyProps={{
                        fontSize: '0.75rem',
                        color: 'rgba(255,255,255,0.5)'
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* User Info */}
      <Box sx={{ 
        p: collapsed ? 1 : 2, 
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Tooltip title={collapsed ? `${user?.name} - ${user?.email}` : ''} placement="right">
          <ListItemButton
            onClick={collapsed ? handleUserMenuOpen : handleUserMenuOpen}
            sx={{
              borderRadius: 2,
              background: 'rgba(255,255,255,0.05)',
              '&:hover': {
                background: 'rgba(255,255,255,0.1)',
              },
              justifyContent: collapsed ? 'center' : 'flex-start',
              px: collapsed ? 0 : 2,
            }}
          >
            <ListItemIcon sx={{ minWidth: collapsed ? 'auto' : 40, justifyContent: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  background: 'linear-gradient(135deg, #00a884 0%, #128c7e 100%)',
                  fontSize: '0.9rem'
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </ListItemIcon>
            
            {!collapsed && (
              <ListItemText
                primary={user?.name}
                secondary={user?.email}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: '#fff',
                  noWrap: true
                }}
                secondaryTypographyProps={{
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.7)',
                  noWrap: true
                }}
              />
            )}
          </ListItemButton>
        </Tooltip>

        {!collapsed && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.7rem',
              display: 'block',
              textAlign: 'center',
              mt: 1
            }}
          >
            {t('app.name')}
          </Typography>
        )}
        
        {/* Language Selector */}
        <Box sx={{ 
          p: 2, 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <LanguageSelector />
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
            boxSizing: 'border-box',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflowX: 'hidden',
            background: 'transparent',
            border: 'none'
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 2,
            minWidth: 200
          }
        }}
      >
        <MenuItem onClick={handleUserMenuClose} sx={{ color: '#fff', '&:hover': { background: 'rgba(255,255,255,0.1)' } }}>
          <ListItemIcon sx={{ color: '#fff' }}>
            <AccountIcon />
          </ListItemIcon>
          Perfil
        </MenuItem>
        
        {isAdmin() && (
          <MenuItem onClick={() => { handleUserMenuClose(); navigate('/admin'); }} sx={{ color: '#fff', '&:hover': { background: 'rgba(255,255,255,0.1)' } }}>
            <ListItemIcon sx={{ color: '#00a884' }}>
              <AdminIcon />
            </ListItemIcon>
            Painel Admin
          </MenuItem>
        )}
        
        <Divider sx={{ background: 'rgba(255,255,255,0.1)' }} />
        
        <MenuItem onClick={handleLogout} sx={{ color: '#f15c6d', '&:hover': { background: 'rgba(241,92,109,0.1)' } }}>
          <ListItemIcon sx={{ color: '#f15c6d' }}>
            <LogoutIcon />
          </ListItemIcon>
          Sair
        </MenuItem>
      </Menu>
    </>
  );
};

export default Sidebar;
