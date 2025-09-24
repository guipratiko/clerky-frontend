import React, { useEffect, useRef } from 'react';
import { Box, Typography, Avatar, Paper } from '@mui/material';
import moment from 'moment';
import AudioPlayer from './AudioPlayer';

const MessageList = ({ messages, loading, instanceName, chatId }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Auto-scroll para o final
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (timestamp) => {
    return moment(timestamp).format('HH:mm');
  };

  // Função para obter URL do áudio
  const getAudioUrl = (message) => {
    // Priorizar audioUrl (URL do WhatsApp para mensagens recebidas)
    if (message.content?.audioUrl) {
      return message.content.audioUrl;
    }

    // Se for uma mensagem de áudio enviada, construir URL baseada no fileName
    if (message.content?.fileName) {
      return `${process.env.REACT_APP_UPLOADS_URL}/audio/${message.content.fileName}`;
    }

    // Fallback para media (URL do WhatsApp)
    if (message.content?.media) {
      return message.content.media;
    }

    return null;
  };

  // Função para download de áudio
  const handleAudioDownload = (audioUrl, fileName) => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = fileName || 'audio.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderMessage = (message) => {
    const isFromMe = message.fromMe;

    return (
      <Box
        key={message._id}
        className="message-item"
        sx={{
          display: 'flex',
          justifyContent: isFromMe ? 'flex-end' : 'flex-start',
          mb: 1,
          px: 2,
        }}
      >
        {!isFromMe && (
          <Avatar
            sx={{ width: 32, height: 32, mr: 1, alignSelf: 'flex-end' }}
          >
            {message.from.charAt(0).toUpperCase()}
          </Avatar>
        )}
        
        <Paper
          className={`message-bubble ${isFromMe ? 'sent' : 'received'}`}
          elevation={1}
          sx={{
            maxWidth: '70%',
            p: 1.5,
            borderRadius: 2,
            background: isFromMe ? '#005c4b' : '#202c33',
            color: '#e9edef',
            position: 'relative',
          }}
        >
          {/* Conteúdo da mensagem */}
          {message.messageType === 'text' ? (
            <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 0.5 }}>
              {message.content.text}
            </Typography>
          ) : (
            <Box sx={{ mb: 0.5 }}>
              {message.messageType === 'image' && (
                <Box>
                  <Typography variant="body2" sx={{ color: '#8696a0', mb: 1 }}>
                    📷 Imagem
                  </Typography>
                  {message.content.caption && (
                    <Typography variant="body2">
                      {message.content.caption}
                    </Typography>
                  )}
                </Box>
              )}
              
              {message.messageType === 'video' && (
                <Box>
                  <Typography variant="body2" sx={{ color: '#8696a0', mb: 1 }}>
                    🎥 Vídeo
                  </Typography>
                  {message.content.caption && (
                    <Typography variant="body2">
                      {message.content.caption}
                    </Typography>
                  )}
                </Box>
              )}
              
              {message.messageType === 'audio' && (
                <AudioPlayer
                  audioUrl={getAudioUrl(message)}
                  fileName={message.content?.fileName || 'Áudio'}
                  duration={message.content?.seconds || 0}
                  isFromMe={isFromMe}
                  timestamp={message.timestamp}
                  onDownload={handleAudioDownload}
                />
              )}
              
              {message.messageType === 'document' && (
                <Box>
                  <Typography variant="body2" sx={{ color: '#8696a0', mb: 1 }}>
                    📄 {message.content.fileName || 'Documento'}
                  </Typography>
                  {message.content.caption && (
                    <Typography variant="body2">
                      {message.content.caption}
                    </Typography>
                  )}
                </Box>
              )}
              
              {message.messageType === 'sticker' && (
                <Typography variant="body2" sx={{ color: '#8696a0' }}>
                  🙂 Figurinha
                </Typography>
              )}
              
              {message.messageType === 'ptt' && (
                <AudioPlayer
                  audioUrl={getAudioUrl(message)}
                  fileName={message.content?.fileName || 'Áudio de Voz'}
                  duration={message.content?.seconds || 0}
                  isFromMe={isFromMe}
                  timestamp={message.timestamp}
                  onDownload={handleAudioDownload}
                />
              )}
            </Box>
          )}

          {/* Timestamp e status */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 0.5,
              mt: 0.5,
            }}
          >
            <Typography variant="caption" sx={{ color: '#8696a0', fontSize: '0.7rem' }}>
              {formatTime(message.timestamp)}
            </Typography>
            
            {isFromMe && (
              <Box
                className={`status-indicator status-${message.status}`}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: message.status === 'read' ? '#00a884' : '#8696a0',
                }}
              />
            )}
          </Box>
        </Paper>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100%',
        background: '#0b141a'
      }}>
        <Typography sx={{ color: '#8696a0' }}>
          Carregando mensagens...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      className="messages-container chat-background"
      sx={{
        height: '100%',
        overflowY: 'auto',
        background: '#0b141a',
        py: 1,
      }}
    >
      {messages.length === 0 ? (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%'
        }}>
          <Typography sx={{ color: '#8696a0' }}>
            Nenhuma mensagem ainda. Comece a conversar!
          </Typography>
        </Box>
      ) : (
        messages.map(renderMessage)
      )}
    </Box>
  );
};

export default MessageList;
