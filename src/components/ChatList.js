import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  TextField,
  IconButton,
  Badge,
  Chip,
} from '@mui/material';
import { Search as SearchIcon, Sync as SyncIcon } from '@mui/icons-material';
import api from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import moment from 'moment';

const ChatList = ({ instanceName, selectedChat, onSelectChat }) => {
  const { on, off } = useSocket();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Carregar conversas
  const loadChats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/chats/${instanceName}`);
      setChats(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setLoading(false);
    }
  }, [instanceName]);

  // Sincronizar conversas
  const syncChats = async () => {
    try {
      await api.post(`/api/chats/${instanceName}/sync`);
      await loadChats();
    } catch (error) {
      console.error('Erro ao sincronizar conversas:', error);
    }
  };

  useEffect(() => {
    loadChats();

    // Escutar eventos de WebSocket
    const handleNewChat = (data) => {
      setChats(prev => [data.data, ...prev.filter(c => c.chatId !== data.data.chatId)]);
    };

    const handleChatUpdate = (data) => {
      setChats(prev => prev.map(c => c.chatId === data.data.chatId ? data.data : c));
    };

    const handleChatDeleted = (data) => {
      setChats(prev => prev.filter(c => c.chatId !== data.chatId));
    };

    on('new-chat', handleNewChat);
    on('chat-updated', handleChatUpdate);
    on('chat-deleted', handleChatDeleted);

    return () => {
      off('new-chat', handleNewChat);
      off('chat-updated', handleChatUpdate);
      off('chat-deleted', handleChatDeleted);
    };
  }, [instanceName, loadChats, off, on]);

  // Filtrar e ordenar conversas
  const filteredChats = chats
    .filter(chat =>
      chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Usar timestamp da última mensagem para ordenação, com fallback para lastActivity
      const aTime = a.lastMessage?.timestamp || a.lastActivity;
      const bTime = b.lastMessage?.timestamp || b.lastActivity;
      return new Date(bTime) - new Date(aTime);
    });

  const formatLastMessageTime = (timestamp) => {
    const now = moment();
    const messageTime = moment(timestamp);
    
    if (now.diff(messageTime, 'days') === 0) {
      return messageTime.format('HH:mm');
    } else if (now.diff(messageTime, 'days') === 1) {
      return 'Ontem';
    } else if (now.diff(messageTime, 'days') < 7) {
      return messageTime.format('dddd');
    } else {
      return messageTime.format('DD/MM/YYYY');
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, background: '#202c33', borderBottom: '1px solid #313d43' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h6" sx={{ color: '#e9edef', flex: 1 }}>
            Conversas
          </Typography>
          <IconButton onClick={syncChats} sx={{ color: '#8696a0' }}>
            <SyncIcon />
          </IconButton>
        </Box>
        
        <TextField
          fullWidth
          placeholder="Buscar conversas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: '#8696a0', mr: 1 }} />,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              background: '#2a3942',
              color: '#e9edef',
              '& fieldset': { border: 'none' },
            },
            '& .MuiInputBase-input::placeholder': {
              color: '#8696a0',
              opacity: 1,
            },
          }}
        />
      </Box>

      {/* Chat List */}
      <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
        {loading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography sx={{ color: '#8696a0' }}>Carregando...</Typography>
          </Box>
        ) : filteredChats.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography sx={{ color: '#8696a0' }}>
              {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa'}
            </Typography>
          </Box>
        ) : (
          filteredChats.map((chat) => (
            <ListItem
              key={chat._id}
              onClick={() => onSelectChat(chat)}
              sx={{
                cursor: 'pointer',
                background: selectedChat?.chatId === chat.chatId ? '#2a3942' : 'transparent',
                '&:hover': { background: '#2a3942' },
                borderBottom: '1px solid #313d43',
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={chat.profilePicture}
                  sx={{ width: 48, height: 48 }}
                >
                  {chat.name.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              
              <ListItemText
                disableTypography
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: '#e9edef',
                        fontWeight: chat.unreadCount > 0 ? 600 : 400,
                        fontSize: '1rem',
                      }}
                    >
                      {chat.name}
                    </Typography>
                    
                    {chat.lastMessage?.timestamp && (
                      <Typography
                        variant="caption"
                        sx={{ color: '#8696a0', fontSize: '0.75rem' }}
                      >
                        {formatLastMessageTime(chat.lastMessage.timestamp)}
                      </Typography>
                    )}
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#8696a0',
                        fontSize: '0.875rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '200px',
                      }}
                    >
                      {chat.lastMessage?.fromMe ? '✓ ' : ''}
                      {chat.lastMessage?.content || 'Sem mensagens'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {chat.isPinned && (
                        <Chip size="small" label="📌" sx={{ minWidth: 'auto', height: 20 }} />
                      )}
                      {chat.isMuted && (
                        <Chip size="small" label="🔇" sx={{ minWidth: 'auto', height: 20 }} />
                      )}
                      {chat.unreadCount > 0 && (
                        <Badge
                          badgeContent={chat.unreadCount > 999 ? '999+' : chat.unreadCount}
                          color="primary"
                          sx={{
                            '& .MuiBadge-badge': {
                              background: '#00a884',
                              color: 'white',
                              fontSize: '0.75rem',
                            },
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default ChatList;
