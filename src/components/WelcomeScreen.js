import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { WhatsApp as WhatsAppIcon, Sync as SyncIcon } from '@mui/icons-material';
import { useInstance } from '../contexts/InstanceContext';

const WelcomeScreen = ({ instanceName }) => {
  const { api } = useInstance();

  const handleSyncAll = async () => {
    try {
      // Sincronizar contatos e conversas
      await Promise.all([
        api.post(`/contacts/${instanceName}/sync`),
        api.post(`/chats/${instanceName}/sync`),
      ]);
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
    }
  };

  return (
    <Box
      className="chat-background"
      sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b141a',
        position: 'relative',
      }}
    >
      <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
        <WhatsAppIcon sx={{ fontSize: 120, color: '#54656f', mb: 3 }} />
        
        <Typography variant="h4" sx={{ color: '#e9edef', mb: 2, fontWeight: 300 }}>
          WhatsApp Web
        </Typography>
        
        <Typography variant="body1" sx={{ color: '#8696a0', mb: 4, lineHeight: 1.6 }}>
          Agora você pode enviar e receber mensagens sem manter seu telefone conectado à internet.
        </Typography>
        
        <Typography variant="body2" sx={{ color: '#8696a0', mb: 3 }}>
          Selecione uma conversa para começar a conversar ou sincronize seus dados.
        </Typography>

        <Button
          variant="outlined"
          startIcon={<SyncIcon />}
          onClick={handleSyncAll}
          sx={{
            color: '#00a884',
            borderColor: '#00a884',
            '&:hover': {
              borderColor: '#008069',
              background: 'rgba(0, 168, 132, 0.04)',
            },
          }}
        >
          Sincronizar Contatos e Conversas
        </Button>
      </Box>
    </Box>
  );
};

export default WelcomeScreen;
