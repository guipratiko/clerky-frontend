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
  Typography
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
const CONDITION_NODE_BASE_STYLE = {
  padding: 0,
  background: 'transparent',
  border: 'none',
  boxShadow: 'none'
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
  }
];

const defaultConfigForType = (type) => {
  switch (type) {
    case 'whatsapp-message':
      return {
        templateType: 'text',
        content: {
          text: 'Olá {{contact.name || "Cliente"}}, tudo bem?'
        }
      };
    case 'delay':
      return { duration: 5, unit: 'seconds' };
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
        template: {
          type: 'text',
          content: { text: 'Mensagem em massa para {{contact.name || "Cliente"}}' }
        },
        settings: {
          speed: 'normal',
          personalization: {
            enabled: true,
            defaultName: 'Cliente'
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

const flowNodeToReactFlowNode = (node) => ({
  id: node.id,
  position: node.position || { x: 200, y: 200 },
  type: node.type === 'condition' ? CONDITION_NODE_TYPE : 'default',
  data: {
    label:
      node.name ||
      NODE_TYPES.find((option) => option.value === node.type)?.label ||
      node.type,
    nodeType: node.type,
    config: node.data || {}
  },
  style: node.type === 'condition' ? CONDITION_NODE_BASE_STYLE : undefined
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

const customNodeTypes = {
  [CONDITION_NODE_TYPE]: ConditionNodeComponent
};

const MindClerkyBuilderInner = ({ flow, onClose, onRefresh, templates }) => {
  const { instances } = useInstance();
  const [localFlow, setLocalFlow] = useState(flow);
  const [instanceName, setInstanceName] = useState(flow.instanceName || '');
  const [saving, setSaving] = useState(false);
  const [nodes, setNodes] = useState((flow.nodes || []).map((node) => ({
    ...flowNodeToReactFlowNode(node),
    selected: false
  })));
  const [edges, setEdges] = useState((flow.edges || []).map(flowEdgeToReactFlowEdge));
  const [selectedNodeId, setSelectedNodeId] = useState(null);
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

  const activateFlow = async () => {
    if (!localFlow) return;
    try {
      setSaving(true);
      const response = await api.post(`/api/mind-clerky/flows/${localFlow._id}/status`, {
        status: 'active'
      });
      toast.success('Fluxo ativado!');
      setLocalFlow(response.data.data);
      onRefresh?.();
    } catch (error) {
      console.error('Erro ao ativar fluxo MindClerky:', error);
      toast.error(error.response?.data?.error || 'Erro ao ativar fluxo');
    } finally {
      setSaving(false);
    }
  };

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
      type: type === 'condition' ? CONDITION_NODE_TYPE : 'default',
      data: {
        label: NODE_TYPES.find((option) => option.value === type)?.label || type,
        nodeType: type,
        config: defaultConfigForType(type)
      },
      style: type === 'condition' ? CONDITION_NODE_BASE_STYLE : undefined
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
            nodeTypes={customNodeTypes}
            fitView
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
            bgcolor: '#1e293b',
            color: '#f8fafc',
            borderLeft: '1px solid rgba(148,163,184,0.2)'
          }
        }}
      >
        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
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

          <Stack spacing={2} sx={{ overflowY: 'auto', flexGrow: 1 }}>
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
              <Stack direction="row" spacing={1}>
                <Chip label={`Nós: ${summary.nodes}`} size="small" />
                <Chip label={`Conexões: ${summary.edges}`} size="small" />
                <Chip label={`Gatilhos: ${summary.triggers}`} size="small" />
              </Stack>
            </Box>

            <Divider sx={{ borderColor: 'rgba(148,163,184,0.2)' }} />

            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                    <Stack direction="row" spacing={2}>
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
                      >
                        <option value="seconds">Segundos</option>
                        <option value="minutes">Minutos</option>
                        <option value="hours">Horas</option>
                        <option value="days">Dias</option>
                      </TextField>
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
                              position: 'relative'
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

            <Stack spacing={1} mt={1}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="text"
                  color="inherit"
                  onClick={handleCloseBuilder}
                  sx={{ minWidth: 120 }}
                >
                  Fechar
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<SaveIcon fontSize="small" />}
                  onClick={saveFlow}
                  disabled={saving}
                  sx={{ minWidth: 140 }}
                >
                  Salvar
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PlayArrowIcon fontSize="small" />}
                  onClick={activateFlow}
                  disabled={saving}
                  sx={{ minWidth: 140 }}
                >
                  Ativar
                </Button>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CopyAllIcon fontSize="small" />}
                  onClick={duplicateTemplate}
                  sx={{ flex: 1, minWidth: 140 }}
                >
                  Template
                </Button>
                <Button
                  variant="text"
                  size="small"
                  color="inherit"
                  onClick={handleCloseBuilder}
                  sx={{ flex: 1, minWidth: 140 }}
                >
                  Voltar
                </Button>
              </Stack>
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

