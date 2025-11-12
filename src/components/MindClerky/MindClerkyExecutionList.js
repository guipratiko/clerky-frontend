import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';
import toast from 'react-hot-toast';
import api from '../../services/api';

const statusColors = {
  running: 'info',
  waiting: 'warning',
  error: 'error',
  completed: 'success',
  cancelled: 'default'
};

const MindClerkyExecutionList = ({ flow, compact = false, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [executions, setExecutions] = useState([]);

  const fetchExecutions = useCallback(async () => {
    try {
      setLoading(true);
      const params = flow ? { flowId: flow._id } : { limit: 10 };
      const response = await api.get('/api/mind-clerky/executions', { params });
      setExecutions(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar execuções MindClerky:', error);
      toast.error(error.response?.data?.error || 'Erro ao carregar execuções MindClerky');
    } finally {
      setLoading(false);
    }
  }, [flow]);

  useEffect(() => {
    fetchExecutions();
  }, [fetchExecutions]);

  const title = useMemo(() => {
    if (compact) return null;
    if (flow) {
      return `Execuções do fluxo ${flow.name}`;
    }
    return 'Execuções recentes';
  }, [flow, compact]);

  if (compact) {
    if (loading) {
      return (
        <Stack alignItems="center" py={2}>
          <CircularProgress size={20} />
        </Stack>
      );
    }

    return (
      <Stack spacing={1}>
        {executions.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Nenhuma execução registrada.
          </Typography>
        ) : (
          executions.slice(0, 5).map((execution) => (
            <Stack
              key={execution._id}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack spacing={0.5}>
                <Typography variant="body2" fontWeight={600}>
                  {execution.contactId}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(execution.createdAt).toLocaleString('pt-BR')}
                </Typography>
              </Stack>
              <Chip size="small" label={execution.status} color={statusColors[execution.status] || 'default'} />
            </Stack>
          ))
        )}
      </Stack>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h5" fontWeight={700}>
            {title}
          </Typography>
          <Chip label={`${executions.length} execuções`} />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchExecutions}
          >
            Atualizar
          </Button>
          {onClose && (
            <Button
              variant="text"
              startIcon={<CloseIcon />}
              onClick={onClose}
            >
              Fechar
            </Button>
          )}
        </Stack>
      </Stack>

      {loading ? (
        <Stack alignItems="center" py={4}>
          <CircularProgress />
        </Stack>
      ) : executions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }} variant="outlined">
          <Typography variant="body1" color="text.secondary">
            Nenhuma execução encontrada para este fluxo.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Contato</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Início</TableCell>
                <TableCell>Última atualização</TableCell>
                <TableCell>Próximo nó</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {executions.map((execution) => (
                <TableRow key={execution._id}>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" fontWeight={600}>
                        {execution.contactId}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Trigger: {execution.triggerType || 'event'}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={execution.status}
                      color={statusColors[execution.status] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(execution.createdAt).toLocaleString('pt-BR')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(execution.updatedAt).toLocaleString('pt-BR')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {execution.currentNodeId || '--'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Ver detalhes (em breve)">
                      <IconButton size="small">
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default MindClerkyExecutionList;

