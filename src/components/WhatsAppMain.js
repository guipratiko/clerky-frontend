import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Chip } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useInstance } from '../contexts/InstanceContext';
import { useI18n } from '../contexts/I18nContext';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import WelcomeScreen from './WelcomeScreen';

const WhatsAppMain = () => {
  const { instanceName } = useParams();
  const { joinInstance, connected } = useSocket();
  const { getInstance } = useInstance();
  const { t } = useI18n();
  const [selectedChat, setSelectedChat] = useState(null);
  const [instance, setInstance] = useState(null);

  useEffect(() => {
    if (instanceName) {
      // Obter dados da instância
      const instanceData = getInstance(instanceName);
      setInstance(instanceData);

      // Conectar ao WebSocket da instância
      if (connected) {
        joinInstance(instanceName);
      }
    }
  }, [instanceName, connected, joinInstance, getInstance]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
  };

  if (!instance) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: '#111b21'
      }}>
        <Typography variant="h6" sx={{ color: '#e9edef' }}>
          {t('whatsapp.loadingInstance')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        background: 'rgba(32, 44, 51, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Typography variant="h6" sx={{ color: '#e9edef', flex: 1 }}>
          {t('whatsapp.title')}
        </Typography>
        
        <Chip
          label={instance.status === 'connected' ? t('whatsapp.connected') : t('whatsapp.disconnected')}
          color={instance.status === 'connected' ? 'success' : 'error'}
          size="small"
        />
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Grid container sx={{ height: '100%' }}>
          {/* Chat List */}
          <Grid item xs={4} sx={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}>
            <ChatList
              instanceName={instanceName}
              selectedChat={selectedChat}
              onSelectChat={handleSelectChat}
            />
          </Grid>

          {/* Chat Window */}
          <Grid item xs={8}>
            {selectedChat ? (
              <ChatWindow
                open={Boolean(selectedChat)}
                onClose={handleCloseChat}
                instanceName={instanceName}
                chat={selectedChat}
              />
            ) : (
              <WelcomeScreen instanceName={instanceName} />
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default WhatsAppMain;
