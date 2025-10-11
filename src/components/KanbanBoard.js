import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Chip,
  Tooltip,
  // Divider,
  // Card,
  // CardContent,
  // Grid,
  // Badge
} from '@mui/material';
import {
  Settings as SettingsIcon,
  DragIndicator as DragIndicatorIcon,
  Delete as DeleteIcon,
  // Phone as PhoneIcon,
  // Email as EmailIcon,
  // LocationOn as LocationIcon,
  // Business as BusinessIcon,
  // Person as PersonIcon,
  // CalendarToday as CalendarIcon,
  // AttachMoney as MoneyIcon,
  // Star as StarIcon,
  // Flag as FlagIcon,
  MoreVert as MoreVertIcon,
  // Edit as EditIcon,
  // Call as CallIcon,
  Message as MessageIcon,
  History as HistoryIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import { useInstance } from '../contexts/InstanceContext';
import { useSocket } from '../contexts/SocketContext';
import { useI18n } from '../contexts/I18nContext';
import ChatWindow from './ChatWindow';
import toast from 'react-hot-toast';
import api from '../services/api';

// Componente para renderizar o item sendo arrastado
const DragItem = React.memo(({ provided, snapshot, chat, onClick }) => {
  const { t } = useI18n();
  const displayName = chat.pushName || chat.name || chat.originalName || t('crm.contact');
  const initials = displayName.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  
  // Debug: verificar se o nome está sendo perdido
  if (displayName === t('crm.contact') && chat.chatId) {
    console.log('🚨 DragItem - Nome perdido:', {
      chatId: chat.chatId,
      pushName: chat.pushName,
      name: chat.name,
      originalName: chat.originalName,
      finalDisplayName: displayName
    });
  }
  const item = (
    <Paper
      ref={provided.innerRef}
      {...provided.draggableProps}
      sx={{
        mb: 1.5,
        p: 2,
        cursor: 'grab',
        position: snapshot.isDragging ? 'fixed' : 'relative',
        zIndex: snapshot.isDragging ? 10000 : 'auto',
        background: snapshot.isDragging 
          ? 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(240,240,255,0.98) 100%)'
          : 'rgba(255,255,255,0.1)',
        backdropFilter: snapshot.isDragging ? 'blur(20px)' : 'blur(10px)',
        border: snapshot.isDragging 
          ? '3px solid rgba(102, 126, 234, 1)'
          : '1px solid rgba(255,255,255,0.2)',
        borderRadius: 3,
        boxShadow: snapshot.isDragging 
          ? '0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
          : '0 4px 20px rgba(0,0,0,0.2)',
        transform: snapshot.isDragging 
          ? 'rotate(2deg) scale(1.05)' 
          : 'none',
        transition: snapshot.isDragging 
          ? 'none' 
          : 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        '&:hover': !snapshot.isDragging ? {
          background: 'rgba(255,255,255,0.15)',
          transform: 'translateY(-4px) scale(1.02)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        } : {},
        color: snapshot.isDragging ? '#333' : '#fff',
        '&:active': {
          cursor: 'grabbing'
        },
        // Garantir que o item fique sempre visível
        pointerEvents: snapshot.isDragging ? 'none' : 'auto',
        // Otimizações de performance
        willChange: snapshot.isDragging ? 'transform' : 'auto',
        backfaceVisibility: 'hidden',
        perspective: '1000px',
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar 
          sx={{ 
            width: 44, 
            height: 44, 
            background: snapshot.isDragging 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #00a884 0%, #128c7e 100%)',
            boxShadow: snapshot.isDragging 
              ? '0 8px 24px rgba(102, 126, 234, 0.3)'
              : '0 4px 12px rgba(0, 168, 132, 0.3)',
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}
        >
          {initials}
        </Avatar>
        
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600,
              color: snapshot.isDragging ? '#333' : '#fff',
              fontSize: '0.95rem',
              mb: 0.5,
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }}
          >
            {displayName}
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: snapshot.isDragging ? 'rgba(51, 51, 51, 0.7)' : 'rgba(255,255,255,0.7)',
              fontSize: '0.8rem',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              maxWidth: '200px'
            }}
          >
            {chat.lastMessage || t('crm.noMessage')}
          </Typography>
          
          {chat.lastMessageTime && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: snapshot.isDragging ? 'rgba(51, 51, 51, 0.5)' : 'rgba(255,255,255,0.5)',
                fontSize: '0.7rem',
                display: 'block',
                mt: 0.5
              }}
            >
              {new Date(chat.lastMessageTime).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          )}
        </Box>
        
        <Box {...provided.dragHandleProps} sx={{
          opacity: snapshot.isDragging ? 1 : 0.7,
          transition: 'all 0.2s',
          '&:hover': {
            opacity: 1,
            transform: 'scale(1.2)'
          }
        }}>
          <DragIndicatorIcon sx={{ 
            color: snapshot.isDragging ? 'rgba(51, 51, 51, 0.7)' : 'rgba(255,255,255,0.7)',
            fontSize: '1.2rem'
          }} />
        </Box>
      </Box>
      
      {/* Ferramentas de CRM */}
      {!snapshot.isDragging && (
        <Box sx={{ 
          mt: 1.5, 
          pt: 1.5, 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title={t('crm.sendMessage')}>
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  // Abrir chat para este contato
                  console.log('Abrir chat para:', chat.chatId);
                }}
                sx={{ 
                  color: 'rgba(255,255,255,0.6)',
                  '&:hover': { color: '#00a884', backgroundColor: 'rgba(0,168,132,0.1)' }
                }}
              >
                <MessageIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={t('crm.history')}>
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  // Abrir histórico do contato
                  console.log('Abrir histórico para:', chat.chatId);
                }}
                sx={{ 
                  color: 'rgba(255,255,255,0.6)',
                  '&:hover': { color: '#00a884', backgroundColor: 'rgba(0,168,132,0.1)' }
                }}
              >
                <HistoryIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={t('crm.tasks')}>
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  // Abrir tarefas do contato
                  console.log('Abrir tarefas para:', chat.chatId);
                }}
                sx={{ 
                  color: 'rgba(255,255,255,0.6)',
                  '&:hover': { color: '#00a884', backgroundColor: 'rgba(0,168,132,0.1)' }
                }}
              >
                <AssignmentIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Chip 
              label={t('crm.lead')} 
              size="small" 
              sx={{ 
                backgroundColor: 'rgba(0,168,132,0.2)',
                color: '#00a884',
                fontSize: '0.7rem',
                height: '20px'
              }} 
            />
            
            <Tooltip title={t('crm.moreOptions')}>
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  // Abrir menu de opções
                  console.log('Abrir menu de opções para:', chat.chatId);
                }}
                sx={{ 
                  color: 'rgba(255,255,255,0.6)',
                  '&:hover': { color: '#00a884', backgroundColor: 'rgba(0,168,132,0.1)' }
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}
    </Paper>
  );

  // Se estiver sendo arrastado, renderizar em um portal para garantir z-index
  if (snapshot.isDragging) {
    return createPortal(item, document.body);
  }

  return item;
});

const KanbanBoard = () => {
  const { instanceName } = useParams();
  const { getInstance } = useInstance();
  const { socket, on, off } = useSocket();
  const { t } = useI18n();
  const [columns, setColumns] = useState([
    { id: 'novo', title: t('crm.newContact'), chats: [] },
    { id: 'andamento', title: t('crm.inProgress'), chats: [] },
    { id: 'carrinho', title: t('crm.abandonedCart'), chats: [] },
    { id: 'aprovado', title: t('crm.approved'), chats: [] },
    { id: 'reprovado', title: t('crm.rejected'), chats: [] }
  ]);
  
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [settingsMenuAnchor, setSettingsMenuAnchor] = useState(null);
  const [editingColumn, setEditingColumn] = useState(null);
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const [tempColumnNames, setTempColumnNames] = useState({});
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [deletingAllChats, setDeletingAllChats] = useState(false);
  
  // Cache de nomes para preservar nomes durante atualizações WebSocket
  const [nameCache, setNameCache] = useState(new Map());

  // Função para carregar nomes das colunas do localStorage
  const loadColumnNames = useCallback(() => {
    try {
      const savedNames = localStorage.getItem(`kanban-column-names-${instanceName}`);
      if (savedNames) {
        const parsedNames = JSON.parse(savedNames);
        setColumns(prevColumns => 
          prevColumns.map(column => ({
            ...column,
            title: parsedNames[column.id] || column.title
          }))
        );
      }
    } catch (error) {
      console.error(t('crm.errorLoadingColumns'), error);
    }
  }, [instanceName, t]);

  // Função para salvar nomes das colunas no localStorage
  const saveColumnNames = useCallback((columnNames) => {
    try {
      localStorage.setItem(`kanban-column-names-${instanceName}`, JSON.stringify(columnNames));
    } catch (error) {
      console.error(t('crm.errorSavingColumns'), error);
    }
  }, [instanceName, t]);

  // Carregar dados da instância e conversas
  const loadInstance = useCallback(async () => {
    if (!instanceName) return;
    
    try {
      const response = await getInstance(instanceName);
      if (response) {
        console.log('✅ Instância carregada:', response.instanceName);
      }
    } catch (error) {
      console.error('Erro ao carregar instância:', error);
    }
  }, [instanceName, getInstance]);

  // Função simplificada - nomes vêm apenas de CONTACTS_UPSERT e MESSAGES_UPSERT

  // Recarregar conversas
  const refreshChats = useCallback(async () => {
    if (!instanceName) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/api/chats/${instanceName}`);
      
      if (response.data.success && response.data.data) {
        // Mapear dados para formato compatível e ordenar por última atividade
        const mappedChats = response.data.data.map(chat => {
          console.log('🔍 Mapeando chat:', {
            chatId: chat.chatId,
            name: chat.name,
            lastMessage: chat.lastMessage,
            lastActivity: chat.lastActivity
          });
          
          return {
            ...chat,
            id: chat._id || chat.chatId,
            remoteJid: chat.chatId,
            pushName: chat.pushName, // Manter pushName original (pode ser null)
            name: chat.name, // Manter name original
            lastMessage: chat.lastMessage?.content || 'Nenhuma mensagem',
            lastMessageTime: chat.lastMessage?.timestamp || chat.lastActivity
          };
        });

        // Aplicar nomes dos contatos (sem busca externa - apenas dados locais)
        const chatsWithNames = mappedChats.map(chat => {
          // Priorizar pushName quando disponível, senão usar name ou número
          const finalName = chat.pushName || chat.name || chat.chatId?.replace('@s.whatsapp.net', '') || 'Contato';
          
          const chatWithName = {
            ...chat,
            pushName: chat.pushName, // Manter pushName original
            name: finalName, // Usar nome final para exibição
            originalName: chat.pushName || chat.name,
            apiName: null // Não usar mais API externa
          };
          
          // Atualizar cache com o nome
          setNameCache(prev => {
            const newCache = new Map(prev);
            newCache.set(chat.chatId, {
              pushName: chat.pushName, // Manter pushName original
              name: finalName, // Usar nome final para exibição
              originalName: chat.pushName || chat.name,
              apiName: null
            });
            return newCache;
          });
          
          return chatWithName;
        });

        const sortedChats = chatsWithNames
          .sort((a, b) => {
            // Usar timestamp da última mensagem para ordenação, com fallback para lastActivity
            const aTime = a.lastMessage?.timestamp || a.lastActivity;
            const bTime = b.lastMessage?.timestamp || b.lastActivity;
            return new Date(bTime) - new Date(aTime);
          })
          .slice(0, 50);

        // Distribuir chats nas colunas corretas baseado no campo kanbanColumn
        setColumns(prevColumns => {
          const newColumns = prevColumns.map(column => ({ ...column, chats: [] }));
          
          sortedChats.forEach(chat => {
            const columnId = chat.kanbanColumn || 'novo';
            const columnIndex = newColumns.findIndex(col => col.id === columnId);
            
            if (columnIndex !== -1) {
              newColumns[columnIndex].chats.push(chat);
            } else {
              // Se a coluna não existe, colocar na primeira (novo)
              newColumns[0].chats.push(chat);
            }
          });
          
          // Garantir que cada coluna mantenha os chats ordenados por timestamp da última mensagem (mais recentes primeiro)
          newColumns.forEach(column => {
            column.chats.sort((a, b) => {
              // Usar timestamp da última mensagem para ordenação, com fallback para lastActivity
              const aTime = a.lastMessage?.timestamp || a.lastActivity;
              const bTime = b.lastMessage?.timestamp || b.lastActivity;
              return new Date(bTime) - new Date(aTime);
            });
          });
          
          return newColumns;
        });
        
        // toast.success('Conversas atualizadas!'); // Removido para reduzir poluição visual
      }
    } catch (error) {
      console.error('Erro ao recarregar conversas:', error);
      toast.error('Erro ao recarregar conversas');
    } finally {
      setLoading(false);
    }
  }, [instanceName]);

  // Join/Leave instância para WebSocket
  useEffect(() => {
    if (socket && instanceName) {
      console.log(`🔌 Conectando ao WebSocket para instância: ${instanceName}`);
      socket.emit('join-instance', instanceName);
      
      return () => {
        console.log(`🔌 Desconectando do WebSocket para instância: ${instanceName}`);
        socket.emit('leave-instance', instanceName);
      };
    }
  }, [socket, instanceName]);

  // Escutar eventos WebSocket para tempo real
  useEffect(() => {
    if (!instanceName || !socket) return;

    // Nova conversa
    // Nova conversa - nomes vêm apenas de CONTACTS_UPSERT e MESSAGES_UPSERT
    const handleNewChat = (data) => {
      const newChat = data.data;
      setColumns(prev => {
        const newColumns = [...prev];
        // Adicionar na primeira coluna se não existir
        if (!newColumns[0].chats.find(c => c.chatId === newChat.chatId)) {
          const finalName = newChat.pushName || newChat.name || newChat.chatId?.replace('@s.whatsapp.net', '') || 'Contato';
          
          const mappedChat = {
            ...newChat,
            id: newChat._id || newChat.chatId,
            remoteJid: newChat.chatId,
            pushName: finalName,
            name: finalName,
            lastMessage: newChat.lastMessage?.content || 'Nova conversa',
            lastMessageTime: newChat.lastMessage?.timestamp || newChat.lastActivity
          };
          newColumns[0] = {
            ...newColumns[0],
            chats: [...newColumns[0].chats, mappedChat]
          };
          
          // Ordenar a coluna por lastActivity (mais recentes primeiro)
          newColumns[0].chats.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
          toast.success('Nova conversa recebida!');
        }
        return newColumns;
      });
    };

    // Conversa atualizada - nomes vêm apenas de CONTACTS_UPSERT e MESSAGES_UPSERT
    const handleChatUpdate = (data) => {
      const updatedChat = data.data;
      
      setColumns(prev => {
        const newColumns = [...prev];
        let needsColumnMove = false;
        let sourceColumnIndex = -1;
        let destColumnIndex = -1;
        let chatToMove = null;
        
        // Procurar a conversa em todas as colunas
        for (let i = 0; i < newColumns.length; i++) {
          const chatIndex = newColumns[i].chats.findIndex(chat => 
            chat.chatId === updatedChat.chatId
          );
          
          if (chatIndex !== -1) {
            sourceColumnIndex = i;
            const currentChat = newColumns[i].chats[chatIndex];
            const finalName = updatedChat.name || currentChat.pushName || currentChat.name || updatedChat.chatId?.replace('@s.whatsapp.net', '') || 'Contato';
            
            // Verificar se a coluna mudou
            const newColumnId = updatedChat.kanbanColumn || newColumns[i].id;
            if (newColumnId !== newColumns[i].id) {
              // Precisa mover para outra coluna
              needsColumnMove = true;
              destColumnIndex = newColumns.findIndex(col => col.id === newColumnId);
              
              // Preparar chat atualizado para mover
              chatToMove = {
                ...currentChat,
                ...updatedChat,
                id: updatedChat._id || updatedChat.chatId,
                remoteJid: updatedChat.chatId,
                pushName: finalName,
                name: finalName,
                lastMessage: updatedChat.lastMessage?.content || currentChat.lastMessage || 'Nenhuma mensagem',
                lastMessageTime: updatedChat.lastMessage?.timestamp || updatedChat.lastActivity,
                kanbanColumn: newColumnId
              };
              
              // Remover da coluna atual
              newColumns[i].chats.splice(chatIndex, 1);
            } else {
              // Apenas atualizar na mesma coluna
              newColumns[i].chats[chatIndex] = {
                ...currentChat,
                ...updatedChat,
                id: updatedChat._id || updatedChat.chatId,
                remoteJid: updatedChat.chatId,
                pushName: finalName,
                name: finalName,
                lastMessage: updatedChat.lastMessage?.content || currentChat.lastMessage || 'Nenhuma mensagem',
                lastMessageTime: updatedChat.lastMessage?.timestamp || updatedChat.lastActivity
              };
              
              // Ordenar por última atividade
              newColumns[i].chats.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
            }
            break;
          }
        }
        
        // Se precisa mover para outra coluna, adicionar na nova coluna
        if (needsColumnMove && destColumnIndex !== -1 && chatToMove) {
          newColumns[destColumnIndex].chats.push(chatToMove);
          // Ordenar a coluna de destino
          newColumns[destColumnIndex].chats.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
          
          console.log('✅ Chat movido via WebSocket:', {
            chatId: chatToMove.chatId,
            from: newColumns[sourceColumnIndex]?.id,
            to: newColumns[destColumnIndex].id,
            name: chatToMove.name
          });
        }
        
        return newColumns;
      });
    };

    // Nova mensagem - captura pushName do MESSAGES_UPSERT
    const handleNewMessage = (data) => {
      const message = data.data;
      
      console.log('💬 handleNewMessage - Dados recebidos:', {
        chatId: message.chatId || message.key?.remoteJid,
        pushName: message.pushName,
        fromMe: message.fromMe,
        content: message.message?.conversation || message.content?.text
      });
      
      // Extrair chatId e pushName do payload
      const chatId = message.chatId || message.key?.remoteJid;
      const pushName = message.pushName;
      const content = message.message?.conversation || message.content?.text || 'Mensagem';
      const fromMe = message.fromMe;
      
      // Atualizar chat com nova mensagem
      if (chatId) {
        setColumns(prev => {
          const newColumns = [...prev];
          let updated = false;
          let chatFound = false;
          
          // Procurar o chat em todas as colunas
          for (let i = 0; i < newColumns.length; i++) {
            const chatIndex = newColumns[i].chats.findIndex(chat => 
              chat.chatId === chatId || chat.remoteJid === chatId
            );
            
            if (chatIndex !== -1) {
              const chat = newColumns[i].chats[chatIndex];
              
              // Se a mensagem NÃO for enviada pelo sistema E tiver pushName, atualizar o nome
              if (!fromMe && pushName) {
                newColumns[i].chats[chatIndex] = {
                  ...chat,
                  pushName: pushName,
                  name: pushName,
                  lastMessage: content,
                  lastMessageTime: message.timestamp || new Date(),
                  lastActivity: message.timestamp || new Date()
                };
                console.log('✅ Chat atualizado com pushName:', pushName);
              } else {
                // Apenas atualizar última mensagem sem alterar o nome
                newColumns[i].chats[chatIndex] = {
                  ...chat,
                  lastMessage: content,
                  lastMessageTime: message.timestamp || new Date(),
                  lastActivity: message.timestamp || new Date()
                };
                console.log('📝 Chat atualizado apenas com nova mensagem');
              }
              
              updated = true;
              chatFound = true;
              break;
            }
          }
          
          // Se não encontrou o chat, criar na primeira coluna
          if (!chatFound && newColumns[0]) {
            const newChat = {
              chatId: chatId,
              id: chatId,
              remoteJid: chatId,
              pushName: !fromMe && pushName ? pushName : null,
              name: !fromMe && pushName ? pushName : chatId.replace('@s.whatsapp.net', ''),
              lastMessage: content,
              lastMessageTime: message.timestamp || new Date(),
              lastActivity: message.timestamp || new Date(),
              kanbanColumn: 'novo'
            };
            
            newColumns[0].chats.unshift(newChat);
            console.log('🆕 Novo chat criado');
            updated = true;
          }
          
          // Ordenar todas as colunas por lastActivity
          if (updated) {
            newColumns.forEach(column => {
              column.chats.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
            });
          }
          
          return updated ? newColumns : prev;
        });
      }
    };

    // Registrar listeners
    // Contato atualizado
    const handleContactUpdate = (data) => {
      console.log('👤 Recebido contact-updated via WebSocket:', data);
      const updatedContact = data.data;
      
      setColumns(prev => {
        const newColumns = [...prev];
        let updated = false;
        
        newColumns.forEach(column => {
          column.chats.forEach((chat, chatIndex) => {
            if (chat.chatId === updatedContact.contactId) {
              column.chats[chatIndex] = {
                ...column.chats[chatIndex],
                pushName: updatedContact.name || updatedContact.pushName,
                name: updatedContact.name || updatedContact.pushName
              };
              updated = true;
            }
          });
        });
        
        return updated ? newColumns : prev;
      });
    };

    on('new-chat', handleNewChat);
    on('chat-updated', handleChatUpdate);
    on('contact-updated', handleContactUpdate);
    on('new-message', handleNewMessage);

    return () => {
      off('new-chat', handleNewChat);
      off('chat-updated', handleChatUpdate);
      off('contact-updated', handleContactUpdate);
      off('new-message', handleNewMessage);
    };
  }, [socket, instanceName, on, off, columns, nameCache]);

  // Carregar dados iniciais
  useEffect(() => {
    loadInstance();
    refreshChats();
    loadColumnNames();
  }, [loadInstance, refreshChats, loadColumnNames]);

  const handleDragEnd = useCallback(async (result) => {
    const { destination, source, draggableId } = result;

    // Resetar cursor
    document.body.style.cursor = '';

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destColumn = columns.find(col => col.id === destination.droppableId);
    const chat = sourceColumn.chats.find(chat => chat.id === draggableId);
    
    console.log('🔄 Movendo chat:', JSON.stringify({
      chatId: chat.chatId,
      pushName: chat.pushName,
      name: chat.name,
      originalName: chat.originalName,
      apiName: chat.apiName
    }, null, 2));

    // Remover do source
    const newSourceChats = [...sourceColumn.chats];
    newSourceChats.splice(source.index, 1);

    // Adicionar no destination preservando todas as propriedades do chat
    const newDestChats = [...destColumn.chats];
    // Determinar o nome final a ser preservado
    const finalName = chat.pushName || chat.name || chat.originalName || chat.apiName || 'Contato';
    
    const chatWithPreservedName = {
      ...chat,
      // Preservar propriedades importantes que podem ser perdidas
      pushName: finalName,
      name: finalName,
      originalName: chat.originalName || chat.pushName || chat.name,
      apiName: chat.apiName
    };
    
    console.log('📝 Chat após preservação:', JSON.stringify({
      chatId: chatWithPreservedName.chatId,
      pushName: chatWithPreservedName.pushName,
      name: chatWithPreservedName.name,
      originalName: chatWithPreservedName.originalName,
      apiName: chatWithPreservedName.apiName
    }, null, 2));
    
    newDestChats.splice(destination.index, 0, chatWithPreservedName);

    // Atualizar estado localmente primeiro (para feedback imediato)
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      const sourceIndex = newColumns.findIndex(col => col.id === source.droppableId);
      const destIndex = newColumns.findIndex(col => col.id === destination.droppableId);
      
      newColumns[sourceIndex] = { ...newColumns[sourceIndex], chats: newSourceChats };
      newColumns[destIndex] = { ...newColumns[destIndex], chats: newDestChats };
      
      return newColumns;
    });

    // Salvar mudança no backend
    try {
      await api.put(`/api/chats/${instanceName}/${chat.chatId}/kanban-column`, {
        column: destination.droppableId
      });
      
      toast.success(`Conversa movida para ${destColumn.title}`);
    } catch (error) {
      console.error('Erro ao mover conversa:', error);
      toast.error('Erro ao mover conversa');
      
      // Reverter mudança local em caso de erro
      setColumns(prevColumns => {
        const newColumns = [...prevColumns];
        const sourceIndex = newColumns.findIndex(col => col.id === destination.droppableId);
        const destIndex = newColumns.findIndex(col => col.id === source.droppableId);
        
        // Remover do destination
        const revertDestChats = [...newColumns[sourceIndex].chats];
        const chatIndex = revertDestChats.findIndex(c => c.id === draggableId);
        if (chatIndex !== -1) {
          revertDestChats.splice(chatIndex, 1);
        }
        
        // Adicionar de volta ao source
        const revertSourceChats = [...newColumns[destIndex].chats];
        revertSourceChats.splice(source.index, 0, chat);
        
        newColumns[sourceIndex] = { ...newColumns[sourceIndex], chats: revertDestChats };
        newColumns[destIndex] = { ...newColumns[destIndex], chats: revertSourceChats };
        
        return newColumns;
      });
    }
  }, [columns, instanceName]);

  // Abrir detalhes do chat
  const handleChatClick = (chat) => {
    setSelectedChat(chat);
    setChatDialogOpen(true);
  };

  // Funções para configuração das colunas
  const handleOpenColumnSettings = () => {
    setSettingsMenuAnchor(null);
    // Inicializar com nomes atuais
    const currentNames = {};
    columns.forEach(col => {
      currentNames[col.id] = col.title;
    });
    setTempColumnNames(currentNames);
    setColumnSettingsOpen(true);
  };

  const handleSaveColumnNames = () => {
    const newColumnNames = {};
    
    setColumns(prevColumns => {
      const updatedColumns = prevColumns.map(column => {
        const newTitle = tempColumnNames[column.id] || column.title;
        newColumnNames[column.id] = newTitle;
        return {
          ...column,
          title: newTitle
        };
      });
      
      // Salvar no localStorage
      saveColumnNames(newColumnNames);
      
      return updatedColumns;
    });
    
    setColumnSettingsOpen(false);
    toast.success('Nomes das colunas atualizados!');
  };

  const handleResetColumnNames = () => {
    const defaultNames = {
      novo: 'Novo Contato',
      andamento: 'Em Andamento', 
      carrinho: 'Carrinho Abandonado',
      aprovado: 'Aprovado',
      reprovado: 'Reprovado'
    };
    setTempColumnNames(defaultNames);
    
    // Aplicar imediatamente e salvar no localStorage
    setColumns(prevColumns => 
      prevColumns.map(column => ({
        ...column,
        title: defaultNames[column.id] || column.title
      }))
    );
    
    // Salvar no localStorage
    saveColumnNames(defaultNames);
    
    // Fechar dialog
    setColumnSettingsOpen(false);
    
    toast.success('Nomes das colunas resetados para o padrão!');
  };

  // Função para apagar todas as conversas
  const handleDeleteAllChats = async () => {
    try {
      setDeletingAllChats(true);
      
      const response = await api.delete(`/api/chats/${instanceName}/all`);
      
      if (response.data.success) {
        // Limpar todas as conversas do estado local
        setColumns(prevColumns => 
          prevColumns.map(column => ({
            ...column,
            chats: []
          }))
        );
        
        setDeleteAllDialogOpen(false);
        toast.success('Todas as conversas foram apagadas!');
      }
    } catch (error) {
      console.error('Erro ao apagar todas as conversas:', error);
      toast.error('Erro ao apagar conversas');
    } finally {
      setDeletingAllChats(false);
    }
  };

  // Abrir diálogo de confirmação para apagar todas as conversas
  const handleOpenDeleteAllDialog = () => {
    setSettingsMenuAnchor(null);
    setDeleteAllDialogOpen(true);
  };

  // Editar nome da coluna
  const handleEditColumn = (columnId, newTitle) => {
    setColumns(prevColumns =>
      prevColumns.map(col =>
        col.id === columnId ? { ...col, title: newTitle } : col
      )
    );
    setEditingColumn(null);
  };

  // Cores das colunas
  const getColumnColor = (index, dark = false) => {
    const colors = [
      dark ? '#667eea' : '#764ba2',
      dark ? '#f093fb' : '#f093fb',
      dark ? '#4facfe' : '#00f2fe',
      dark ? '#43e97b' : '#38f9d7',
      dark ? '#fa709a' : '#fee140'
    ];
    return colors[index % colors.length];
  };


  if (loading && columns.every(col => col.chats.length === 0)) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%'
      }}>
        <Typography variant="h6" sx={{ color: '#fff' }}>
          Carregando conversas...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2,
        background: 'rgba(32, 44, 51, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Box>
          <Typography variant="h5" sx={{ 
            fontWeight: 600, 
            color: '#fff'
          }}>
            CRM Kanban
          </Typography>
          <Typography variant="subtitle2" sx={{ 
            color: 'rgba(255,255,255,0.7)'
          }}>
            Gestão de Leads e Conversas
          </Typography>
        </Box>

        <IconButton
          onClick={(e) => setSettingsMenuAnchor(e.currentTarget)}
          sx={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            '&:hover': {
              background: 'rgba(255,255,255,0.2)',
              transform: 'scale(1.05)'
            }
          }}
        >
          <SettingsIcon />
        </IconButton>
      </Box>

      {/* Kanban Board */}
      <Box sx={{ flex: 1, p: 3, overflow: 'hidden' }}>
        <DragDropContext 
          onDragEnd={handleDragEnd}
          onDragStart={() => {
            // Otimizar performance durante o drag
            document.body.style.cursor = 'grabbing';
          }}
          onDragUpdate={() => {
            // Manter performance durante atualizações
          }}
          onBeforeCapture={() => {
            // Preparar para o drag
            document.body.style.cursor = 'grabbing';
          }}
          onBeforeDragStart={() => {
            // Preparar elementos para drag
          }}
        >
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 2,
            height: 'fit-content',
            minHeight: 'calc(100vh - 120px)',
            width: '100%'
          }}>
            {columns.map((column, columnIndex) => (
                <Paper
                key={column.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(30, 30, 46, 0.8)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  overflow: 'hidden',
                  maxHeight: 'calc(100vh - 140px)',
                  minHeight: '400px',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  zIndex: 1,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.4)'
                  }
                }}
              >
                {/* Column Header */}
                <Box sx={{ 
                  p: 2.5, 
                  background: `linear-gradient(135deg, ${getColumnColor(columnIndex)} 0%, ${getColumnColor(columnIndex, true)} 100%)`,
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  position: 'relative'
                }}>
                  {editingColumn === column.id ? (
                    <TextField
                      autoFocus
                      value={column.title}
                      onChange={(e) => handleEditColumn(column.id, e.target.value)}
                      onBlur={() => setEditingColumn(null)}
                      onKeyPress={(e) => e.key === 'Enter' && setEditingColumn(null)}
                      sx={{
                        '& .MuiInputBase-root': {
                          color: '#fff',
                          fontSize: '1.1rem',
                          fontWeight: 600
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none'
                        }
                      }}
                    />
                  ) : (
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#fff',
                        textAlign: 'center',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        cursor: 'pointer'
                      }}
                      onClick={() => setEditingColumn(column.id)}
                    >
                      {column.title}
                    </Typography>
                  )}
                  
                  <Box sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Typography variant="caption" sx={{ 
                      color: '#fff', 
                      fontWeight: 600,
                      fontSize: '0.8rem'
                    }}>
                      {column.chats.length}
                    </Typography>
                  </Box>
                </Box>

                {/* Droppable Area */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        flex: 1,
                        p: 2,
                        minHeight: 150,
                        maxHeight: 'calc(100vh - 220px)',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        background: snapshot.isDraggingOver 
                          ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)'
                          : 'transparent',
                        borderRadius: '0 0 12px 12px',
                        transition: 'all 0.2s ease',
                        // Otimizações de performance
                        willChange: snapshot.isDraggingOver ? 'background-color, border-color' : 'auto',
                        contain: 'layout style paint',
                        border: snapshot.isDraggingOver 
                          ? '2px dashed rgba(102, 126, 234, 0.5)'
                          : '2px dashed transparent',
                        '&::-webkit-scrollbar': {
                          width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: 'rgba(255,255,255,0.1)',
                          borderRadius: '3px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: 'rgba(255,255,255,0.3)',
                          borderRadius: '3px',
                          '&:hover': {
                            background: 'rgba(255,255,255,0.5)',
                          },
                        },
                      }}
                    >
                      {/* Empty State */}
                      {column.chats.length === 0 && (
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: 120,
                          color: 'rgba(255,255,255,0.5)',
                          textAlign: 'center',
                          fontSize: '0.9rem',
                          fontStyle: 'italic'
                        }}>
                          Arraste conversas para aqui
                        </Box>
                      )}
                      
                      {column.chats.map((chat, index) => (
                        <Draggable key={chat.id} draggableId={chat.id} index={index}>
                          {(provided, snapshot) => (
                            <DragItem
                              provided={provided}
                              snapshot={snapshot}
                              chat={chat}
                              onClick={() => handleChatClick(chat)}
                            />
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      <Box
                        sx={{
                          minHeight: snapshot.isDraggingOver ? '60px' : '0px',
                          transition: 'all 0.2s ease',
                          background: snapshot.isDraggingOver 
                            ? 'rgba(102, 126, 234, 0.1)' 
                            : 'transparent',
                          borderRadius: 2,
                          border: snapshot.isDraggingOver 
                            ? '2px dashed rgba(102, 126, 234, 0.5)' 
                            : '2px dashed transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'rgba(102, 126, 234, 0.8)',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          opacity: snapshot.isDraggingOver ? 1 : 0
                        }}
                      >
                        {snapshot.isDraggingOver && 'Solte aqui para mover'}
                      </Box>
                    </Box>
                  )}
                </Droppable>
              </Paper>
            ))}
          </Box>
        </DragDropContext>
      </Box>

      {/* Settings Menu */}
      <Menu
        anchorEl={settingsMenuAnchor}
        open={Boolean(settingsMenuAnchor)}
        onClose={() => setSettingsMenuAnchor(null)}
        PaperProps={{
          sx: {
            background: '#202c33',
            border: '1px solid #313d43',
            '& .MuiMenuItem-root': {
              color: '#e9edef',
              '&:hover': {
                background: '#2a3942'
              }
            }
          }
        }}
      >
        <MenuItem onClick={refreshChats}>
          Recarregar Conversas
        </MenuItem>
        <MenuItem onClick={handleOpenColumnSettings}>
          Configurar Colunas
        </MenuItem>
        <MenuItem 
          onClick={handleOpenDeleteAllDialog}
          sx={{
            color: '#f44336',
            '&:hover': {
              background: 'rgba(244, 67, 54, 0.1)'
            }
          }}
        >
          <DeleteIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
          Apagar Todas as Conversas
        </MenuItem>
        </Menu>

      {/* Dialog de Configurações das Colunas */}
      <Dialog
        open={columnSettingsOpen}
        onClose={() => setColumnSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 3,
            color: '#fff'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          color: '#fff'
        }}>
          Configurar Nomes das Colunas
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Stack spacing={4}>
            {columns.map((column) => (
              <Box key={column.id}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.9)', 
                    mb: 1,
                    fontWeight: 500
                  }}
                >
                  {column.title}
                </Typography>
                <TextField
                  placeholder={`Digite o novo nome para ${column.id}`}
                  value={tempColumnNames[column.id] || ''}
                  onChange={(e) => setTempColumnNames(prev => ({
                    ...prev,
                    [column.id]: e.target.value
                  }))}
                  fullWidth
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      '& fieldset': {
                        borderColor: 'rgba(255,255,255,0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255,255,255,0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#00a884',
                      },
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: 'rgba(255,255,255,0.5)',
                      opacity: 1,
                    },
                  }}
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '0.7rem',
                    mt: 0.5,
                    display: 'block'
                  }}
                >
                  ID: {column.id}
                </Typography>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          p: 2,
          gap: 1
        }}>
          <Button 
            onClick={handleResetColumnNames}
            sx={{ 
              color: 'rgba(255,255,255,0.7)',
              '&:hover': {
                background: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Restaurar Padrão
          </Button>
          
          <Button 
            onClick={() => setColumnSettingsOpen(false)}
            sx={{ 
              color: 'rgba(255,255,255,0.7)',
              '&:hover': {
                background: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Cancelar
          </Button>
          
          <Button 
            onClick={handleSaveColumnNames}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #00a884 0%, #26d367 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #008069 0%, #00a884 100%)',
              }
            }}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação para Apagar Todas as Conversas */}
      <Dialog
        open={deleteAllDialogOpen}
        onClose={() => setDeleteAllDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 3,
            color: '#fff'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <DeleteIcon sx={{ color: '#f44336' }} />
          Confirmar Exclusão
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Typography variant="body1" sx={{ color: '#fff', mb: 2 }}>
            Tem certeza de que deseja apagar <strong>todas as conversas</strong> desta instância?
          </Typography>
          
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
            Esta ação não pode ser desfeita. Todas as conversas e mensagens serão permanentemente removidas do sistema.
          </Typography>
          
          <Box sx={{
            background: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid rgba(244, 67, 54, 0.3)',
            borderRadius: 2,
            p: 2,
            mt: 2
          }}>
            <Typography variant="body2" sx={{ color: '#f44336', fontWeight: 500 }}>
              ⚠️ Atenção: Esta ação é irreversível!
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(244, 67, 54, 0.8)' }}>
              Todas as conversas em todas as colunas do Kanban serão apagadas.
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          p: 2,
          gap: 1
        }}>
          <Button 
            onClick={() => setDeleteAllDialogOpen(false)}
            disabled={deletingAllChats}
            sx={{ 
              color: 'rgba(255,255,255,0.7)',
              '&:hover': {
                background: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Cancelar
          </Button>
          
          <Button 
            onClick={handleDeleteAllChats}
            disabled={deletingAllChats}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
              },
              '&:disabled': {
                background: 'rgba(244, 67, 54, 0.3)',
                color: 'rgba(255,255,255,0.5)'
              }
            }}
            startIcon={deletingAllChats ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid #fff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }}
                />
              </Box>
            ) : (
              <DeleteIcon />
            )}
          >
            {deletingAllChats ? 'Apagando...' : 'Confirmar Exclusão'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Chat Window */}
      <ChatWindow
        open={chatDialogOpen}
        onClose={() => setChatDialogOpen(false)}
        chat={selectedChat}
        instanceName={instanceName}
      />
    </Box>
  );
};

export default KanbanBoard;