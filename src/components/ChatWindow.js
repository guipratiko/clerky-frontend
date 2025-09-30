import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogTitle, 
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Avatar,
  IconButton,
  TextField,
  Button,
  Paper,
  Chip,
  CircularProgress,
  Divider,
  Tooltip,
  // Card,
  // CardContent,
  Grid,
  // Badge,
  // Stack,
  // List,
  // ListItem,
  // ListItemIcon,
  // ListItemText,
  // ListItemSecondaryAction
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  Mic as MicIcon,
  Stop as StopIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  // Phone as PhoneIcon,
  // Email as EmailIcon,
  // LocationOn as LocationIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  // CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  // Flag as FlagIcon,
  // MoreVert as MoreVertIcon,
  // Call as CallIcon,
  Message as MessageIcon,
  History as HistoryIcon,
  Assignment as AssignmentIcon,
  // Work as WorkIcon,
  // School as SchoolIcon,
  // Home as HomeIcon,
  // LocalPhone as LocalPhoneIcon
} from '@mui/icons-material';
// import { useInstance } from '../contexts/InstanceContext';
import { useSocket } from '../contexts/SocketContext';
import AudioPlayer from './AudioPlayer';
import toast from 'react-hot-toast';
import api, { getContactNames, getContactHistory, getContactTasks, createContactTask, updateContactTask, deleteContactTask } from '../services/api';

const ChatWindow = ({ open, onClose, chat, instanceName }) => {
  const { socket, on, off } = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [audioDialogOpen, setAudioDialogOpen] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [sendingAudio, setSendingAudio] = useState(false);
  
  // Estados para edição de nome
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [contactName, setContactName] = useState('');
  
  // Estados para CRM
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [tasksDialogOpen, setTasksDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [contactStatus, setContactStatus] = useState('Lead');
  const [contactValue, setContactValue] = useState('R$ 5.000');
  const [contactTags, setContactTags] = useState(['Lead', 'Cliente VIP', 'Empresa']);
  
  // Estados para dados reais
  const [contactHistory, setContactHistory] = useState([]);
  const [contactTasks, setContactTasks] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  
  // Estados para gerenciamento de tarefas
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [editTaskDialogOpen, setEditTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    tags: []
  });
  const [loadingName, setLoadingName] = useState(false);
  
  // Estados para gravação de áudio
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [audioMode, setAudioMode] = useState('url'); // 'url' ou 'record'
  
  // Estados para arrastar o dialog
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: null, y: null });
  const [dragStarted, setDragStarted] = useState(false);
  const animationFrameRef = useRef(null);
  const [newMessageIds, setNewMessageIds] = useState(new Set());
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const audioPreviewRef = useRef(null);
  const dialogRef = useRef(null);

  // Funções para arrastar o dialog
  const handleMouseDown = (e) => {
    if (e.target.closest('.drag-handle')) {
      e.preventDefault();
      setDragStarted(true);
      
      const rect = dialogRef.current?.getBoundingClientRect();
      if (rect) {
        // Se ainda não tem posição definida, usar a posição atual do elemento
        if (position.x === null || position.y === null) {
          setPosition({ x: rect.left, y: rect.top });
        }
        
        setDragOffset({
          x: e.clientX - (position.x !== null ? position.x : rect.left),
          y: e.clientY - (position.y !== null ? position.y : rect.top)
        });
      }
    }
  };

  const updatePosition = useCallback((clientX, clientY) => {
    const newX = clientX - dragOffset.x;
    const newY = clientY - dragOffset.y;
    
    // Sem limitação - deixar o usuário arrastar livremente
    setPosition({ x: newX, y: newY });
  }, [dragOffset]);

  const handleMouseMove = useCallback((e) => {
    if (!dragStarted) return;
    
    // Iniciar drag imediatamente
    if (!isDragging) {
      setIsDragging(true);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    }

    if (isDragging) {
      // Cancelar frame anterior se existir
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Usar requestAnimationFrame para suavizar
      animationFrameRef.current = requestAnimationFrame(() => {
        updatePosition(e.clientX, e.clientY);
      });
    }
  }, [dragStarted, isDragging, updatePosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStarted(false);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    
    // Cancelar qualquer animação pendente
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Event listeners para drag
  useEffect(() => {
    if (dragStarted) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        // Cleanup no caso de componente desmontar durante drag
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [dragStarted, handleMouseMove, handleMouseUp]);

  // Reset position quando o dialog abre/fecha
  useEffect(() => {
    if (open) {
      setPosition({ x: null, y: null });
      setIsDragging(false);
      setDragStarted(false);
    }
  }, [open]);

  // Limpar mensagem quando trocar de chat (mesmo com o dialog aberto)
  useEffect(() => {
    if (chat) {
      setNewMessage('');
    }
  }, [chat]);

  // Scroll automático para o final com performance otimizada
  const scrollToBottom = useCallback((smooth = true) => {
    if (!messagesEndRef.current) return;
    
    // Usar requestAnimationFrame para melhor performance
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end',
        inline: 'nearest'
      });
    });
  }, []);

  // Carregar mensagens da conversa
  const loadMessages = useCallback(async () => {
    if (!chat || !instanceName) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/api/messages/${instanceName}/${chat.chatId}?limit=100`);
      
      if (response.data.success) {
        setMessages(response.data.data || []);
        // Scroll direto para a última mensagem sem animação
        setTimeout(() => scrollToBottom(false), 100);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast.error('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  }, [chat, instanceName, scrollToBottom]);

  // Buscar nome do contato usando a API
  const fetchContactName = useCallback(async () => {
    if (!chat?.chatId) return;
    
    try {
      setLoadingName(true);
      const phoneNumber = chat.chatId.replace('@s.whatsapp.net', '');
      
      // Primeiro, verificar se já temos um nome salvo localmente
      const localName = chat.pushName || chat.name;
      if (localName && localName !== 'Contato') {
        setContactName(localName);
        setLoadingName(false);
        return;
      }
      
      // Se não há nome local, buscar na API
      const response = await getContactNames([phoneNumber]);
      
      if (response.success && response.data && response.data.length > 0) {
        const contactData = response.data[0];
        if (contactData.name) {
          setContactName(contactData.name);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar nome do contato:', error);
    } finally {
      setLoadingName(false);
    }
  }, [chat?.chatId, chat?.pushName, chat?.name]);

  // Iniciar edição do nome
  const startEditingName = useCallback(() => {
    setEditedName(contactName || chat?.pushName || chat?.name || '');
    setIsEditingName(true);
  }, [contactName, chat?.pushName, chat?.name]);

  // Cancelar edição do nome
  const cancelEditingName = useCallback(() => {
    setIsEditingName(false);
    setEditedName('');
  }, []);

  // Salvar nome editado
  const saveEditedName = useCallback(async () => {
    if (!chat?.chatId || !instanceName) return;
    
    try {
      setLoadingName(true);
      
      // Extrair número de telefone do chatId
      const phoneNumber = chat.chatId.replace('@s.whatsapp.net', '');
      
      // Atualizar no backend usando o novo endpoint
      const response = await api.put(`/api/contacts/${instanceName}/phone/${phoneNumber}`, {
        name: editedName
      });
      
      if (response.data.success) {
        setContactName(editedName);
        setIsEditingName(false);
        toast.success('Nome atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar nome:', error);
      toast.error('Erro ao salvar nome');
    } finally {
      setLoadingName(false);
    }
  }, [chat?.chatId, instanceName, editedName]);

  // Função para carregar histórico do contato
  const loadContactHistory = useCallback(async () => {
    if (!chat?.chatId || !instanceName) return;
    
    setLoadingHistory(true);
    try {
      const response = await getContactHistory(instanceName, chat.chatId);
      setContactHistory(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast.error('Erro ao carregar histórico do contato');
    } finally {
      setLoadingHistory(false);
    }
  }, [chat?.chatId, instanceName]);

  // Função para carregar tarefas do contato
  const loadContactTasks = useCallback(async () => {
    if (!chat?.chatId || !instanceName) return;
    
    setLoadingTasks(true);
    try {
      const response = await getContactTasks(instanceName, chat.chatId);
      setContactTasks(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      toast.error('Erro ao carregar tarefas do contato');
    } finally {
      setLoadingTasks(false);
    }
  }, [chat?.chatId, instanceName]);

  // Função para criar nova tarefa
  const handleCreateTask = async () => {
    if (!taskForm.title.trim() || !chat?.chatId || !instanceName) return;
    
    try {
      const taskData = {
        instanceName,
        contactId: chat.chatId,
        contactName: chat.name || chat.pushName || 'Contato',
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        priority: taskForm.priority,
        dueDate: taskForm.dueDate || null,
        tags: taskForm.tags
      };

      const response = await createContactTask(taskData);
      
      if (response.success) {
        toast.success('Tarefa criada com sucesso!');
        setCreateTaskDialogOpen(false);
        setTaskForm({
          title: '',
          description: '',
          priority: 'medium',
          dueDate: '',
          tags: []
        });
        // Recarregar tarefas
        loadContactTasks();
      }
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast.error('Erro ao criar tarefa');
    }
  };

  // Função para atualizar tarefa
  const handleUpdateTask = async () => {
    if (!selectedTask || !taskForm.title.trim()) return;
    
    try {
      const updateData = {
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        priority: taskForm.priority,
        dueDate: taskForm.dueDate || null,
        tags: taskForm.tags
      };

      const response = await updateContactTask(selectedTask._id, updateData);
      
      if (response.success) {
        toast.success('Tarefa atualizada com sucesso!');
        setEditTaskDialogOpen(false);
        setSelectedTask(null);
        setTaskForm({
          title: '',
          description: '',
          priority: 'medium',
          dueDate: '',
          tags: []
        });
        // Recarregar tarefas
        loadContactTasks();
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast.error('Erro ao atualizar tarefa');
    }
  };

  // Função para atualizar status da tarefa
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await updateContactTask(taskId, { status: newStatus });
      
      if (response.success) {
        toast.success(`Tarefa marcada como ${newStatus === 'completed' ? 'concluída' : newStatus}`);
        // Recarregar tarefas
        loadContactTasks();
      }
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
      toast.error('Erro ao atualizar status da tarefa');
    }
  };

  // Função para deletar tarefa
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Tem certeza que deseja deletar esta tarefa?')) return;
    
    try {
      const response = await deleteContactTask(taskId);
      
      if (response.success) {
        toast.success('Tarefa deletada com sucesso!');
        // Recarregar tarefas
        loadContactTasks();
      }
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      toast.error('Erro ao deletar tarefa');
    }
  };

  // Função para abrir diálogo de edição
  const handleEditTask = (task) => {
    setSelectedTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      tags: task.tags || []
    });
    setEditTaskDialogOpen(true);
  };

  // Função para abrir diálogo de criação
  const handleOpenCreateTask = () => {
    setTaskForm({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      tags: []
    });
    setCreateTaskDialogOpen(true);
  };

  // Enviar mensagem
  const handleSendMessage = async () => {
    if (!newMessage.trim() || sendingMessage || !chat) return;

    try {
      setSendingMessage(true);
      
      const response = await api.post(`/api/messages/${instanceName}/text`, {
        number: chat.chatId,
        text: newMessage.trim()
      });

      if (response.data.success) {
        setNewMessage('');
        // Mensagem será adicionada via WebSocket
        // toast.success('Mensagem enviada!'); // Removido para reduzir poluição visual
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSendingMessage(false);
    }
  };

  // Enviar áudio por URL
  const handleSendAudio = async () => {
    if (!audioUrl.trim() || sendingAudio || !chat) return;

    try {
      setSendingAudio(true);
      
      const response = await api.post(`/api/messages/${instanceName}/audio-url`, {
        number: chat.chatId,
        audioUrl: audioUrl.trim()
      });

      if (response.data.success) {
        setAudioUrl('');
        setAudioDialogOpen(false);
        toast.success('Áudio enviado!');
      }
    } catch (error) {
      console.error('Erro ao enviar áudio:', error);
      toast.error(error.response?.data?.error || 'Erro ao enviar áudio');
    } finally {
      setSendingAudio(false);
    }
  };

  // Abrir modal de áudio
  const handleOpenAudioDialog = () => {
    setAudioDialogOpen(true);
    setAudioUrl('');
  };

  // Fechar modal de áudio
  const handleCloseAudioDialog = () => {
    setAudioDialogOpen(false);
    setAudioUrl('');
    setRecordedAudio(null);
    setRecordingTime(0);
    setIsRecording(false);
    setIsPlayingPreview(false);
    setAudioMode('url');
    
    // Limpar recursos
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Funções de gravação de áudio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Tentar usar um formato compatível com a Evolution API
      let options = { mimeType: 'audio/webm' }; // WebM é mais compatível que WAV
      
      // Verificar se o navegador suporta audio/mpeg ou outros formatos
      if (MediaRecorder.isTypeSupported('audio/mpeg')) {
        options.mimeType = 'audio/mpeg';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options.mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options.mimeType = 'audio/webm;codecs=opus';
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setRecordedAudio(audioBlob);
        
        // Parar stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Iniciar contador de tempo
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      toast.error('Erro ao acessar microfone. Verifique as permissões.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const deleteRecording = () => {
    setRecordedAudio(null);
    setRecordingTime(0);
    setIsPlayingPreview(false);
    
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current.currentTime = 0;
    }
  };

  const playPreview = () => {
    if (recordedAudio && audioPreviewRef.current) {
      if (isPlayingPreview) {
        audioPreviewRef.current.pause();
        setIsPlayingPreview(false);
      } else {
        const audioUrl = URL.createObjectURL(recordedAudio);
        audioPreviewRef.current.src = audioUrl;
        audioPreviewRef.current.play();
        setIsPlayingPreview(true);

        audioPreviewRef.current.onended = () => {
          setIsPlayingPreview(false);
          URL.revokeObjectURL(audioUrl);
        };
      }
    }
  };

  const sendRecordedAudio = async () => {
    if (!recordedAudio || sendingAudio || !chat) return;

    try {
      setSendingAudio(true);

      // Criar FormData para envio do áudio como arquivo
      const formData = new FormData();
      formData.append('number', chat.chatId);
      
      // Determinar extensão baseada no MIME type
      let fileName = 'recording.mp3';
      if (recordedAudio.type.includes('webm')) {
        fileName = 'recording.webm';
      } else if (recordedAudio.type.includes('mp4')) {
        fileName = 'recording.m4a';
      } else if (recordedAudio.type.includes('mpeg')) {
        fileName = 'recording.mp3';
      }
      
      formData.append('audio', recordedAudio, fileName);

      // Usar o endpoint original de áudio que funciona com FormData
      const response = await api.post(`/api/messages/${instanceName}/audio`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setRecordedAudio(null);
        setRecordingTime(0);
        setAudioDialogOpen(false);
        setAudioMode('url'); // Reset para modo URL
        toast.success('Áudio enviado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao enviar áudio gravado:', error);
      toast.error(error.response?.data?.error || 'Erro ao enviar áudio gravado');
    } finally {
      setSendingAudio(false);
    }
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Escutar novas mensagens via WebSocket
  useEffect(() => {
    if (!socket || !chat) return;

    const handleNewMessage = (data) => {
      console.log('💬 ChatWindow recebeu new-message:', data);
      const message = data.data;
      if (message.chatId === chat.chatId) {
        // Verificar se a mensagem já existe para evitar duplicatas
        setMessages(prev => {
          const messageExists = prev.some(m => 
            m._id === message._id || 
            (m.messageId === message.messageId && m.timestamp === message.timestamp)
          );
          
          if (messageExists) {
            console.log('💬 Mensagem já existe, ignorando duplicata');
            return prev;
          }
          
          console.log('💬 Adicionando nova mensagem ao ChatWindow');
          
          // Marcar mensagem como nova para animação
          setNewMessageIds(prev => new Set([...prev, message._id || message.messageId]));
          
          // Remover a marca de nova após a animação
          setTimeout(() => {
            setNewMessageIds(prev => {
              const newSet = new Set(prev);
              newSet.delete(message._id || message.messageId);
              return newSet;
            });
          }, 1000);
          
          return [...prev, message];
        });
        
        // Scroll suave para a nova mensagem com delay reduzido
        setTimeout(() => scrollToBottom(true), 100);
      }
    };

    const handleChatUpdate = (data) => {
      console.log('🔄 ChatWindow recebeu chat-updated:', data);
      // Não recarregar todas as mensagens, apenas atualizar informações do chat se necessário
      // As mensagens já são tratadas pelo evento new-message
    };

    // Contato atualizado
    const handleContactUpdate = (data) => {
      console.log('👤 Recebido contact-updated via WebSocket no ChatWindow:', data);
      const updatedContact = data.data;
      
      if (chat?.chatId === updatedContact.contactId) {
        setContactName(updatedContact.name || updatedContact.pushName);
      }
    };

    on('new-message', handleNewMessage);
    on('chat-updated', handleChatUpdate);
    on('contact-updated', handleContactUpdate);

    return () => {
      off('new-message', handleNewMessage);
      off('chat-updated', handleChatUpdate);
      off('contact-updated', handleContactUpdate);
    };
  }, [socket, chat, on, off, scrollToBottom]);

  // Carregar mensagens quando abrir o chat
  useEffect(() => {
    if (open && chat) {
      loadMessages();
      // Limpar mensagens marcadas como novas
      setNewMessageIds(new Set());
    } else {
      setMessages([]);
      setNewMessageIds(new Set());
      // Limpar a mensagem sendo digitada quando fechar ou trocar de chat
      setNewMessage('');
    }
  }, [open, chat, loadMessages, scrollToBottom]);

  // Buscar nome do contato quando o chat for carregado
  useEffect(() => {
    if (open && chat) {
      fetchContactName();
    }
  }, [open, chat, fetchContactName]);

  // Função para obter iniciais
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  // Função para formatar timestamp
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
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

  if (!chat) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        ref: dialogRef,
        onMouseDown: handleMouseDown,
        sx: {
          height: '80vh',
          width: '800px',
          maxWidth: '90vw',
          background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 3,
          boxShadow: isDragging 
            ? '0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(102, 126, 234, 0.3)' 
            : '0 20px 60px rgba(0,0,0,0.5)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: position.y !== null ? `${position.y}px` : '10vh',
          left: position.x !== null ? `${position.x}px` : '50%',
          margin: 0,
          transform: position.x === null ? 'translateX(-50%)' : 'none',
          cursor: isDragging ? 'grabbing' : 'default',
          transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: isDragging ? 1400 : 1300,
          willChange: isDragging ? 'transform' : 'auto',
          // Otimizações de performance
          backfaceVisibility: 'hidden',
          // Suavizar bordas durante animação
          filter: isDragging ? 'brightness(1.05)' : 'none'
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(8px)'
        }
      }}
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'flex-start',
          justifyContent: 'flex-start'
        }
      }}
    >
      {/* Header */}
      <DialogTitle 
        className="drag-handle"
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: isDragging 
            ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.4) 100%)'
            : 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          py: 2,
          cursor: isDragging ? 'grabbing' : (dragStarted ? 'grabbing' : 'grab'),
          userSelect: 'none',
          transition: isDragging ? 'none' : 'all 0.2s ease',
          '&:hover': {
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.35) 0%, rgba(118, 75, 162, 0.35) 100%)',
            transform: 'translateY(-1px)'
          },
          '&:active': {
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.5) 0%, rgba(118, 75, 162, 0.5) 100%)'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DragIndicatorIcon sx={{ 
            color: isDragging ? 'rgba(102, 126, 234, 1)' : 'rgba(255,255,255,0.6)',
            fontSize: '1.2rem',
            transition: isDragging ? 'none' : 'all 0.2s ease',
            transform: isDragging ? 'scale(1.1)' : 'scale(1)',
            '&:hover': {
              color: 'rgba(102, 126, 234, 0.8)',
              transform: 'scale(1.05)'
            }
          }} />
          <Avatar 
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              width: 48,
              height: 48,
              fontSize: '1.2rem',
              fontWeight: 700,
              border: '2px solid rgba(255,255,255,0.2)'
            }}
            src={chat.profilePicture}
          >
            {getInitials(contactName || chat.pushName || chat.name || chat.chatId)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            {isEditingName ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
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
                    '& .MuiInputBase-input': {
                      color: '#fff',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                    },
                  }}
                  autoFocus
                />
                <IconButton
                  onClick={saveEditedName}
                  disabled={loadingName}
                  size="small"
                  sx={{ color: '#00a884' }}
                >
                  <SaveIcon />
                </IconButton>
                <IconButton
                  onClick={cancelEditingName}
                  disabled={loadingName}
                  size="small"
                  sx={{ color: '#ff6b6b' }}
                >
                  <CancelIcon />
                </IconButton>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                  {contactName || chat.pushName || chat.name || chat.chatId?.replace('@s.whatsapp.net', '')}
                </Typography>
                {loadingName ? (
                  <CircularProgress size={16} sx={{ color: '#00a884' }} />
                ) : (
                  <IconButton
                    onClick={startEditingName}
                    size="small"
                    sx={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {chat.chatId}
              </Typography>
              {chat.isGroup && (
                <Chip 
                  label="Grupo" 
                  size="small" 
                  sx={{ 
                    height: 20,
                    fontSize: '0.7rem',
                    background: 'linear-gradient(135deg, #4facfe 0%, #3d91fe 100%)',
                    color: '#fff',
                    fontWeight: 600
                  }} 
                />
              )}
            </Box>
          </Box>
        </Box>
        
        <IconButton 
          onClick={onClose}
          sx={{ 
            color: 'rgba(255,255,255,0.7)',
            '&:hover': { 
              color: '#fff',
              background: 'rgba(255,255,255,0.1)' 
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      {/* Ferramentas de CRM */}
      <Box sx={{ 
        p: 2, 
        background: 'rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Typography variant="subtitle2" sx={{ 
          color: 'rgba(255,255,255,0.8)', 
          mb: 1.5,
          fontWeight: 600
        }}>
          Ferramentas de CRM
        </Typography>
        
        <Grid container spacing={1}>
          {/* Ações Rápidas */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Tooltip title="Enviar Mensagem">
                <Button
                  size="small"
                  startIcon={<MessageIcon />}
                  onClick={() => {
                    // Focar no campo de mensagem
                    const messageInput = document.querySelector('input[placeholder*="mensagem"]');
                    if (messageInput) {
                      messageInput.focus();
                    }
                  }}
                  sx={{
                    background: 'rgba(0,168,132,0.2)',
                    color: '#00a884',
                    border: '1px solid rgba(0,168,132,0.3)',
                    '&:hover': {
                      background: 'rgba(0,168,132,0.3)',
                      border: '1px solid rgba(0,168,132,0.5)'
                    }
                  }}
                >
                  Mensagem
                </Button>
              </Tooltip>
              
              <Tooltip title="Histórico">
                <Button
                  size="small"
                  startIcon={<HistoryIcon />}
                  onClick={() => {
                    loadContactHistory();
                    setHistoryDialogOpen(true);
                  }}
                  sx={{
                    background: 'rgba(102, 126, 234,0.2)',
                    color: '#667eea',
                    border: '1px solid rgba(102, 126, 234,0.3)',
                    '&:hover': {
                      background: 'rgba(102, 126, 234,0.3)',
                      border: '1px solid rgba(102, 126, 234,0.5)'
                    }
                  }}
                >
                  Histórico
                </Button>
              </Tooltip>
              
              <Tooltip title="Tarefas">
                <Button
                  size="small"
                  startIcon={<AssignmentIcon />}
                  onClick={() => {
                    loadContactTasks();
                    setTasksDialogOpen(true);
                  }}
                  sx={{
                    background: 'rgba(255, 193, 7,0.2)',
                    color: '#ffc107',
                    border: '1px solid rgba(255, 193, 7,0.3)',
                    '&:hover': {
                      background: 'rgba(255, 193, 7,0.3)',
                      border: '1px solid rgba(255, 193, 7,0.5)'
                    }
                  }}
                >
                  Tarefas
                </Button>
              </Tooltip>
              
              <Tooltip title="Informações">
                <Button
                  size="small"
                  startIcon={<PersonIcon />}
                  onClick={() => {
                    setInfoDialogOpen(true);
                  }}
                  sx={{
                    background: 'rgba(156, 39, 176,0.2)',
                    color: '#9c27b0',
                    border: '1px solid rgba(156, 39, 176,0.3)',
                    '&:hover': {
                      background: 'rgba(156, 39, 176,0.3)',
                      border: '1px solid rgba(156, 39, 176,0.5)'
                    }
                  }}
                >
                  Info
                </Button>
              </Tooltip>
            </Box>
          </Grid>
          
          {/* Informações do Contato */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                icon={<PersonIcon />}
                label={contactStatus} 
                size="small" 
                onClick={() => {
                  const newStatus = contactStatus === 'Lead' ? 'Cliente' : 'Lead';
                  setContactStatus(newStatus);
                  toast.success(`Status alterado para ${newStatus}`);
                }}
                sx={{ 
                  backgroundColor: 'rgba(0,168,132,0.2)',
                  color: '#00a884',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(0,168,132,0.3)'
                  }
                }} 
              />
              
              <Chip 
                icon={<StarIcon />}
                label="Cliente VIP" 
                size="small" 
                onClick={() => {
                  const isVip = contactTags.includes('Cliente VIP');
                  if (isVip) {
                    setContactTags(contactTags.filter(tag => tag !== 'Cliente VIP'));
                    toast.success('Cliente removido do VIP');
                  } else {
                    setContactTags([...contactTags, 'Cliente VIP']);
                    toast.success('Cliente marcado como VIP');
                  }
                }}
                sx={{ 
                  backgroundColor: 'rgba(255, 193, 7,0.2)',
                  color: '#ffc107',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 193, 7,0.3)'
                  }
                }} 
              />
              
              <Chip 
                icon={<BusinessIcon />}
                label="Empresa" 
                size="small" 
                onClick={() => {
                  const isCompany = contactTags.includes('Empresa');
                  if (isCompany) {
                    setContactTags(contactTags.filter(tag => tag !== 'Empresa'));
                    toast.success('Cliente removido da categoria Empresa');
                  } else {
                    setContactTags([...contactTags, 'Empresa']);
                    toast.success('Cliente marcado como Empresa');
                  }
                }}
                sx={{ 
                  backgroundColor: 'rgba(102, 126, 234,0.2)',
                  color: '#667eea',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234,0.3)'
                  }
                }} 
              />
              
              <Chip 
                icon={<MoneyIcon />}
                label={contactValue} 
                size="small" 
                onClick={() => {
                  const newValue = prompt('Digite o novo valor:', contactValue);
                  if (newValue && newValue !== contactValue) {
                    setContactValue(newValue);
                    toast.success(`Valor alterado para ${newValue}`);
                  }
                }}
                sx={{ 
                  backgroundColor: 'rgba(76, 175, 80,0.2)',
                  color: '#4caf50',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(76, 175, 80,0.3)'
                  }
                }} 
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      {/* Messages Area */}
      <DialogContent 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          p: 0,
          overflow: 'hidden'
        }}
      >
        {/* Messages List */}
        <Box 
          ref={messagesContainerRef}
          sx={{ 
            flex: 1, 
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '10px',
              '&:hover': {
                background: 'rgba(255,255,255,0.4)',
              },
            },
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={40} sx={{ color: '#667eea' }} />
            </Box>
          ) : messages.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              flex: 1,
              flexDirection: 'column',
              gap: 2,
              color: 'rgba(255,255,255,0.5)'
            }}>
              <EmojiIcon sx={{ fontSize: 48, opacity: 0.3 }} />
              <Typography variant="body1">
                Nenhuma mensagem ainda
              </Typography>
              <Typography variant="caption">
                Envie a primeira mensagem para iniciar a conversa
              </Typography>
            </Box>
          ) : (
            messages.map((message) => {
              const isNewMessage = newMessageIds.has(message._id || message.messageId);
              
              return (
                <Box
                  key={message._id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.fromMe ? 'flex-end' : 'flex-start',
                    mb: 1,
                    // Animação para mensagens novas
                    opacity: isNewMessage ? 0 : 1,
                    transform: isNewMessage ? 'translateY(20px) scale(0.95)' : 'translateY(0) scale(1)',
                    animation: isNewMessage ? 'messageSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'none',
                    '@keyframes messageSlideIn': {
                      '0%': {
                        opacity: 0,
                        transform: 'translateY(20px) scale(0.95)',
                      },
                      '100%': {
                        opacity: 1,
                        transform: 'translateY(0) scale(1)',
                      }
                    }
                  }}
                >
                <Paper
                  sx={{
                    maxWidth: '70%',
                    p: 1.5,
                    background: message.fromMe 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    borderRadius: message.fromMe ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: message.fromMe 
                      ? '0 4px 20px rgba(102, 126, 234, 0.3)'
                      : '0 4px 20px rgba(0,0,0,0.2)'
                  }}
                >
                  {/* Renderizar conteúdo baseado no tipo de mensagem */}
                  {message.messageType === 'audioMessage' || message.messageType === 'ptt' ? (
                    <AudioPlayer
                      audioUrl={getAudioUrl(message)}
                      fileName={message.content?.fileName || 'Áudio'}
                      duration={message.content?.seconds || 0}
                      isFromMe={message.fromMe}
                      timestamp={message.timestamp}
                      onDownload={handleAudioDownload}
                    />
                  ) : (
                    <>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          wordBreak: 'break-word',
                          lineHeight: 1.4,
                          fontSize: '0.9rem'
                        }}
                      >
                        {message.content?.text || '[Mensagem não suportada]'}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block',
                          textAlign: 'right',
                          mt: 0.5,
                          opacity: 0.7,
                          fontSize: '0.75rem'
                        }}
                      >
                        {formatMessageTime(message.timestamp)}
                      </Typography>
                    </>
                  )}
                </Paper>
              </Box>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Message Input */}
        <Box sx={{ 
          p: 2, 
          background: 'rgba(0,0,0,0.2)',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
            <IconButton
              sx={{ 
                color: 'rgba(255,255,255,0.5)',
                '&:hover': { color: '#667eea' }
              }}
            >
              <AttachFileIcon />
            </IconButton>
            
            <IconButton
              onClick={handleOpenAudioDialog}
              sx={{ 
                color: 'rgba(255,255,255,0.5)',
                '&:hover': { color: '#f44336' }
              }}
            >
              <MicIcon />
            </IconButton>
            
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={sendingMessage}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '20px',
                  color: '#fff',
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
                '& .MuiInputBase-input': {
                  color: '#fff',
                  '&::placeholder': {
                    color: 'rgba(255,255,255,0.5)',
                  },
                },
              }}
            />
            
            <IconButton
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendingMessage}
              sx={{ 
                background: newMessage.trim() 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : 'rgba(255,255,255,0.1)',
                color: '#fff',
                width: 48,
                height: 48,
                '&:hover': {
                  background: newMessage.trim() 
                    ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)' 
                    : 'rgba(255,255,255,0.2)',
                },
                '&:disabled': {
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              {sendingMessage ? (
                <CircularProgress size={20} sx={{ color: 'inherit' }} />
              ) : (
                <SendIcon />
              )}
            </IconButton>
          </Box>
        </Box>
      </DialogContent>

      {/* Modal para envio de áudio */}
      <Dialog
        open={audioDialogOpen}
        onClose={handleCloseAudioDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            color: '#fff'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.2) 0%, rgba(233, 30, 99, 0.2) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <MicIcon sx={{ color: '#f44336' }} />
          <Typography variant="h5" component="div">Enviar Mensagem de Áudio</Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {/* Abas para escolher modo */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <Button
              variant={audioMode === 'url' ? 'contained' : 'outlined'}
              onClick={() => setAudioMode('url')}
              sx={{
                flex: 1,
                borderColor: 'rgba(255,255,255,0.3)',
                color: audioMode === 'url' ? '#fff' : 'rgba(255,255,255,0.7)',
                background: audioMode === 'url' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                '&:hover': {
                  borderColor: '#667eea',
                  background: audioMode === 'url' 
                    ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                    : 'rgba(255,255,255,0.1)'
                }
              }}
            >
              URL do Áudio
            </Button>
            <Button
              variant={audioMode === 'record' ? 'contained' : 'outlined'}
              onClick={() => setAudioMode('record')}
              sx={{
                flex: 1,
                borderColor: 'rgba(255,255,255,0.3)',
                color: audioMode === 'record' ? '#fff' : 'rgba(255,255,255,0.7)',
                background: audioMode === 'record' ? 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)' : 'transparent',
                '&:hover': {
                  borderColor: '#f44336',
                  background: audioMode === 'record' 
                    ? 'linear-gradient(135deg, #d32f2f 0%, #c2185b 100%)'
                    : 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Gravar Áudio
            </Button>
          </Box>

          {/* Modo URL */}
          {audioMode === 'url' && (
            <>
              <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
                Cole a URL do arquivo de áudio que deseja enviar:
              </Typography>
              
              <TextField
                fullWidth
                label="URL do Áudio"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://exemplo.com/audio.mp3"
                disabled={sendingAudio}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    color: '#fff',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255,255,255,0.7)',
                    '&.Mui-focused': {
                      color: '#667eea',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: '#fff',
                    '&::placeholder': {
                      color: 'rgba(255,255,255,0.5)',
                    },
                  },
                }}
              />
              
              <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'rgba(255,255,255,0.5)' }}>
                Formatos suportados: MP3, WAV, M4A, OGG
              </Typography>
            </>
          )}

          {/* Modo Gravação */}
          {audioMode === 'record' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              {/* Controles de Gravação */}
              {!recordedAudio && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  {isRecording && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      background: 'rgba(244, 67, 54, 0.2)',
                      padding: '12px 24px',
                      borderRadius: '20px',
                      border: '1px solid rgba(244, 67, 54, 0.3)'
                    }}>
                      <Box sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        backgroundColor: '#f44336',
                        animation: 'pulse 1.5s infinite'
                      }} />
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#f44336' }}>
                        Gravando: {formatRecordingTime(recordingTime)}
                      </Typography>
                    </Box>
                  )}
                  
                  <IconButton
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={sendingAudio}
                    sx={{
                      width: 80,
                      height: 80,
                      background: isRecording 
                        ? 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)'
                        : 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                      color: '#fff',
                      '&:hover': {
                        background: isRecording
                          ? 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)'
                          : 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)',
                      },
                      '&:disabled': {
                        background: 'rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.3)'
                      }
                    }}
                  >
                    {isRecording ? <StopIcon sx={{ fontSize: 40 }} /> : <MicIcon sx={{ fontSize: 40 }} />}
                  </IconButton>
                  
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
                    {isRecording ? 'Toque para parar a gravação' : 'Toque para iniciar a gravação'}
                  </Typography>
                </Box>
              )}

              {/* Preview de Áudio Gravado */}
              {recordedAudio && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    background: 'rgba(76, 175, 80, 0.2)',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(76, 175, 80, 0.3)',
                    width: '100%'
                  }}>
                    <IconButton
                      onClick={playPreview}
                      sx={{
                        background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                        color: '#fff',
                        width: 48,
                        height: 48,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)',
                        }
                      }}
                    >
                      {isPlayingPreview ? <PauseIcon /> : <PlayIcon />}
                    </IconButton>
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 600 }}>
                        Áudio Gravado
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Duração: {formatRecordingTime(recordingTime)}
                      </Typography>
                    </Box>
                    
                    <IconButton
                      onClick={deleteRecording}
                      sx={{
                        color: 'rgba(255,255,255,0.5)',
                        '&:hover': {
                          color: '#f44336',
                          background: 'rgba(244, 67, 54, 0.1)'
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
                    Toque em ▶️ para ouvir o preview ou 🗑️ para gravar novamente
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', mt: 1 }}>
                    Formato: {recordedAudio?.type || 'audio/webm'} → Enviado como MP3
                  </Typography>
                </Box>
              )}

              {/* Elemento de áudio oculto para preview */}
              <audio ref={audioPreviewRef} style={{ display: 'none' }} />
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleCloseAudioDialog}
            disabled={sendingAudio || isRecording}
            sx={{
              color: 'rgba(255,255,255,0.7)',
              '&:hover': {
                background: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Cancelar
          </Button>
          
          {audioMode === 'url' ? (
            <Button
              onClick={handleSendAudio}
              disabled={!audioUrl.trim() || sendingAudio}
              variant="contained"
              sx={{
                background: audioUrl.trim() 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : 'rgba(255,255,255,0.1)',
                color: '#fff',
                '&:hover': {
                  background: audioUrl.trim() 
                    ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)' 
                    : 'rgba(255,255,255,0.2)',
                },
                '&:disabled': {
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.3)'
                }
              }}
              startIcon={sendingAudio ? (
                <CircularProgress size={16} sx={{ color: 'inherit' }} />
              ) : (
                <MicIcon />
              )}
            >
              {sendingAudio ? 'Enviando...' : 'Enviar URL'}
            </Button>
          ) : (
            <Button
              onClick={sendRecordedAudio}
              disabled={!recordedAudio || sendingAudio || isRecording}
              variant="contained"
              sx={{
                background: recordedAudio && !isRecording
                  ? 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)' 
                  : 'rgba(255,255,255,0.1)',
                color: '#fff',
                '&:hover': {
                  background: recordedAudio && !isRecording
                    ? 'linear-gradient(135deg, #d32f2f 0%, #c2185b 100%)' 
                    : 'rgba(255,255,255,0.2)',
                },
                '&:disabled': {
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.3)'
                }
              }}
              startIcon={sendingAudio ? (
                <CircularProgress size={16} sx={{ color: 'inherit' }} />
              ) : (
                <MicIcon />
              )}
            >
              {sendingAudio ? 'Enviando...' : 'Enviar Gravação'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog de Histórico */}
      <Dialog
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            background: '#202c33', 
            color: '#e9edef',
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <HistoryIcon sx={{ color: '#667eea' }} />
          <Typography variant="h5" component="div">Histórico do Contato</Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ mb: 2, color: 'rgba(255,255,255,0.8)' }}>
            Histórico de interações com {chat?.name || 'Contato'}
          </Typography>
          
          {loadingHistory ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#667eea' }} />
            </Box>
          ) : contactHistory.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Nenhum histórico encontrado para este contato.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {contactHistory.map((entry, index) => (
                <Paper key={index} sx={{ p: 2, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Typography variant="subtitle2" sx={{ 
                    color: entry.type === 'message' ? '#667eea' : 
                           entry.type === 'call' ? '#00a884' : 
                           entry.type === 'task' ? '#ffc107' : '#9c27b0', 
                    mb: 1 
                  }}>
                    {entry.type === 'message' ? '💬' : 
                     entry.type === 'call' ? '📞' : 
                     entry.type === 'task' ? '📝' : '📋'} {entry.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                    {entry.description}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    {new Date(entry.timestamp).toLocaleString('pt-BR')}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setHistoryDialogOpen(false)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Tarefas */}
      <Dialog
        open={tasksDialogOpen}
        onClose={() => setTasksDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            background: '#202c33', 
            color: '#e9edef',
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 152, 0, 0.2) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <AssignmentIcon sx={{ color: '#ffc107' }} />
          <Typography variant="h5" component="div">Tarefas do Contato</Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Tarefas relacionadas a {chat?.name || 'Contato'}
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AssignmentIcon />}
              onClick={handleOpenCreateTask}
              sx={{
                background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                color: '#000',
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)',
                }
              }}
            >
              Nova Tarefa
            </Button>
          </Box>
          
          {loadingTasks ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#ffc107' }} />
            </Box>
          ) : contactTasks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Nenhuma tarefa encontrada para este contato.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {contactTasks.map((task, index) => (
                <Paper key={index} sx={{ p: 2, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ 
                      color: task.status === 'completed' ? '#4caf50' : 
                             task.status === 'in_progress' ? '#ffc107' : 
                             task.status === 'pending' ? '#667eea' : '#f44336'
                    }}>
                      {task.status === 'completed' ? '✅' : 
                       task.status === 'in_progress' ? '🔄' : 
                       task.status === 'pending' ? '📋' : '❌'} {task.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip 
                        label={task.status === 'completed' ? 'Concluída' : 
                               task.status === 'in_progress' ? 'Em Andamento' : 
                               task.status === 'pending' ? 'Pendente' : 'Cancelada'} 
                        size="small" 
                        sx={{ 
                          backgroundColor: task.status === 'completed' ? 'rgba(76, 175, 80,0.2)' : 
                                          task.status === 'in_progress' ? 'rgba(255, 193, 7,0.2)' : 
                                          task.status === 'pending' ? 'rgba(102, 126, 234,0.2)' : 'rgba(244, 67, 54,0.2)',
                          color: task.status === 'completed' ? '#4caf50' : 
                                 task.status === 'in_progress' ? '#ffc107' : 
                                 task.status === 'pending' ? '#667eea' : '#f44336'
                        }} 
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleEditTask(task)}
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  {task.description && (
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                      {task.description}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      Criada: {new Date(task.createdAt).toLocaleString('pt-BR')}
                    </Typography>
                    {task.dueDate && (
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        Prazo: {new Date(task.dueDate).toLocaleString('pt-BR')}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {task.status !== 'completed' && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleUpdateTaskStatus(task._id, 'completed')}
                        sx={{
                          borderColor: '#4caf50',
                          color: '#4caf50',
                          fontSize: '0.7rem',
                          minWidth: 'auto',
                          px: 1
                        }}
                      >
                        ✅ Concluir
                      </Button>
                    )}
                    {task.status === 'pending' && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleUpdateTaskStatus(task._id, 'in_progress')}
                        sx={{
                          borderColor: '#ffc107',
                          color: '#ffc107',
                          fontSize: '0.7rem',
                          minWidth: 'auto',
                          px: 1
                        }}
                      >
                        🔄 Em Andamento
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleDeleteTask(task._id)}
                      sx={{
                        borderColor: '#f44336',
                        color: '#f44336',
                        fontSize: '0.7rem',
                        minWidth: 'auto',
                        px: 1
                      }}
                    >
                      🗑️ Deletar
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setTasksDialogOpen(false)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Informações */}
      <Dialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            background: '#202c33', 
            color: '#e9edef'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.2) 0%, rgba(233, 30, 99, 0.2) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <PersonIcon sx={{ color: '#9c27b0' }} />
          <Typography variant="h5" component="div">Informações do Contato</Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                Nome Completo
              </Typography>
              <Typography variant="body1" sx={{ color: '#e9edef' }}>
                {chat?.name || 'Nome não informado'}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                Telefone
              </Typography>
              <Typography variant="body1" sx={{ color: '#e9edef' }}>
                {chat?.chatId || 'Número não informado'}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                Status
              </Typography>
              <Chip 
                label={contactStatus} 
                sx={{ 
                  backgroundColor: 'rgba(0,168,132,0.2)',
                  color: '#00a884'
                }} 
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                Valor Estimado
              </Typography>
              <Typography variant="body1" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                {contactValue}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {contactTags.map((tag, index) => (
                  <Chip 
                    key={index}
                    label={tag} 
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(102, 126, 234,0.2)',
                      color: '#667eea'
                    }} 
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setInfoDialogOpen(false)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para Criar Tarefa */}
      <Dialog
        open={createTaskDialogOpen}
        onClose={() => setCreateTaskDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            background: '#202c33', 
            color: '#e9edef'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 152, 0, 0.2) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <AssignmentIcon sx={{ color: '#ffc107' }} />
          <Typography variant="h5" component="div">Nova Tarefa</Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título da Tarefa"
                value={taskForm.title}
                onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                variant="outlined"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    color: '#fff',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ffc107',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255,255,255,0.7)',
                    '&.Mui-focused': {
                      color: '#ffc107',
                    },
                  },
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                value={taskForm.description}
                onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                variant="outlined"
                multiline
                rows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    color: '#fff',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ffc107',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255,255,255,0.7)',
                    '&.Mui-focused': {
                      color: '#ffc107',
                    },
                  },
                }}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                select
                label="Prioridade"
                value={taskForm.priority}
                onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                variant="outlined"
                SelectProps={{
                  native: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    color: '#fff',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ffc107',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255,255,255,0.7)',
                    '&.Mui-focused': {
                      color: '#ffc107',
                    },
                  },
                }}
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </TextField>
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="date"
                label="Data de Vencimento"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    color: '#fff',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ffc107',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255,255,255,0.7)',
                    '&.Mui-focused': {
                      color: '#ffc107',
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setCreateTaskDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateTask}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
              color: '#000',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)',
              }
            }}
          >
            Criar Tarefa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para Editar Tarefa */}
      <Dialog
        open={editTaskDialogOpen}
        onClose={() => setEditTaskDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            background: '#202c33', 
            color: '#e9edef'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <EditIcon sx={{ color: '#667eea' }} />
          <Typography variant="h5" component="div">Editar Tarefa</Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título da Tarefa"
                value={taskForm.title}
                onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                variant="outlined"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    color: '#fff',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255,255,255,0.7)',
                    '&.Mui-focused': {
                      color: '#667eea',
                    },
                  },
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                value={taskForm.description}
                onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                variant="outlined"
                multiline
                rows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    color: '#fff',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255,255,255,0.7)',
                    '&.Mui-focused': {
                      color: '#667eea',
                    },
                  },
                }}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                select
                label="Prioridade"
                value={taskForm.priority}
                onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                variant="outlined"
                SelectProps={{
                  native: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    color: '#fff',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255,255,255,0.7)',
                    '&.Mui-focused': {
                      color: '#667eea',
                    },
                  },
                }}
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </TextField>
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="date"
                label="Data de Vencimento"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    color: '#fff',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255,255,255,0.7)',
                    '&.Mui-focused': {
                      color: '#667eea',
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setEditTaskDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdateTask}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              }
            }}
          >
            Salvar Alterações
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default ChatWindow;