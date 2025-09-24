import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Person,
  Email,
  Schedule,
  AdminPanelSettings,
  Refresh
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AdminPanel = () => {
  const [tabValue, setTabValue] = useState(0);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    user: null,
    action: null
  });

  const { getPendingUsers, getAllUsers, approveUser, isAdmin } = useAuth();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [pending, all] = await Promise.all([
        getPendingUsers(),
        getAllUsers()
      ]);
      setPendingUsers(pending);
      setAllUsers(all);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [getPendingUsers, getAllUsers]);

  useEffect(() => {
    if (isAdmin()) {
      loadData();
    }
  }, [isAdmin, loadData]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleApproveReject = (user, action) => {
    setConfirmDialog({
      open: true,
      user,
      action
    });
  };

  const confirmAction = async () => {
    const { user, action } = confirmDialog;
    
    try {
      setActionLoading(user._id);
      await approveUser(user._id, action);
      await loadData(); // Recarregar dados
    } catch (error) {
      console.error('Erro na ação:', error);
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, user: null, action: null });
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { label: 'Pendente', color: 'warning', icon: <Schedule /> },
      approved: { label: 'Aprovado', color: 'success', icon: <CheckCircle /> },
      rejected: { label: 'Rejeitado', color: 'error', icon: <Cancel /> },
      suspended: { label: 'Suspenso', color: 'default', icon: <Cancel /> }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Chip
        label={config.label}
        color={config.color}
        icon={config.icon}
        size="small"
        variant="outlined"
      />
    );
  };

  const getRoleChip = (role) => {
    const roleConfig = {
      admin: { label: 'Admin', color: 'primary', icon: <AdminPanelSettings /> },
      user: { label: 'Usuário', color: 'default', icon: <Person /> }
    };

    const config = roleConfig[role] || roleConfig.user;

    return (
      <Chip
        label={config.label}
        color={config.color}
        icon={config.icon}
        size="small"
      />
    );
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  if (!isAdmin()) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Acesso negado. Apenas administradores podem acessar esta página.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Painel Administrativo
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadData}
            disabled={loading}
          >
            Atualizar
          </Button>
        </Box>

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab 
            label={`Pendentes (${pendingUsers.length})`} 
            icon={<Schedule />}
            iconPosition="start"
          />
          <Tab 
            label={`Todos Usuários (${allUsers.length})`} 
            icon={<Person />}
            iconPosition="start"
          />
        </Tabs>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Tab Usuários Pendentes */}
            {tabValue === 0 && (
              <Box>
                {pendingUsers.length === 0 ? (
                  <Alert severity="info">
                    Não há usuários aguardando aprovação.
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Usuário</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Data Registro</TableCell>
                          <TableCell align="center">Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pendingUsers.map((user) => (
                          <TableRow key={user._id}>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={2}>
                                <Avatar>
                                  {user.name.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                  <Typography variant="body1" fontWeight="medium">
                                    {user.name}
                                  </Typography>
                                  {getStatusChip(user.status)}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Email fontSize="small" color="action" />
                                {user.email}
                              </Box>
                            </TableCell>
                            <TableCell>
                              {formatDate(user.createdAt)}
                            </TableCell>
                            <TableCell align="center">
                              <Box display="flex" gap={1} justifyContent="center">
                                <Tooltip title="Aprovar usuário">
                                  <IconButton
                                    color="success"
                                    onClick={() => handleApproveReject(user, 'approve')}
                                    disabled={actionLoading === user._id}
                                  >
                                    {actionLoading === user._id ? (
                                      <CircularProgress size={20} />
                                    ) : (
                                      <CheckCircle />
                                    )}
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Rejeitar usuário">
                                  <IconButton
                                    color="error"
                                    onClick={() => handleApproveReject(user, 'reject')}
                                    disabled={actionLoading === user._id}
                                  >
                                    <Cancel />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}

            {/* Tab Todos Usuários */}
            {tabValue === 1 && (
              <Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Usuário</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Função</TableCell>
                        <TableCell>Registro</TableCell>
                        <TableCell>Último Login</TableCell>
                        <TableCell>Aprovado Por</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allUsers.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar>
                                {user.name.charAt(0).toUpperCase()}
                              </Avatar>
                              <Typography variant="body1" fontWeight="medium">
                                {user.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Email fontSize="small" color="action" />
                              {user.email}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {getStatusChip(user.status)}
                          </TableCell>
                          <TableCell>
                            {getRoleChip(user.role)}
                          </TableCell>
                          <TableCell>
                            {formatDate(user.createdAt)}
                          </TableCell>
                          <TableCell>
                            {formatDate(user.lastLogin)}
                          </TableCell>
                          <TableCell>
                            {user.approvedBy ? (
                              <Typography variant="body2">
                                {user.approvedBy.name}
                                <br />
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(user.approvedAt)}
                                </Typography>
                              </Typography>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* Dialog de Confirmação */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, user: null, action: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirmar {confirmDialog.action === 'approve' ? 'Aprovação' : 'Rejeição'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja{' '}
            <strong>
              {confirmDialog.action === 'approve' ? 'aprovar' : 'rejeitar'}
            </strong>{' '}
            o usuário <strong>{confirmDialog.user?.name}</strong> ({confirmDialog.user?.email})?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialog({ open: false, user: null, action: null })}
            disabled={Boolean(actionLoading)}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmAction}
            color={confirmDialog.action === 'approve' ? 'success' : 'error'}
            variant="contained"
            disabled={Boolean(actionLoading)}
          >
            {confirmDialog.action === 'approve' ? 'Aprovar' : 'Rejeitar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel;
