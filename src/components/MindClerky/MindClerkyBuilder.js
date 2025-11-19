import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  Switch,
  FormControlLabel,
  FormControl,
  Select
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import GridViewIcon from '@mui/icons-material/GridView';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MessageIcon from '@mui/icons-material/Message';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ApiIcon from '@mui/icons-material/Api';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SendIcon from '@mui/icons-material/Send';
import LabelIcon from '@mui/icons-material/Label';
import StopIcon from '@mui/icons-material/Stop';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useInstance } from '../../contexts/InstanceContext';
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  Handle,
  MiniMap,
  ReactFlowProvider,
  useOnViewportChange
} from 'reactflow';
import 'reactflow/dist/style.css';

const NODE_TYPES = [
  { value: 'whatsapp-message', label: 'Mensagem WhatsApp' },
  { value: 'delay', label: 'Delay / Espera' },
  { value: 'condition', label: 'Condição' },
  { value: 'webhook', label: 'Webhook / Integração' },
  { value: 'ai-response', label: 'IA / Automação' },
  { value: 'mass-dispatch', label: 'Disparo em Massa' },
  { value: 'tag-manage', label: 'Gerenciar Tags' },
  { value: 'end', label: 'Fim do Fluxo' }
];

const CONDITION_NODE_TYPE = 'mindclerky-condition';
const WHATSAPP_MESSAGE_NODE_TYPE = 'mindclerky-whatsapp-message';
const DELAY_NODE_TYPE = 'mindclerky-delay';
const WEBHOOK_NODE_TYPE = 'mindclerky-webhook';
const AI_RESPONSE_NODE_TYPE = 'mindclerky-ai-response';
const MASS_DISPATCH_NODE_TYPE = 'mindclerky-mass-dispatch';
const TAG_MANAGE_NODE_TYPE = 'mindclerky-tag-manage';
const END_NODE_TYPE = 'mindclerky-end';

const NODE_BASE_STYLE = {
  padding: 0,
  background: 'transparent',
  border: 'none',
  boxShadow: 'none'
};

// Função para obter o ícone do nó
const getNodeIcon = (nodeType) => {
  switch (nodeType) {
    case 'condition':
      return 'IF';
    case 'whatsapp-message':
      return <MessageIcon sx={{ fontSize: 20 }} />;
    case 'delay':
      return <AccessTimeIcon sx={{ fontSize: 20 }} />;
    case 'webhook':
      return <ApiIcon sx={{ fontSize: 20 }} />;
    case 'ai-response':
      return <SmartToyIcon sx={{ fontSize: 20 }} />;
    case 'mass-dispatch':
      return <SendIcon sx={{ fontSize: 20 }} />;
    case 'tag-manage':
      return <LabelIcon sx={{ fontSize: 20 }} />;
    case 'end':
      return <StopIcon sx={{ fontSize: 20 }} />;
    default:
      return '?';
  }
};

// Configuração de cores para cada tipo de nó
const NODE_CONFIG = {
  'condition': {
    color: '#38bdf8',
    bgColor: 'rgba(56,189,248,0.12)'
  },
  'whatsapp-message': {
    color: '#22c55e',
    bgColor: 'rgba(34,197,94,0.12)'
  },
  'delay': {
    color: '#eab308',
    bgColor: 'rgba(234,179,8,0.12)'
  },
  'webhook': {
    color: '#f97316',
    bgColor: 'rgba(249,115,22,0.12)'
  },
  'ai-response': {
    color: '#a855f7',
    bgColor: 'rgba(168,85,247,0.12)'
  },
  'mass-dispatch': {
    color: '#ec4899',
    bgColor: 'rgba(236,72,153,0.12)'
  },
  'tag-manage': {
    color: '#06b6d4',
    bgColor: 'rgba(6,182,212,0.12)'
  },
  'end': {
    color: '#ef4444',
    bgColor: 'rgba(239,68,68,0.12)'
  }
};

const WHATSAPP_TEMPLATE_VARIABLES = [
  {
    value: '$name',
    label: 'Nome completo',
    description: 'Nome completo do contato'
  },
  {
    value: '$firstName',
    label: 'Primeiro nome',
    description: 'Primeira palavra do nome do contato'
  },
  {
    value: '$lastName',
    label: 'Último nome',
    description: 'Sobrenome do contato (ou nome padrão)'
  },
  {
    value: '$number',
    label: 'Número formatado',
    description: 'Número formatado no padrão WhatsApp'
  },
  {
    value: '$originalNumber',
    label: 'Número original',
    description: 'Número exatamente como foi cadastrado'
  }
];

const CONDITION_TYPE_OPTIONS = [
  {
    value: 'message_contains',
    label: 'Mensagem contém texto',
    needsValue: true,
    input: 'text',
    placeholder: 'Ex.: sim'
  },
  {
    value: 'message_equals',
    label: 'Mensagem é exatamente',
    needsValue: true,
    input: 'text',
    placeholder: 'Ex.: quero comprar'
  },
  {
    value: 'message_starts_with',
    label: 'Mensagem começa com',
    needsValue: true,
    input: 'text',
    placeholder: 'Ex.: quero'
  },
  {
    value: 'message_type',
    label: 'Tipo da mensagem é',
    needsValue: true,
    input: 'select',
    options: [
      { value: 'text', label: 'Texto' },
      { value: 'image', label: 'Imagem' },
      { value: 'audio', label: 'Áudio' },
      { value: 'video', label: 'Vídeo' },
      { value: 'document', label: 'Documento' },
      { value: 'sticker', label: 'Sticker' },
      { value: 'contact', label: 'Contato' },
      { value: 'location', label: 'Localização' },
      { value: 'unknown', label: 'Outro' }
    ]
  },
  {
    value: 'message_yes',
    label: 'Resposta indica SIM',
    needsValue: false
  },
  {
    value: 'message_no',
    label: 'Resposta indica NÃO',
    needsValue: false
  },
  {
    value: 'message_any',
    label: 'Caso existir qualquer coisa',
    needsValue: false
  }
];

const defaultConfigForType = (type) => {
  switch (type) {
    case 'whatsapp-message':
      return {
        templateType: 'text',
        content: {
          text: 'Olá $firstName, tudo bem?'
        }
      };
    case 'delay':
      return { 
        delayType: 'duration', // 'duration' ou 'exactTime'
        duration: 5, 
        unit: 'seconds',
        exactTime: '22:00',
        timezone: 'America/Sao_Paulo'
      };
    case 'condition':
      return {
        rules: [
          {
            id: 'branch-yes',
            type: 'message_contains',
            value: 'sim',
            expression: toConditionExpression('message_contains', 'sim'),
            label: 'Mensagem contém "sim"',
            nextNodeId: null
          },
          {
            id: 'branch-no',
            type: 'message_contains',
            value: 'não',
            expression: toConditionExpression('message_contains', 'não'),
            label: 'Mensagem contém "não"',
            nextNodeId: null
          }
        ]
      };
    case 'webhook':
      return {
        method: 'POST',
        url: 'https://example.com/webhook',
        headers: { 'Content-Type': 'application/json' },
        payload: JSON.stringify({
          contact: '$number'
        }, null, 2)
      };
    case 'ai-response':
      return { prompt: 'Analise a mensagem e responda com cordialidade.' };
    case 'mass-dispatch':
      return {
        templateId: '',
        template: {
          type: 'text',
          content: { text: 'Mensagem em massa para {{contact.name || "Cliente"}}' }
        },
        numbers: '',
        uploadedFile: null,
        scheduleEnabled: false,
        scheduleDate: '',
        scheduleTime: '',
        scheduleTimezone: 'America/Sao_Paulo',
        autoStart: false,
        settings: {
          speed: 'normal',
          personalization: {
            enabled: true,
            defaultName: 'Cliente'
          },
          autoDelete: {
            enabled: false,
            delaySeconds: 3600,
            unit: 'hours'
          }
        }
      };
    case 'tag-manage':
      return { apply: ['novo-lead'], remove: [] };
    case 'end':
    default:
      return {};
  }
};

const getNodeType = (nodeType) => {
  switch (nodeType) {
    case 'condition':
      return CONDITION_NODE_TYPE;
    case 'whatsapp-message':
      return WHATSAPP_MESSAGE_NODE_TYPE;
    case 'delay':
      return DELAY_NODE_TYPE;
    case 'webhook':
      return WEBHOOK_NODE_TYPE;
    case 'ai-response':
      return AI_RESPONSE_NODE_TYPE;
    case 'mass-dispatch':
      return MASS_DISPATCH_NODE_TYPE;
    case 'tag-manage':
      return TAG_MANAGE_NODE_TYPE;
    case 'end':
      return END_NODE_TYPE;
    default:
      return 'default';
  }
};

const flowNodeToReactFlowNode = (node) => ({
  id: node.id,
  position: node.position || { x: 200, y: 200 },
  type: getNodeType(node.type),
  data: {
    label:
      node.name ||
      NODE_TYPES.find((option) => option.value === node.type)?.label ||
      node.type,
    nodeType: node.type,
    config: node.data || {}
  },
  style: NODE_BASE_STYLE
});

const flowEdgeToReactFlowEdge = (edge) => ({
  id: edge.id || `${edge.source}-${edge.target}`,
  source: edge.source,
  target: edge.target,
  sourceHandle: edge.sourceHandle || edge.data?.branchId || null,
  targetHandle: edge.targetHandle || null,
  animated: true,
  data: edge.data || {}
});

const reactFlowNodeToFlowNode = (node) => ({
  id: node.id,
  type: node.data?.nodeType || 'whatsapp-message',
  name: node.data?.label || '',
  position: node.position,
  data: node.data?.config || {}
});

const reactFlowEdgeToFlowEdge = (edge) => ({
  id: edge.id,
  source: edge.source,
  target: edge.target,
  sourceHandle: edge.sourceHandle || null,
  targetHandle: edge.targetHandle || null,
  data: edge.data || {}
});

const MESSAGE_VALUE_PATH = 'lastIncomingMessage.conversation';

const toConditionExpression = (type, value) => {
  const config = getConditionTypeConfig(type);
  if (!config.needsValue) return null;
  if (!value) return null;

  switch (type) {
    case 'message_contains':
      return {
        in: [
          value,
          { var: MESSAGE_VALUE_PATH }
        ]
      };
    default:
      return null;
  }
};

const getConditionLabel = (type, value, index) => {
  switch (type) {
    case 'message_contains':
      return value ? `Mensagem contém "${value}"` : 'Mensagem contém...';
    case 'message_equals':
      return value ? `Mensagem é "${value}"` : 'Mensagem é...';
    case 'message_starts_with':
      return value ? `Mensagem começa com "${value}"` : 'Mensagem começa com...';
    case 'message_type': {
      const config = getConditionTypeConfig(type);
      const optionLabel = config.options?.find((opt) => opt.value === value)?.label || value || 'tipo';
      return `Tipo da mensagem é ${optionLabel}`;
    }
    case 'message_yes':
      return 'Resposta indica SIM';
    case 'message_no':
      return 'Resposta indica NÃO';
    case 'message_any':
      return 'Caso existir qualquer coisa';
    default:
      return `Condição ${index + 1}`;
  }
};

const getConditionTypeConfig = (type) => CONDITION_TYPE_OPTIONS.find((option) => option.value === type) || CONDITION_TYPE_OPTIONS[0];

const ConditionNodeComponent = ({ data }) => {
  const rules = data?.config?.rules || [];
  const totalHandles = rules.length + 1;
  const handleLeft = (slotIndex) => {
    const percent = ((slotIndex + 1) / (totalHandles + 1)) * 100;
    return `calc(${percent.toFixed(2)}% - 6px)`;
  };

  return (
    <Paper
      elevation={8}
      sx={{
        p: 2.2,
        bgcolor: 'rgba(15,23,42,0.95)',
        background: 'linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.92) 70%, rgba(45,55,72,0.88) 100%)',
        color: '#e2e8f0',
        borderRadius: 2.5,
        minWidth: 260,
        border: '1px solid rgba(148,163,184,0.35)',
        boxShadow: '0 12px 28px rgba(15,23,42,0.35)',
        position: 'relative'
      }}
    >
      <Handle type="target" position="top" style={{ background: '#38bdf8', width: 12, height: 12 }} />

      <Stack direction="row" alignItems="center" spacing={1.5} mb={1.75}>
        <Avatar
          variant="rounded"
          sx={{
            bgcolor: 'rgba(56,189,248,0.12)',
            color: '#38bdf8',
            width: 36,
            height: 36,
            fontSize: 16,
            fontWeight: 700
          }}
        >
          IF
        </Avatar>
        <Box>
          <Typography variant="subtitle2" fontWeight={700} lineHeight={1.2} letterSpacing={0.3}>
            {data?.label || 'Condição'}
          </Typography>
          <Typography variant="caption" color="rgba(226,232,240,0.7)">
            {rules.length} {rules.length === 1 ? 'rota definida' : 'rotas definidas'}
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={1.25} sx={{ pr: 1 }}>
        {rules.map((rule, index) => (
          <Tooltip key={rule.id} title={rule.label || rule.id} placement="top">
            <Paper
              elevation={0}
              sx={{
                bgcolor: 'rgba(148,163,184,0.08)',
                border: '1px solid rgba(148,163,184,0.18)',
                borderRadius: 2,
                px: 1.5,
                py: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                color: '#e2e8f0'
              }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: 'rgba(56,189,248,0.16)',
                  border: '1px solid rgba(56,189,248,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#38bdf8'
                }}
              >
                {index + 1}
              </Box>
              <Typography variant="body2" fontWeight={500} sx={{ flex: 1 }}>
                {rule.label || `Rota ${index + 1}`}
              </Typography>
            </Paper>
          </Tooltip>
        ))}
      </Stack>

      <Box mt={2.5} py={1.1} px={1.5} borderRadius={2} border="1px dashed rgba(148,163,184,0.35)" bgcolor="rgba(148,163,184,0.06)" textAlign="center">
        <Typography variant="caption" color="rgba(226,232,240,0.65)">
          Saída padrão (sem correspondência)
        </Typography>
      </Box>

      <Box sx={{ position: 'absolute', left: 12, right: 12, bottom: -16, height: 0 }}>
        {rules.map((rule, index) => (
          <Box
            key={rule.id}
            sx={{
              position: 'absolute',
              left: handleLeft(index),
              transform: 'translateX(-50%)',
              textAlign: 'center'
            }}
          >
            <Typography
              variant="caption"
              sx={{
                display: 'inline-block',
                mb: 0.5,
                px: 0.6,
                py: 0.1,
                borderRadius: 1,
                bgcolor: 'rgba(56,189,248,0.12)',
                color: '#38bdf8',
                fontSize: '0.65rem',
                border: '1px solid rgba(56,189,248,0.25)'
              }}
            >
              {index + 1}
            </Typography>
            <Handle
              type="source"
              position="bottom"
              id={rule.id}
              style={{
                background: '#38bdf8',
                width: 12,
                height: 12,
                border: '2px solid rgba(15,23,42,0.85)',
                bottom: 0
              }}
            />
          </Box>
        ))}
        <Box
          sx={{
            position: 'absolute',
            left: handleLeft(totalHandles - 1),
            transform: 'translateX(-50%)',
            textAlign: 'center'
          }}
        >
          <Typography
            variant="caption"
            sx={{
              display: 'inline-block',
              mb: 0.5,
              px: 0.75,
              py: 0.1,
              borderRadius: 1,
              bgcolor: 'rgba(148,163,184,0.18)',
              color: '#cbd5f5',
              fontSize: '0.65rem',
              border: '1px solid rgba(148,163,184,0.35)'
            }}
          >
            P
          </Typography>
          <Handle
            type="source"
            position="bottom"
            id="default"
            style={{
              background: '#94a3b8',
              width: 12,
              height: 12,
              border: '2px solid rgba(15,23,42,0.9)',
              bottom: 0
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
};

// Componente base para nós customizados
const CustomNodeComponent = ({ data, nodeType, massDispatchTemplates = [] }) => {
  const config = NODE_CONFIG[nodeType] || NODE_CONFIG['whatsapp-message'];
  const label = data?.label || NODE_TYPES.find(t => t.value === nodeType)?.label || nodeType;
  const icon = getNodeIcon(nodeType);
  
  // Obter subtítulo baseado no tipo
  const getSubtitle = () => {
    switch (nodeType) {
      case 'whatsapp-message':
        const text = data?.config?.content?.text || '';
        return text ? (text.length > 30 ? text.substring(0, 30) + '...' : text) : 'Mensagem não configurada';
      case 'delay':
        if (data?.config?.delayType === 'exactTime') {
          return `Hora: ${data?.config?.exactTime || '22:00'}`;
        }
        return `${data?.config?.duration || 5} ${data?.config?.unit === 'seconds' ? 'seg' : data?.config?.unit === 'minutes' ? 'min' : data?.config?.unit === 'hours' ? 'h' : 'dias'}`;
      case 'webhook':
        return data?.config?.url ? `URL: ${data.config.url.substring(0, 25)}...` : 'Webhook não configurado';
      case 'ai-response':
        return 'Resposta automática com IA';
      case 'mass-dispatch':
        const templateName = massDispatchTemplates.find(t => t._id === data?.config?.templateId)?.name;
        const numbersCount = data?.config?.numbers ? data.config.numbers.split('\n').filter(n => n.trim()).length : 0;
        const hasFile = data?.config?.uploadedFile ? 1 : 0;
        const totalContacts = numbersCount + hasFile;
        const speed = data?.config?.settings?.speed || 'normal';
        const speedLabels = {
          fast: 'Rápido',
          normal: 'Normal',
          slow: 'Lento',
          random: 'Randomizado'
        };
        let subtitle = '';
        
        if (templateName) {
          subtitle = `Template: ${templateName}`;
        } else {
          subtitle = 'Disparo em massa';
        }
        
        if (totalContacts > 0) {
          subtitle += ` | ${totalContacts} contato(s)`;
        }
        
        subtitle += ` | ${speedLabels[speed] || speed}`;
        
        if (data?.config?.scheduleEnabled && data?.config?.scheduleDate && data?.config?.scheduleTime) {
          const scheduleDate = new Date(`${data.config.scheduleDate}T${data.config.scheduleTime}`);
          subtitle += ` | Agendado: ${scheduleDate.toLocaleString('pt-BR')}`;
        }
        
        return subtitle || 'Disparo em massa';
      case 'tag-manage':
        const applyTags = data?.config?.apply || [];
        const removeTags = data?.config?.remove || [];
        if (applyTags.length > 0 || removeTags.length > 0) {
          return `${applyTags.length} adicionar, ${removeTags.length} remover`;
        }
        return 'Tags não configuradas';
      case 'end':
        return 'Finaliza o fluxo';
      default:
        return '';
    }
  };

  return (
    <Paper
      elevation={8}
      sx={{
        p: 2.2,
        bgcolor: 'rgba(15,23,42,0.95)',
        background: 'linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.92) 70%, rgba(45,55,72,0.88) 100%)',
        color: '#e2e8f0',
        borderRadius: 2.5,
        minWidth: 260,
        border: `1px solid ${config.color}40`,
        boxShadow: `0 12px 28px rgba(15,23,42,0.35), 0 0 0 1px ${config.color}20`,
        position: 'relative'
      }}
    >
      <Handle type="target" position="top" style={{ background: config.color, width: 12, height: 12 }} />

      <Stack direction="row" alignItems="center" spacing={1.5} mb={1.75}>
        <Avatar
          variant="rounded"
          sx={{
            bgcolor: config.bgColor,
            color: config.color,
            width: 36,
            height: 36,
            fontSize: 16,
            fontWeight: 700
          }}
        >
          {typeof icon === 'string' ? icon : icon}
        </Avatar>
        <Box>
          <Typography variant="subtitle2" fontWeight={700} lineHeight={1.2} letterSpacing={0.3}>
            {label}
          </Typography>
          <Typography variant="caption" color="rgba(226,232,240,0.7)">
            {getSubtitle()}
          </Typography>
        </Box>
      </Stack>

      {nodeType !== 'end' && (
        <Box sx={{ position: 'absolute', left: '50%', bottom: -16, transform: 'translateX(-50%)', textAlign: 'center' }}>
          <Handle
            type="source"
            position="bottom"
            style={{
              background: config.color,
              width: 12,
              height: 12,
              border: '2px solid rgba(15,23,42,0.85)',
              bottom: 0
            }}
          />
        </Box>
      )}
    </Paper>
  );
};

const MindClerkyBuilderInner = ({ flow, onClose, onRefresh, templates }) => {
  const { instances } = useInstance();
  const [localFlow, setLocalFlow] = useState(flow);
  const [instanceName, setInstanceName] = useState(flow.instanceName || '');
  const [saving, setSaving] = useState(false);
  const [massDispatchTemplates, setMassDispatchTemplates] = useState([]);
  
  // Criar componentes de nós com acesso ao estado
  const customNodeTypes = useMemo(() => ({
    [CONDITION_NODE_TYPE]: ConditionNodeComponent,
    [WHATSAPP_MESSAGE_NODE_TYPE]: ({ data }) => <CustomNodeComponent data={data} nodeType="whatsapp-message" massDispatchTemplates={massDispatchTemplates} />,
    [DELAY_NODE_TYPE]: ({ data }) => <CustomNodeComponent data={data} nodeType="delay" massDispatchTemplates={massDispatchTemplates} />,
    [WEBHOOK_NODE_TYPE]: ({ data }) => <CustomNodeComponent data={data} nodeType="webhook" massDispatchTemplates={massDispatchTemplates} />,
    [AI_RESPONSE_NODE_TYPE]: ({ data }) => <CustomNodeComponent data={data} nodeType="ai-response" massDispatchTemplates={massDispatchTemplates} />,
    [MASS_DISPATCH_NODE_TYPE]: ({ data }) => <CustomNodeComponent data={data} nodeType="mass-dispatch" massDispatchTemplates={massDispatchTemplates} />,
    [TAG_MANAGE_NODE_TYPE]: ({ data }) => <CustomNodeComponent data={data} nodeType="tag-manage" massDispatchTemplates={massDispatchTemplates} />,
    [END_NODE_TYPE]: ({ data }) => <CustomNodeComponent data={data} nodeType="end" massDispatchTemplates={massDispatchTemplates} />
  }), [massDispatchTemplates]);
  
  const [nodes, setNodes] = useState((flow.nodes || []).map((node) => ({
    ...flowNodeToReactFlowNode(node),
    selected: false
  })));
  const [edges, setEdges] = useState((flow.edges || []).map(flowEdgeToReactFlowEdge));
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [propertyPanelOpen, setPropertyPanelOpen] = useState(false);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const messageInputRef = useRef(null);
  const webhookPayloadRef = useRef(null);
  const [deletePopover, setDeletePopover] = useState({ visible: false, x: 0, y: 0 });

  const updateDeletePopoverPosition = useCallback(() => {
    if (!selectedNodeId) {
      setDeletePopover({ visible: false, x: 0, y: 0 });
      return;
    }
    const nodeElement = document.querySelector(`.react-flow__node[data-id="${selectedNodeId}"]`);
    if (!nodeElement) {
      setDeletePopover({ visible: false, x: 0, y: 0 });
      return;
    }
    const rect = nodeElement.getBoundingClientRect();
    setDeletePopover({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 12
    });
  }, [selectedNodeId]);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  // Carregar templates de disparo em massa
  useEffect(() => {
    const loadMassDispatchTemplates = async () => {
      try {
        const response = await api.get('/api/mass-dispatch/templates/list');
        setMassDispatchTemplates(response.data.data || []);
      } catch (error) {
        console.error('Erro ao carregar templates de disparo em massa:', error);
      }
    };
    loadMassDispatchTemplates();
  }, []);

  useEffect(() => {
    updateDeletePopoverPosition();
  }, [selectedNodeId, updateDeletePopoverPosition]);

  useOnViewportChange({
    onChange: updateDeletePopoverPosition,
    onEnd: updateDeletePopoverPosition
  });

  useEffect(() => {
    setLocalFlow(flow);
    setInstanceName(flow.instanceName || '');
    setNodes((flow.nodes || []).map((node) => ({
      ...flowNodeToReactFlowNode(node),
      selected: false
    })));
    setEdges((flow.edges || []).map(flowEdgeToReactFlowEdge));
    setSelectedNodeId(null);
    setPropertyPanelOpen(false);
  }, [flow]);

  useEffect(() => {
    setLocalFlow((prev) => ({
      ...prev,
      nodes: nodes.map(reactFlowNodeToFlowNode),
      edges: edges.map(reactFlowEdgeToFlowEdge)
    }));
  }, [nodes, edges]);

  const handleNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const handleEdgesChange = useCallback(
    (changes) => {
      const removedIds = changes.filter((change) => change.type === 'remove').map((change) => change.id);
      if (removedIds.length > 0) {
        const removedEdges = edgesRef.current.filter((edge) => removedIds.includes(edge.id));
        if (removedEdges.length > 0) {
          setNodes((prevNodes) =>
            prevNodes.map((node) => {
              if (node.data?.nodeType !== 'condition') return node;
              const updatedRules = (node.data?.config?.rules || []).map((rule) => {
                const shouldReset = removedEdges.some((edge) =>
                  edge.source === node.id && ((edge.data?.branchId && edge.data.branchId === rule.id) || edge.sourceHandle === rule.id)
                );
                if (!shouldReset) return rule;
                return {
                  ...rule,
                  nextNodeId: null
                };
              });
              return {
                ...node,
                data: {
                  ...node.data,
                  config: {
                    ...(node.data?.config || {}),
                    rules: updatedRules
                  }
                }
              };
            })
          );
        }
      }
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    []
  );

  const handleConnect = useCallback((connection) => {
    setEdges((eds) => {
      const sourceNode = nodesRef.current.find((node) => node.id === connection.source);
      const newEdge = {
        ...connection,
        id: `edge-${Date.now()}`,
        animated: true
      };

      if (sourceNode?.data?.nodeType === 'condition') {
        const rules = sourceNode.data?.config?.rules || [];
        const existingEdges = eds.filter((edge) => edge.source === connection.source);
        const usedBranchIds = existingEdges
          .map((edge) => edge.data?.branchId || edge.sourceHandle)
          .filter(Boolean);

        let selectedRule = rules.find((rule) => !usedBranchIds.includes(rule.id));
        if (!selectedRule && rules.length > 0) {
          selectedRule = rules[0];
        }

        if (selectedRule) {
          newEdge.sourceHandle = selectedRule.id;
          newEdge.data = {
            ...(newEdge.data || {}),
            branchId: selectedRule.id
          };

          setNodes((prevNodes) =>
            prevNodes.map((node) => {
              if (node.id !== sourceNode.id) return node;
              const updatedRules = (node.data?.config?.rules || []).map((rule) => {
                if (rule.id !== selectedRule.id) return rule;
                return {
                  ...rule,
                  nextNodeId: connection.target
                };
              });
              return {
                ...node,
                data: {
                  ...node.data,
                  config: {
                    ...(node.data?.config || {}),
                    rules: updatedRules
                  }
                }
              };
            })
          );
        }
      }

      return addEdge(newEdge, eds);
    });
  }, []);

  const summary = useMemo(() => ({
    nodes: nodes.length,
    edges: edges.length,
    triggers: localFlow.triggers?.length || 0
  }), [nodes.length, edges.length, localFlow.triggers]);

  const saveFlow = useCallback(async () => {
    if (!localFlow) return;
    try {
      setSaving(true);
      const payload = {
        ...localFlow,
        instanceName
      };
      const response = await api.put(`/api/mind-clerky/flows/${localFlow._id}`, payload);
      toast.success('Fluxo salvo com sucesso');
      setLocalFlow(response.data.data);
      onRefresh?.();
    } catch (error) {
      console.error('Erro ao salvar fluxo MindClerky:', error);
      toast.error(error.response?.data?.error || 'Erro ao salvar fluxo MindClerky');
      throw error;
    } finally {
      setSaving(false);
    }
  }, [instanceName, localFlow, onRefresh]);

  const duplicateTemplate = async () => {
    if (!localFlow) return;
    try {
      await api.post(`/api/mind-clerky/flows/${localFlow._id}/duplicate-template`);
      toast.success('Template criado a partir deste fluxo');
      onRefresh?.();
    } catch (error) {
      console.error('Erro ao duplicar como template:', error);
      toast.error(error.response?.data?.error || 'Erro ao criar template');
    }
  };

  const addNode = (type) => {
    const id = `node-${Date.now()}`;
    const newNode = {
      id,
      position: { x: 150 + Math.random() * 320, y: 150 + Math.random() * 240 },
      type: getNodeType(type),
      data: {
        label: NODE_TYPES.find((option) => option.value === type)?.label || type,
        nodeType: type,
        config: defaultConfigForType(type)
      },
      style: NODE_BASE_STYLE
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(id);
  };

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );

  const conditionRules = selectedNode?.data?.nodeType === 'condition'
    ? selectedNode.data?.config?.rules || []
    : [];

  const updateSelectedNode = (updater) => {
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id !== selectedNodeId) return node;
        return updater(node);
      })
    );
  };

useEffect(() => {
  if (!selectedNode || selectedNode.data?.nodeType !== 'condition') return;

  updateSelectedNode((node) => {
    const rules = node.data?.config?.rules || [];
    const normalized = rules.map((rule, index) => {
      const config = getConditionTypeConfig(rule.type);
      const type = config.value;
      let value = rule.value;

      if (!config.needsValue) {
        value = '';
      } else if (config.input === 'select') {
        const availableValues = config.options?.map((opt) => opt.value) || [];
        if (!value || !availableValues.includes(value)) {
          value = availableValues[0] || '';
        }
      } else {
        value = value || '';
      }

      const expression = toConditionExpression(type, value) || rule.expression || null;
      const id = rule.id || `branch-${index + 1}`;
      const label = rule.label || getConditionLabel(type, value, index);

      const edgesFromNode = edgesRef.current.filter((edge) => edge.source === node.id);
      const edgeByBranch = edgesFromNode.find(
        (edge) => (edge.data?.branchId || edge.sourceHandle) === id
      );
      let nextNodeId = rule.nextNodeId ?? null;
      if (edgeByBranch) {
        nextNodeId = edgeByBranch.target;
      } else if (!nextNodeId && edgesFromNode[index]) {
        nextNodeId = edgesFromNode[index].target;
      }

      return {
        ...rule,
        id,
        type,
        value,
        expression,
        label,
        nextNodeId
      };
    });

    const changed = JSON.stringify(normalized) !== JSON.stringify(rules);
    if (!changed) return node;

    return {
      ...node,
      data: {
        ...node.data,
        config: {
          ...(node.data?.config || {}),
          rules: normalized
        }
      }
    };
  });
}, [selectedNodeId, selectedNode?.data?.nodeType, edges]);

  const handleSelectionChange = ({ nodes: selected }) => {
    const firstSelectedId = selected[0]?.id || null;
    setSelectedNodeId(firstSelectedId);
    if (!firstSelectedId) {
      setPropertyPanelOpen(false);
    }
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        selected: selected.some((selectedNode) => selectedNode.id === node.id)
      }))
    );
    requestAnimationFrame(updateDeletePopoverPosition);
  };

  const handleNodeClick = (_, node) => {
    setSelectedNodeId(node?.id || null);
    setPropertyPanelOpen(false);
    setNodes((prev) =>
      prev.map((item) => ({
        ...item,
        selected: item.id === node?.id
      }))
    );
    requestAnimationFrame(updateDeletePopoverPosition);
  };

  const handleNodeDoubleClick = useCallback((_, node) => {
    setSelectedNodeId(node?.id || null);
    setPropertyPanelOpen(Boolean(node?.id));
    setNodes((prev) =>
      prev.map((item) => ({
        ...item,
        selected: item.id === node?.id
      }))
    );
    requestAnimationFrame(updateDeletePopoverPosition);
  }, [updateDeletePopoverPosition]);

  const handlePaneClick = () => {
    deselectAllNodes();
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setPropertyPanelOpen(false);
    setDeletePopover({ visible: false, x: 0, y: 0 });
  };

  const handleClosePropertyPanel = () => {
    deselectAllNodes();
    setPropertyPanelOpen(false);
    setSelectedNodeId(null);
    setDeletePopover({ visible: false, x: 0, y: 0 });
  };

  const handleCloseBuilder = async () => {
    try {
      if (!saving && typeof saveFlow === 'function') {
        setSaving(true);
        await saveFlow();
      }
      if (typeof onClose === 'function') {
        onClose();
      }
    } catch (error) {
      console.error('Erro ao salvar antes de fechar o builder:', error);
      toast.error('Não foi possível salvar o fluxo antes de fechar. Verifique os campos e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const applyTemplate = (template) => {
    setNodes((template.nodes || []).map((node) => ({
      ...flowNodeToReactFlowNode(node),
      selected: false
    })));
    setEdges((template.edges || []).map(flowEdgeToReactFlowEdge));
    setSelectedNodeId(null);
    setPropertyPanelOpen(false);
    setDeletePopover({ visible: false, x: 0, y: 0 });
    setLocalFlow((prev) => ({
      ...prev,
      nodes: template.nodes,
      edges: template.edges,
      triggers: template.triggers,
      settings: template.settings
    }));
    toast.success(`Template ${template.name} aplicado ao fluxo`);
  };

  const handleConditionRuleValueChange = (ruleId, value) => {
    updateSelectedNode((node) => {
      const rules = node.data?.config?.rules || [];
      const updated = rules.map((rule, index) => {
        if (rule.id !== ruleId) return rule;
        const config = getConditionTypeConfig(rule.type);
        if (!config.needsValue) {
          return {
            ...rule,
            value: '',
            expression: toConditionExpression(rule.type, '')
          };
        }

        let sanitizedValue = value;
        if (config.input === 'select') {
          const allowed = config.options?.map((opt) => opt.value) || [];
          if (!allowed.includes(value)) {
            sanitizedValue = allowed[0] || '';
          }
        }

        const expression = toConditionExpression(rule.type, sanitizedValue);
        return {
          ...rule,
          value: sanitizedValue,
          expression,
          label: getConditionLabel(rule.type, sanitizedValue, index)
        };
      });
      return {
        ...node,
        data: {
          ...node.data,
          config: {
            ...(node.data?.config || {}),
            rules: updated
          }
        }
      };
    });
  };

  const handleConditionRuleLabelChange = (ruleId, label) => {
    updateSelectedNode((node) => {
      const rules = node.data?.config?.rules || [];
      const updated = rules.map((rule) => {
        if (rule.id !== ruleId) return rule;
        return {
          ...rule,
          label
        };
      });
      return {
        ...node,
        data: {
          ...node.data,
          config: {
            ...(node.data?.config || {}),
            rules: updated
          }
        }
      };
    });
  };

  const handleConditionRuleTypeChange = (ruleId, newType) => {
    updateSelectedNode((node) => {
      const rules = node.data?.config?.rules || [];
      const updated = rules.map((rule, index) => {
        if (rule.id !== ruleId) return rule;
        const config = getConditionTypeConfig(newType);
        const defaultValue = !config.needsValue
          ? ''
          : config.input === 'select'
            ? (config.options?.[0]?.value || '')
            : '';
        const expression = toConditionExpression(newType, defaultValue);
        return {
          ...rule,
          type: newType,
          value: defaultValue,
          expression,
          label: getConditionLabel(newType, defaultValue, index),
          nextNodeId: null
        };
      });
      return {
        ...node,
        data: {
          ...node.data,
          config: {
            ...(node.data?.config || {}),
            rules: updated
          }
        }
      };
    });
  };

  const handleConditionRuleRemove = (ruleId) => {
    const nodeId = selectedNodeId;
    updateSelectedNode((node) => {
      const rules = (node.data?.config?.rules || []).filter((rule) => rule.id !== ruleId);
      return {
        ...node,
        data: {
          ...node.data,
          config: {
            ...(node.data?.config || {}),
            rules
          }
        }
      };
    });

    if (nodeId) {
      setEdges((eds) => eds.filter((edge) => {
        if (edge.source !== nodeId) return true;
        const branchId = edge.data?.branchId || edge.sourceHandle;
        return branchId !== ruleId;
      }));
    }
  };

  const handleAddConditionRule = () => {
    updateSelectedNode((node) => {
      const rules = node.data?.config?.rules || [];
      const newId = `branch-${Date.now()}`;
      const defaultType = CONDITION_TYPE_OPTIONS[0]?.value || 'message_contains';
      const defaultConfig = getConditionTypeConfig(defaultType);
      const defaultValue = !defaultConfig.needsValue
        ? ''
        : defaultConfig.input === 'select'
          ? (defaultConfig.options?.[0]?.value || '')
          : '';

      const newRule = {
        id: newId,
        type: defaultType,
        value: defaultValue,
        expression: toConditionExpression(defaultType, defaultValue),
        label: getConditionLabel(defaultType, defaultValue, rules.length),
        nextNodeId: null
      };
      return {
        ...node,
        data: {
          ...node.data,
          config: {
            ...(node.data?.config || {}),
            rules: [...rules, newRule]
          }
        }
      };
    });
  };

  const handleInsertWhatsappVariable = (variable) => {
    const textarea = messageInputRef.current;
    const currentText = selectedNode?.data?.config?.content?.text || '';

    let nextText = currentText;
    let caretPosition = null;

    if (textarea && typeof textarea.selectionStart === 'number') {
      const { selectionStart, selectionEnd } = textarea;
      nextText = `${currentText.slice(0, selectionStart)}${variable}${currentText.slice(selectionEnd)}`;
      caretPosition = selectionStart + variable.length;
    } else {
      nextText = `${currentText}${variable}`;
    }

    updateSelectedNode((node) => ({
      ...node,
      data: {
        ...node.data,
        config: {
          ...(node.data?.config || {}),
          content: {
            ...(node.data?.config?.content || {}),
            text: nextText
          }
        }
      }
    }));

    if (textarea && caretPosition !== null) {
      requestAnimationFrame(() => {
        if (messageInputRef.current) {
          messageInputRef.current.focus();
          messageInputRef.current.setSelectionRange(caretPosition, caretPosition);
        }
      });
    }
  };

  const handleInsertWebhookVariable = (variable) => {
    const textarea = webhookPayloadRef.current;
    const rawPayload = selectedNode?.data?.config?.payload;
    const currentPayload = typeof rawPayload === 'string'
      ? rawPayload
      : JSON.stringify(rawPayload || {}, null, 2);

    let nextPayload = currentPayload || '';
    let caretPosition = null;

    if (textarea && typeof textarea.selectionStart === 'number') {
      const { selectionStart, selectionEnd } = textarea;
      nextPayload = `${currentPayload.slice(0, selectionStart)}${variable}${currentPayload.slice(selectionEnd)}`;
      caretPosition = selectionStart + variable.length;
    } else {
      nextPayload = `${currentPayload}${variable}`;
    }

    updateSelectedNode((node) => ({
      ...node,
      data: {
        ...node.data,
        config: {
          ...(node.data?.config || {}),
          payload: nextPayload
        }
      }
    }));

    if (textarea && caretPosition !== null) {
      requestAnimationFrame(() => {
        if (webhookPayloadRef.current) {
          webhookPayloadRef.current.focus();
          webhookPayloadRef.current.setSelectionRange(caretPosition, caretPosition);
        }
      });
    }
  };

  const deselectAllNodes = useCallback(() => {
    setNodes((prev) => prev.map((node) => ({ ...node, selected: false })));
  }, []);

  const handleDeleteSelectedNode = () => {
    if (!selectedNodeId) return;
    setNodes((prev) => prev.filter((node) => node.id !== selectedNodeId));
    setEdges((prev) => prev.filter((edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId));
    setSelectedNodeId(null);
    setPropertyPanelOpen(false);
    setDeletePopover({ visible: false, x: 0, y: 0 });
    toast.success('Nó removido do fluxo');
  };

  const handleDeleteSelectedEdge = useCallback(() => {
    if (!selectedEdgeId) return;
    setEdges((prev) => {
      const updatedEdges = prev.filter((edge) => edge.id !== selectedEdgeId);
      
      // Atualizar regras de condição se necessário
      const removedEdge = prev.find((edge) => edge.id === selectedEdgeId);
      if (removedEdge) {
        setNodes((prevNodes) =>
          prevNodes.map((node) => {
            if (node.data?.nodeType !== 'condition' || node.id !== removedEdge.source) return node;
            const updatedRules = (node.data?.config?.rules || []).map((rule) => {
              const shouldReset = (removedEdge.data?.branchId && removedEdge.data.branchId === rule.id) || 
                                  removedEdge.sourceHandle === rule.id;
              if (!shouldReset) return rule;
              return {
                ...rule,
                nextNodeId: null
              };
            });
            return {
              ...node,
              data: {
                ...node.data,
                config: {
                  ...(node.data?.config || {}),
                  rules: updatedRules
                }
              }
            };
          })
        );
      }
      
      return updatedEdges;
    });
    setSelectedEdgeId(null);
    toast.success('Ligação removida');
  }, [selectedEdgeId]);

  const handleCloneNode = useCallback(() => {
    if (!selectedNodeId) {
      toast.error('Selecione um nó para clonar');
      return;
    }
    
    const nodeToClone = nodesRef.current.find((node) => node.id === selectedNodeId);
    if (!nodeToClone) {
      toast.error('Nó não encontrado');
      return;
    }

    const newId = `node-${Date.now()}`;
    const clonedNode = {
      ...nodeToClone,
      id: newId,
      position: {
        x: nodeToClone.position.x + 200,
        y: nodeToClone.position.y + 100
      },
      selected: false
    };

    // Remover referências de nextNodeId nas regras de condição
    if (clonedNode.data?.nodeType === 'condition' && clonedNode.data?.config?.rules) {
      clonedNode.data.config.rules = clonedNode.data.config.rules.map((rule) => ({
        ...rule,
        nextNodeId: null
      }));
    }

    setNodes((prev) => [...prev, clonedNode]);
    setSelectedNodeId(newId);
    toast.success('Nó clonado com sucesso');
  }, [selectedNodeId]);

  // Adicionar listener de teclado para deletar edges e clonar nós
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Deletar edge selecionada
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedEdgeId && !selectedNodeId) {
        event.preventDefault();
        handleDeleteSelectedEdge();
      }
      // Clonar nó com Ctrl+D ou Cmd+D
      if ((event.ctrlKey || event.metaKey) && event.key === 'd' && selectedNodeId && !event.target.matches('input, textarea')) {
        event.preventDefault();
        handleCloneNode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEdgeId, selectedNodeId, handleDeleteSelectedEdge, handleCloneNode]);

  return (
    <Box sx={{ display: 'flex', height: '100%', bgcolor: '#0f172a', color: '#e2e8f0' }}>
      <Box sx={{ flex: 1, p: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Toolbar disableGutters sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" flex={1}>
            <Typography variant="h5" fontWeight={700}>
              {localFlow?.name}
            </Typography>
            <Chip label={localFlow?.status || 'draft'} size="small" />
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Versão {localFlow?.version}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            {selectedNodeId && (
              <IconButton 
                color="inherit" 
                title="Clonar nó (Ctrl+D)"
                onClick={handleCloneNode}
              >
                <ContentCopyIcon />
              </IconButton>
            )}
            <IconButton color="inherit" title="Desfazer">
              <UndoIcon />
            </IconButton>
            <IconButton color="inherit" title="Refazer">
              <RedoIcon />
            </IconButton>
            <IconButton color="inherit" title="Tela cheia (em breve)">
              <GridViewIcon />
            </IconButton>
            <IconButton color="inherit" onClick={handleCloseBuilder} title="Fechar">
              <CloseIcon />
            </IconButton>
          </Stack>
        </Toolbar>

        <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
          {NODE_TYPES.map((option) => (
            <Button
              key={option.value}
              variant="outlined"
              size="small"
              onClick={() => addNode(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </Stack>

        <Box
          sx={{
            flex: 1,
            borderRadius: 2,
            border: '1px solid rgba(148, 163, 184, 0.25)',
            overflow: 'hidden',
            '& .react-flow__node': {
              background: '#1f2937',
              color: '#f8fafc',
              border: '1px solid rgba(148,163,184,0.4)',
              borderRadius: 8,
              padding: '10px 16px'
            }
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={handleConnect}
            onSelectionChange={handleSelectionChange}
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleNodeDoubleClick}
            onPaneClick={handlePaneClick}
            onEdgeClick={(_, edge) => {
              setSelectedEdgeId(edge.id);
              setSelectedNodeId(null);
              setPropertyPanelOpen(false);
            }}
            nodeTypes={customNodeTypes}
            fitView
            deleteKeyCode={null}
          >
            <MiniMap
              style={{
                height: 130,
                width: 180,
                background: 'rgba(15,23,42,0.85)',
                borderRadius: 12,
                border: '1px solid rgba(148,163,184,0.25)',
                bottom: 24,
                left: 24
              }}
              zoomable
              pannable
              maskColor="rgba(15,23,42,0.55)"
              nodeColor={(node) => {
                switch (node.data?.nodeType) {
                  case 'condition':
                    return '#38bdf8';
                  case 'whatsapp-message':
                    return '#22c55e';
                  case 'delay':
                    return '#eab308';
                  case 'webhook':
                    return '#f97316';
                  default:
                    return '#94a3b8';
                }
              }}
              nodeStrokeColor={() => '#0f172a'}
            />
            <Controls />
            <Background variant="dots" gap={16} size={1} />
          </ReactFlow>
        </Box>

        {deletePopover.visible && (
          <Box
            sx={{
              position: 'fixed',
              left: deletePopover.x,
              top: deletePopover.y,
              transform: 'translate(-50%, -100%)',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: 'rgba(15,23,42,0.95)',
              borderRadius: 2,
              border: '1px solid rgba(148,163,184,0.35)',
              px: 1.5,
              py: 0.75,
              boxShadow: '0 12px 24px rgba(15,23,42,0.35)',
              zIndex: 5
            }}
          >
            <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.8)' }}>
              Nó selecionado
            </Typography>
            <Button
              size="small"
              color="error"
              variant="contained"
              startIcon={<DeleteForeverIcon fontSize="small" />}
              onClick={handleDeleteSelectedNode}
            >
              Remover
            </Button>
          </Box>
        )}

        {selectedEdgeId && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: 'rgba(15,23,42,0.95)',
              border: '1px solid rgba(148,163,184,0.3)',
              borderRadius: 2,
              p: 1.5,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              zIndex: 1000
            }}
          >
            <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
              Ligação selecionada - Pressione Delete para remover
            </Typography>
            <Button
              size="small"
              color="error"
              variant="contained"
              startIcon={<DeleteForeverIcon fontSize="small" />}
              onClick={handleDeleteSelectedEdge}
            >
              Remover Ligação
            </Button>
          </Box>
        )}
      </Box>

      <Drawer
        anchor="right"
        open={propertyPanelOpen}
        onClose={handleClosePropertyPanel}
        variant="temporary"
        hideBackdrop
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: 380,
            maxWidth: '100%',
            bgcolor: '#1e293b',
            color: '#f8fafc',
            borderLeft: '1px solid rgba(148,163,184,0.2)',
            overflowX: 'hidden'
          }
        }}
      >
        <Box sx={{ 
          p: 3, 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2,
          overflowX: 'hidden',
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: '100%'
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={600}>
              Propriedades do fluxo
            </Typography>
            <IconButton size="small" onClick={handleClosePropertyPanel} sx={{ color: '#f8fafc' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Typography variant="body2" color="rgba(226,232,240,0.7)">
            Configure os detalhes do fluxo e personalize os nós selecionados.
          </Typography>

          <Stack spacing={2} sx={{ overflowY: 'auto', overflowX: 'hidden', flexGrow: 1, width: '100%', maxWidth: '100%' }}>
            <TextField
              label="Nome do fluxo"
              value={localFlow?.name || ''}
              onChange={(event) =>
                setLocalFlow((prev) => ({ ...prev, name: event.target.value }))
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Instância Evolution"
              value={instanceName}
              onChange={(event) => setInstanceName(event.target.value)}
              helperText="Selecione qual instância executará este fluxo."
              select
              fullWidth
              InputLabelProps={{ shrink: true }}
            >
              {instances?.length === 0 && (
                <MenuItem disabled value="">
                  Nenhuma instância disponível
                </MenuItem>
              )}
              {instances?.map((instance) => (
                <MenuItem key={instance.instanceName} value={instance.instanceName}>
                  {instance.displayName || instance.instanceName}
                </MenuItem>
              ))}
            </TextField>

            <Divider sx={{ borderColor: 'rgba(148,163,184,0.2)' }} />

            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Resumo
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`Nós: ${summary.nodes}`} size="small" />
                <Chip label={`Conexões: ${summary.edges}`} size="small" />
                <Chip label={`Gatilhos: ${summary.triggers}`} size="small" />
              </Stack>
            </Box>

            <Divider sx={{ borderColor: 'rgba(148,163,184,0.2)' }} />

            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: '100%' }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Nó selecionado
              </Typography>
              {!selectedNode ? (
                <Typography variant="body2" color="rgba(226,232,240,0.6)">
                  Selecione um nó no canvas para editar suas propriedades.
                </Typography>
              ) : (
                <Stack spacing={2}>
                  <TextField
                    label="Nome do nó"
                    value={selectedNode.data?.label || ''}
                    onChange={(event) => {
                      const value = event.target.value;
                      updateSelectedNode((node) => ({
                        ...node,
                        data: { ...node.data, label: value }
                      }));
                    }}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Tipo do nó"
                    value={selectedNode.data?.nodeType || 'whatsapp-message'}
                    onChange={(event) => {
                      const newType = event.target.value;
                      updateSelectedNode((node) => ({
                        ...node,
                        data: {
                          ...node.data,
                          nodeType: newType,
                          config: defaultConfigForType(newType),
                          label:
                            NODE_TYPES.find((option) => option.value === newType)?.label ||
                            newType
                        }
                      }));
                    }}
                    select
                    fullWidth
                    SelectProps={{ native: true }}
                    InputLabelProps={{ shrink: true }}
                  >
                    {NODE_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </TextField>

                  {selectedNode.data?.nodeType === 'whatsapp-message' && (
                    <Stack spacing={1.5}>
                      <TextField
                        label="Mensagem"
                        value={selectedNode.data?.config?.content?.text || ''}
                        multiline
                        rows={4}
                        inputRef={messageInputRef}
                        onChange={(event) =>
                          updateSelectedNode((node) => ({
                            ...node,
                            data: {
                              ...node.data,
                              config: {
                                ...(node.data?.config || {}),
                                content: {
                                  ...(node.data?.config?.content || {}),
                                  text: event.target.value
                                }
                              }
                            }
                          }))
                        }
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />

                      <Box>
                        <Typography variant="caption" color="rgba(226,232,240,0.7)" sx={{ mb: 0.5, display: 'block' }}>
                          Variáveis disponíveis
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {WHATSAPP_TEMPLATE_VARIABLES.map((item) => (
                            <Tooltip key={item.value} title={`${item.value} — ${item.description}`} placement="top">
                              <Chip
                                label={item.label}
                                size="small"
                                variant="outlined"
                                onClick={() => handleInsertWhatsappVariable(item.value)}
                                sx={{
                                  borderColor: 'rgba(56,189,248,0.4)',
                                  color: '#38bdf8',
                                  fontSize: '0.7rem'
                                }}
                              />
                            </Tooltip>
                          ))}
                        </Stack>
                      </Box>
                    </Stack>
                  )}

                  {selectedNode.data?.nodeType === 'delay' && (
                    <Stack spacing={2} sx={{ width: '100%' }}>
                      <TextField
                        label="Tipo de delay"
                        value={selectedNode.data?.config?.delayType || 'duration'}
                        onChange={(event) =>
                          updateSelectedNode((node) => ({
                            ...node,
                            data: {
                              ...node.data,
                              config: {
                                ...(node.data?.config || {}),
                                delayType: event.target.value
                              }
                            }
                          }))
                        }
                        select
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      >
                        <MenuItem value="duration">Duração (após X tempo)</MenuItem>
                        <MenuItem value="exactTime">Hora exata</MenuItem>
                      </TextField>

                      {selectedNode.data?.config?.delayType === 'duration' ? (
                        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                      <TextField
                        label="Duração"
                        type="number"
                        value={selectedNode.data?.config?.duration || 5}
                        onChange={(event) =>
                          updateSelectedNode((node) => ({
                            ...node,
                            data: {
                              ...node.data,
                              config: {
                                ...(node.data?.config || {}),
                                duration: Number(event.target.value)
                              }
                            }
                          }))
                        }
                        InputLabelProps={{ shrink: true }}
                            sx={{ flex: 1, minWidth: 0 }}
                      />
                      <TextField
                        label="Unidade"
                        value={selectedNode.data?.config?.unit || 'seconds'}
                        onChange={(event) =>
                          updateSelectedNode((node) => ({
                            ...node,
                            data: {
                              ...node.data,
                              config: {
                                ...(node.data?.config || {}),
                                unit: event.target.value
                              }
                            }
                          }))
                        }
                        select
                        SelectProps={{ native: true }}
                        InputLabelProps={{ shrink: true }}
                            sx={{ flex: 1, minWidth: 0 }}
                      >
                        <option value="seconds">Segundos</option>
                        <option value="minutes">Minutos</option>
                        <option value="hours">Horas</option>
                        <option value="days">Dias</option>
                      </TextField>
                        </Stack>
                      ) : (
                        <Stack spacing={2} sx={{ width: '100%' }}>
                          <TextField
                            label="Hora exata"
                            type="time"
                            value={selectedNode.data?.config?.exactTime || '22:00'}
                            onChange={(event) =>
                              updateSelectedNode((node) => ({
                                ...node,
                                data: {
                                  ...node.data,
                                  config: {
                                    ...(node.data?.config || {}),
                                    exactTime: event.target.value
                                  }
                                }
                              }))
                            }
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            helperText="Hora no formato HH:MM (24 horas)"
                          />
                          <TextField
                            label="Fuso horário"
                            value={selectedNode.data?.config?.timezone || 'America/Sao_Paulo'}
                            onChange={(event) =>
                              updateSelectedNode((node) => ({
                                ...node,
                                data: {
                                  ...node.data,
                                  config: {
                                    ...(node.data?.config || {}),
                                    timezone: event.target.value
                                  }
                                }
                              }))
                            }
                            select
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            helperText="Fuso horário para calcular a hora exata"
                          >
                            <MenuItem value="America/Sao_Paulo">Brasília (GMT-3)</MenuItem>
                            <MenuItem value="America/Manaus">Manaus (GMT-4)</MenuItem>
                            <MenuItem value="America/Rio_Branco">Rio Branco (GMT-5)</MenuItem>
                            <MenuItem value="America/Fortaleza">Fortaleza (GMT-3)</MenuItem>
                            <MenuItem value="America/Recife">Recife (GMT-3)</MenuItem>
                            <MenuItem value="America/Bahia">Bahia (GMT-3)</MenuItem>
                            <MenuItem value="America/Campo_Grande">Campo Grande (GMT-4)</MenuItem>
                            <MenuItem value="America/Cuiaba">Cuiabá (GMT-4)</MenuItem>
                            <MenuItem value="America/Belem">Belém (GMT-3)</MenuItem>
                            <MenuItem value="America/Araguaina">Araguaína (GMT-3)</MenuItem>
                            <MenuItem value="America/Maceio">Maceió (GMT-3)</MenuItem>
                            <MenuItem value="America/Santarem">Santarém (GMT-3)</MenuItem>
                            <MenuItem value="America/Porto_Velho">Porto Velho (GMT-4)</MenuItem>
                            <MenuItem value="America/Boa_Vista">Boa Vista (GMT-4)</MenuItem>
                            <MenuItem value="America/Eirunepe">Eirunepé (GMT-5)</MenuItem>
                            <MenuItem value="America/Noronha">Fernando de Noronha (GMT-2)</MenuItem>
                          </TextField>
                        </Stack>
                      )}
                    </Stack>
                  )}

                  {selectedNode.data?.nodeType === 'condition' && (
                    <Stack spacing={2}>
                      {conditionRules.length === 0 && (
                        <Typography variant="body2" color="rgba(226,232,240,0.6)">
                          Nenhuma condição configurada. Adicione uma regra para definir como o fluxo deve seguir.
                        </Typography>
                      )}

                      {conditionRules.map((rule, index) => {
                        const typeConfig = getConditionTypeConfig(rule.type);
                        const showValueInput = typeConfig.needsValue;
                        const isSelectValue = showValueInput && typeConfig.input === 'select';

                        return (
                          <Box
                            key={rule.id}
                            sx={{
                              border: '1px solid rgba(148,163,184,0.3)',
                              borderRadius: 2,
                              p: 2,
                              position: 'relative',
                              width: '100%',
                              maxWidth: '100%',
                              boxSizing: 'border-box'
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="subtitle2" fontWeight={600}>
                                Condição {index + 1}
                              </Typography>
                              <IconButton
                                size="small"
                                color="inherit"
                                onClick={() => handleConditionRuleRemove(rule.id)}
                                disabled={conditionRules.length === 1}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Stack>

                            <Stack spacing={1.5}>
                              <TextField
                                label="Quando"
                                select
                                value={rule.type || 'message_contains'}
                                onChange={(event) =>
                                  handleConditionRuleTypeChange(rule.id, event.target.value)
                                }
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                              >
                                {CONDITION_TYPE_OPTIONS.map((option) => (
                                  <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                  </MenuItem>
                                ))}
                              </TextField>

                              {showValueInput && (
                                isSelectValue ? (
                                  <TextField
                                    label="Valor"
                                    select
                                    value={rule.value || ''}
                                    onChange={(event) =>
                                      handleConditionRuleValueChange(rule.id, event.target.value)
                                    }
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                  >
                                    {(typeConfig.options || []).map((option) => (
                                      <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                ) : (
                                  <TextField
                                    label="Valor"
                                    placeholder={typeConfig.placeholder || 'Digite o valor'}
                                    value={rule.value || ''}
                                    onChange={(event) =>
                                      handleConditionRuleValueChange(rule.id, event.target.value)
                                    }
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                  />
                                )
                              )}

                              <TextField
                                label="Nome da saída (opcional)"
                                placeholder="Ex.: Respondeu sim"
                                value={rule.label || ''}
                                onChange={(event) =>
                                  handleConditionRuleLabelChange(rule.id, event.target.value)
                                }
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                helperText="Use para identificar este caminho ao analisar o fluxo."
                              />
                            </Stack>
                          </Box>
                        );
                      })}

                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={handleAddConditionRule}
                      >
                        Adicionar regra
                      </Button>

                      <Typography variant="caption" color="rgba(226,232,240,0.6)">
                        As regras analisam o texto das mensagens recebidas. Se mais de uma regra for verdadeira, o fluxo seguirá a primeira encontrada.
                      </Typography>
                    </Stack>
                  )}

                  {selectedNode.data?.nodeType === 'webhook' && (
                    <Stack spacing={1.5}>
                      <TextField
                        label="URL"
                        value={selectedNode.data?.config?.url || ''}
                        onChange={(event) =>
                          updateSelectedNode((node) => ({
                            ...node,
                            data: {
                              ...node.data,
                              config: {
                                ...(node.data?.config || {}),
                                url: event.target.value
                              }
                            }
                          }))
                        }
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                      <TextField
                        label="Payload"
                        value={
                          typeof selectedNode.data?.config?.payload === 'string'
                            ? selectedNode.data.config.payload
                            : JSON.stringify(selectedNode.data?.config?.payload || {}, null, 2)
                        }
                        multiline
                        rows={6}
                        inputRef={webhookPayloadRef}
                        onChange={(event) =>
                          updateSelectedNode((node) => ({
                            ...node,
                            data: {
                              ...node.data,
                              config: {
                                ...(node.data?.config || {}),
                                payload: event.target.value
                              }
                            }
                          }))
                        }
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                      <Box>
                        <Typography variant="caption" color="rgba(226,232,240,0.7)" sx={{ mb: 0.5, display: 'block' }}>
                          Variáveis disponíveis
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {WHATSAPP_TEMPLATE_VARIABLES.map((item) => (
                            <Tooltip key={item.value} title={`${item.value} — ${item.description}`} placement="top">
                              <Chip
                                label={item.label}
                                size="small"
                                variant="outlined"
                                onClick={() => handleInsertWebhookVariable(item.value)}
                                sx={{
                                  borderColor: 'rgba(148,163,184,0.4)',
                                  color: '#e2e8f0',
                                  fontSize: '0.7rem'
                                }}
                              />
                            </Tooltip>
                          ))}
                        </Stack>
                      </Box>
                    </Stack>
                  )}

                  {selectedNode.data?.nodeType === 'mass-dispatch' && (
                    <Stack spacing={2}>
                      <TextField
                        label="Template de Disparo"
                        value={selectedNode.data?.config?.templateId || ''}
                        onChange={(event) =>
                          updateSelectedNode((node) => {
                            const selectedTemplate = massDispatchTemplates.find(t => t._id === event.target.value);
                            return {
                              ...node,
                              data: {
                                ...node.data,
                                config: {
                                  ...(node.data?.config || {}),
                                  templateId: event.target.value,
                                  template: selectedTemplate ? {
                                    type: selectedTemplate.type,
                                    content: selectedTemplate.content,
                                    sequence: selectedTemplate.sequence
                                  } : node.data?.config?.template
                                }
                              }
                            };
                          })
                        }
                        select
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        helperText="Selecione um template criado na página de Disparo em Massa"
                      >
                        <MenuItem value="">
                          <em>Nenhum template selecionado</em>
                        </MenuItem>
                        {massDispatchTemplates.map((template) => (
                          <MenuItem key={template._id} value={template._id}>
                            {template.name}
                          </MenuItem>
                        ))}
                      </TextField>

                      <Divider sx={{ borderColor: 'rgba(148,163,184,0.2)' }} />

                      <Typography variant="subtitle2" fontWeight={600} mb={1}>
                        Números para Disparo
                      </Typography>

                      <TextField
                        label="Colar números (um por linha)"
                        multiline
                        rows={6}
                        value={selectedNode.data?.config?.numbers || ''}
                        onChange={(event) =>
                          updateSelectedNode((node) => ({
                            ...node,
                            data: {
                              ...node.data,
                              config: {
                                ...(node.data?.config || {}),
                                numbers: event.target.value
                              }
                            }
                          }))
                        }
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        helperText="Formato: número ou nome;número (ex: 556293557070 ou João;556293557070)"
                        placeholder="556293557070
556298448536
Maria;556291279592"
                      />

                      <Box>
                        <input
                          accept=".csv,.txt"
                          style={{ display: 'none' }}
                          id="mass-dispatch-file-upload"
                          type="file"
                          onChange={(event) => {
                            const file = event.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                const content = e.target.result;
                                updateSelectedNode((node) => ({
                                  ...node,
                                  data: {
                                    ...node.data,
                                    config: {
                                      ...(node.data?.config || {}),
                                      uploadedFile: {
                                        name: file.name,
                                        content: content,
                                        type: file.type
                                      }
                                    }
                                  }
                                }));
                              };
                              reader.readAsText(file);
                            }
                          }}
                        />
                        <label htmlFor="mass-dispatch-file-upload">
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={<CloudUploadIcon />}
                            fullWidth
                            sx={{ mt: 1 }}
                          >
                            Upload de Arquivo CSV/TXT
                          </Button>
                        </label>
                        {selectedNode.data?.config?.uploadedFile && (
                          <Chip
                            label={`Arquivo: ${selectedNode.data.config.uploadedFile.name}`}
                            onDelete={() =>
                              updateSelectedNode((node) => ({
                                ...node,
                                data: {
                                  ...node.data,
                                  config: {
                                    ...(node.data?.config || {}),
                                    uploadedFile: null
                                  }
                                }
                              }))
                            }
                            sx={{ mt: 1 }}
                            color="primary"
                            size="small"
                          />
                        )}
                      </Box>

                      <Divider sx={{ borderColor: 'rgba(148,163,184,0.2)', my: 2 }} />

                      <Typography variant="subtitle2" fontWeight={600} mb={1}>
                        Configurações
                      </Typography>

                      <TextField
                        label="Velocidade de Envio"
                        value={selectedNode.data?.config?.settings?.speed || 'normal'}
                        onChange={(event) =>
                          updateSelectedNode((node) => ({
                            ...node,
                            data: {
                              ...node.data,
                              config: {
                                ...(node.data?.config || {}),
                                settings: {
                                  ...(node.data?.config?.settings || {}),
                                  speed: event.target.value
                                }
                              }
                            }
                          }))
                        }
                        select
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        helperText="Velocidade de envio das mensagens"
                      >
                        <MenuItem value="fast">Rápido (2 segundos) - Ideal para listas pequenas</MenuItem>
                        <MenuItem value="normal">Normal (30 segundos) - Recomendado para a maioria dos casos</MenuItem>
                        <MenuItem value="slow">Lento (1 minuto) - Mais seguro, menor chance de bloqueio</MenuItem>
                        <MenuItem value="random">Randomizado (45-85s) - Intervalos aleatórios para evitar detecção</MenuItem>
                      </TextField>

                      <Divider sx={{ borderColor: 'rgba(148,163,184,0.2)', my: 2 }} />

                      <Typography variant="subtitle2" fontWeight={600} mb={1}>
                        Exclusão Automática
                      </Typography>

                      <FormControlLabel
                        control={
                          <Switch
                            checked={selectedNode.data?.config?.settings?.autoDelete?.enabled || false}
                            onChange={(event) =>
                              updateSelectedNode((node) => ({
                                ...node,
                                data: {
                                  ...node.data,
                                  config: {
                                    ...(node.data?.config || {}),
                                    settings: {
                                      ...(node.data?.config?.settings || {}),
                                      autoDelete: {
                                        ...(node.data?.config?.settings?.autoDelete || {}),
                                        enabled: event.target.checked,
                                        delaySeconds: node.data?.config?.settings?.autoDelete?.delaySeconds || 3600
                                      }
                                    }
                                  }
                                }
                              }))
                            }
                          />
                        }
                        label="Apagar mensagens enviadas automaticamente após X tempo"
                        sx={{ color: 'rgba(226,232,240,0.9)' }}
                      />

                      {selectedNode.data?.config?.settings?.autoDelete?.enabled && (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mt: 1 }}>
                          <TextField
                            label="Tempo para exclusão"
                            type="number"
                            value={(() => {
                              const delaySeconds = selectedNode.data?.config?.settings?.autoDelete?.delaySeconds || 3600;
                              const unit = selectedNode.data?.config?.settings?.autoDelete?.unit || 'hours';
                              if (unit === 'hours') return delaySeconds / 3600;
                              if (unit === 'minutes') return delaySeconds / 60;
                              return delaySeconds;
                            })()}
                            onChange={(event) => {
                              const value = parseFloat(event.target.value) || 0;
                              const unit = selectedNode.data?.config?.settings?.autoDelete?.unit || 'hours';
                              let delaySeconds;
                              if (unit === 'hours') delaySeconds = value * 3600;
                              else if (unit === 'minutes') delaySeconds = value * 60;
                              else delaySeconds = value;
                              updateSelectedNode((node) => ({
                                ...node,
                                data: {
                                  ...node.data,
                                  config: {
                                    ...(node.data?.config || {}),
                                    settings: {
                                      ...(node.data?.config?.settings || {}),
                                      autoDelete: {
                                        ...(node.data?.config?.settings?.autoDelete || {}),
                                        delaySeconds: delaySeconds
                                      }
                                    }
                                  }
                                }
                              }));
                            }}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            helperText={(() => {
                              const unit = selectedNode.data?.config?.settings?.autoDelete?.unit || 'hours';
                              if (unit === 'hours') return 'Exemplo: 1 = 1 hora, 2 = 2 horas, 24 = 24 horas';
                              if (unit === 'minutes') return 'Exemplo: 5 = 5 minutos, 30 = 30 minutos, 60 = 1 hora';
                              return 'Exemplo: 60 = 1 minuto, 3600 = 1 hora';
                            })()}
                            inputProps={{ 
                              min: 0.1, 
                              step: selectedNode.data?.config?.settings?.autoDelete?.unit === 'hours' ? 0.5 :
                                    selectedNode.data?.config?.settings?.autoDelete?.unit === 'minutes' ? 1 : 1
                            }}
                            sx={{ flex: 1 }}
                          />
                          <FormControl sx={{ minWidth: 120 }}>
                            <Select
                              value={selectedNode.data?.config?.settings?.autoDelete?.unit || 'hours'}
                              onChange={(event) => {
                                const unit = event.target.value;
                                const currentValue = (() => {
                                  const delaySeconds = selectedNode.data?.config?.settings?.autoDelete?.delaySeconds || 3600;
                                  const currentUnit = selectedNode.data?.config?.settings?.autoDelete?.unit || 'hours';
                                  if (currentUnit === 'hours') return delaySeconds / 3600;
                                  if (currentUnit === 'minutes') return delaySeconds / 60;
                                  return delaySeconds;
                                })();
                                let delaySeconds;
                                if (unit === 'hours') delaySeconds = currentValue * 3600;
                                else if (unit === 'minutes') delaySeconds = currentValue * 60;
                                else delaySeconds = currentValue;
                                updateSelectedNode((node) => ({
                                  ...node,
                                  data: {
                                    ...node.data,
                                    config: {
                                      ...(node.data?.config || {}),
                                      settings: {
                                        ...(node.data?.config?.settings || {}),
                                        autoDelete: {
                                          ...(node.data?.config?.settings?.autoDelete || {}),
                                          unit: unit,
                                          delaySeconds: delaySeconds
                                        }
                                      }
                                    }
                                  }
                                }));
                              }}
                            >
                              <MenuItem value="hours">Horas</MenuItem>
                              <MenuItem value="minutes">Minutos</MenuItem>
                              <MenuItem value="seconds">Segundos</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                      )}

                      <Divider sx={{ borderColor: 'rgba(148,163,184,0.2)', my: 2 }} />

                      <Typography variant="subtitle2" fontWeight={600} mb={1}>
                        Agendamento e Início
                      </Typography>

                      <FormControlLabel
                        control={
                          <Switch
                            checked={selectedNode.data?.config?.scheduleEnabled || false}
                            onChange={(event) =>
                              updateSelectedNode((node) => ({
                                ...node,
                                data: {
                                  ...node.data,
                                  config: {
                                    ...(node.data?.config || {}),
                                    scheduleEnabled: event.target.checked
                                  }
                                }
                              }))
                            }
                          />
                        }
                        label="Agendar início automático"
                        sx={{ color: 'rgba(226,232,240,0.9)' }}
                      />

                      {selectedNode.data?.config?.scheduleEnabled && (
                        <Stack spacing={2} sx={{ mt: 1 }}>
                          <TextField
                            label="Data de início"
                            type="date"
                            value={selectedNode.data?.config?.scheduleDate || ''}
                            onChange={(event) =>
                              updateSelectedNode((node) => ({
                                ...node,
                                data: {
                                  ...node.data,
                                  config: {
                                    ...(node.data?.config || {}),
                                    scheduleDate: event.target.value
                                  }
                                }
                              }))
                            }
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            InputProps={{
                              inputProps: {
                                min: new Date().toISOString().split('T')[0]
                              }
                            }}
                          />
                          <TextField
                            label="Hora de início"
                            type="time"
                            value={selectedNode.data?.config?.scheduleTime || ''}
                            onChange={(event) =>
                              updateSelectedNode((node) => ({
                                ...node,
                                data: {
                                  ...node.data,
                                  config: {
                                    ...(node.data?.config || {}),
                                    scheduleTime: event.target.value
                                  }
                                }
                              }))
                            }
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                          />
                          <TextField
                            label="Fuso horário"
                            value={selectedNode.data?.config?.scheduleTimezone || 'America/Sao_Paulo'}
                            onChange={(event) =>
                              updateSelectedNode((node) => ({
                                ...node,
                                data: {
                                  ...node.data,
                                  config: {
                                    ...(node.data?.config || {}),
                                    scheduleTimezone: event.target.value
                                  }
                                }
                              }))
                            }
                            select
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                          >
                            <MenuItem value="America/Sao_Paulo">Brasília (GMT-3)</MenuItem>
                            <MenuItem value="America/Manaus">Manaus (GMT-4)</MenuItem>
                            <MenuItem value="America/Rio_Branco">Rio Branco (GMT-5)</MenuItem>
                            <MenuItem value="America/Fortaleza">Fortaleza (GMT-3)</MenuItem>
                            <MenuItem value="America/Recife">Recife (GMT-3)</MenuItem>
                            <MenuItem value="America/Bahia">Bahia (GMT-3)</MenuItem>
                            <MenuItem value="America/Campo_Grande">Campo Grande (GMT-4)</MenuItem>
                            <MenuItem value="America/Cuiaba">Cuiabá (GMT-4)</MenuItem>
                            <MenuItem value="America/Belem">Belém (GMT-3)</MenuItem>
                            <MenuItem value="America/Araguaina">Araguaína (GMT-3)</MenuItem>
                            <MenuItem value="America/Maceio">Maceió (GMT-3)</MenuItem>
                            <MenuItem value="America/Santarem">Santarém (GMT-3)</MenuItem>
                            <MenuItem value="America/Porto_Velho">Porto Velho (GMT-4)</MenuItem>
                            <MenuItem value="America/Boa_Vista">Boa Vista (GMT-4)</MenuItem>
                            <MenuItem value="America/Eirunepe">Eirunepé (GMT-5)</MenuItem>
                            <MenuItem value="America/Noronha">Fernando de Noronha (GMT-2)</MenuItem>
                          </TextField>
                        </Stack>
                      )}

                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<PlayArrowIcon />}
                          fullWidth
                          onClick={async () => {
                            try {
                              const config = selectedNode.data?.config || {};
                              
                              // Validar se tem template
                              if (!config.templateId && !config.template) {
                                toast.error('Selecione um template ou configure a mensagem');
                                return;
                              }

                              // Validar se tem números
                              if (!config.numbers && !config.uploadedFile) {
                                toast.error('Adicione números para disparo (cole ou faça upload de arquivo)');
                                return;
                              }

                              // Validar agendamento se ativado
                              if (config.scheduleEnabled && (!config.scheduleDate || !config.scheduleTime)) {
                                toast.error('Preencha data e hora para agendamento');
                                return;
                              }

                              toast.loading('Criando disparo...', { id: 'mass-dispatch-create' });

                              // 1. Criar o disparo
                              const dispatchData = {
                                name: selectedNode.data?.label || `Disparo ${Date.now()}`,
                                instanceName: instanceName,
                                templateId: config.templateId || null,
                                template: config.template || {},
                                settings: {
                                  speed: config.settings?.speed || 'normal',
                                  validateNumbers: config.settings?.validateNumbers !== undefined ? config.settings.validateNumbers : true,
                                  removeNinthDigit: config.settings?.removeNinthDigit !== undefined ? config.settings.removeNinthDigit : true,
                                  personalization: config.settings?.personalization || {
                                    enabled: true,
                                    defaultName: 'Cliente'
                                  },
                                  autoDelete: {
                                    enabled: config.settings?.autoDelete?.enabled || false,
                                    delaySeconds: config.settings?.autoDelete?.delaySeconds || 3600
                                  },
                                  schedule: config.scheduleEnabled ? {
                                    enabled: true,
                                    startDateTime: config.scheduleDate && config.scheduleTime ? 
                                      new Date(`${config.scheduleDate}T${config.scheduleTime}`).toISOString() : null,
                                    timezone: config.scheduleTimezone || 'America/Sao_Paulo'
                                  } : { enabled: false }
                                }
                              };

                              const createResponse = await api.post('/api/mass-dispatch', dispatchData);
                              const dispatchId = createResponse.data.data._id;

                              // 2. Upload dos números
                              const uploadData = new FormData();
                              
                              if (config.uploadedFile) {
                                // Criar um blob do arquivo
                                const blob = new Blob([config.uploadedFile.content], { type: config.uploadedFile.type });
                                const file = new File([blob], config.uploadedFile.name, { type: config.uploadedFile.type });
                                uploadData.append('file', file);
                              }
                              
                              if (config.numbers && config.numbers.trim()) {
                                uploadData.append('numbers', config.numbers.trim());
                              }

                              await api.post(`/api/mass-dispatch/${dispatchId}/upload-numbers`, uploadData, {
                                headers: {
                                  'Content-Type': 'multipart/form-data'
                                }
                              });

                              // 3. Iniciar disparo se não estiver agendado
                              if (!config.scheduleEnabled) {
                                await api.post(`/api/mass-dispatch/${dispatchId}/start`);
                                toast.success('Disparo criado e iniciado com sucesso!', { id: 'mass-dispatch-create' });
                              } else {
                                toast.success('Disparo criado e agendado com sucesso!', { id: 'mass-dispatch-create' });
                              }

                            } catch (error) {
                              console.error('Erro ao criar/iniciar disparo:', error);
                              toast.error(error.response?.data?.error || 'Erro ao criar/iniciar disparo', { id: 'mass-dispatch-create' });
                            }
                          }}
                          sx={{ mt: 2 }}
                        >
                          {selectedNode.data?.config?.scheduleEnabled ? 'Criar e Agendar Disparo' : 'Criar e Iniciar Disparo'}
                        </Button>
                      </Box>
                    </Stack>
                  )}
                </Stack>
              )}
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Templates disponíveis
              </Typography>
              <Stack spacing={1} maxHeight="160px" sx={{ overflowY: 'auto' }}>
                {templates?.length === 0 ? (
                  <Typography variant="body2" color="rgba(226,232,240,0.6)">
                    Nenhum template disponível.
                  </Typography>
                ) : (
                  templates.map((template) => (
                    <Button
                      key={template._id}
                      variant="outlined"
                      color="inherit"
                      size="small"
                      onClick={() => applyTemplate(template)}
                    >
                      {template.name}
                    </Button>
                  ))
                )}
              </Stack>
            </Box>

            <Stack direction="row" spacing={1} mt={1} sx={{ width: '100%', flexWrap: 'wrap', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                onClick={handleClosePropertyPanel}
                sx={{ flex: 1, minWidth: 0 }}
                >
                Fechar
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CopyAllIcon fontSize="small" />}
                  onClick={duplicateTemplate}
                sx={{ flex: 1, minWidth: 0 }}
                >
                  Template
                </Button>
                <Button
                variant="contained"
                  size="small"
                startIcon={<SaveIcon fontSize="small" />}
                onClick={saveFlow}
                disabled={saving}
                sx={{ flex: 1, minWidth: 0 }}
                >
                Salvar
                </Button>
            </Stack>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
};

const MindClerkyBuilder = (props) => (
  <ReactFlowProvider>
    <MindClerkyBuilderInner {...props} />
  </ReactFlowProvider>
);

export default MindClerkyBuilder;

