import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Avatar
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  CalendarToday as CalendarIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { user, getTrialDaysRemaining, refreshUser } = useAuth();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Estados de erro
  const [errors, setErrors] = useState({});

  // Formatar telefone para exibição
  const formatPhone = (phone) => {
    if (!phone) return '';
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 11) {
      return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone; // Retorna como está se não for 10 ou 11 dígitos
  };

  // Formatar CPF para exibição
  const formatCPF = (cpf) => {
    if (!cpf) return 'Não informado';
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length === 11) {
      return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cpf; // Retorna como está se não for 11 dígitos
  };

  // Calcular dias restantes do plano
  const getPlanDaysRemaining = () => {
    if (!user?.planExpiresAt) return null;
    
    const now = new Date();
    const expiresAt = new Date(user.planExpiresAt);
    
    if (expiresAt < now) return 0;
    
    const diffTime = expiresAt - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Formatar data de vencimento
  const formatExpirationDate = () => {
    if (!user?.planExpiresAt) return 'Não definido';
    
    const date = new Date(user.planExpiresAt);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Carregar dados do usuário
  useEffect(() => {
    if (user) {
      console.log('👤 Dados do usuário carregados:', {
        phone: user.phone,
        cpf: user.cpf,
        plan: user.plan,
        planExpiresAt: user.planExpiresAt
      });
      
      setFormData(prev => ({
        ...prev,
        phone: formatPhone(user.phone) || '' // Formatar telefone ao carregar
      }));
    }
  }, [user]);

  // Validar formulário
  const validateForm = () => {
    const newErrors = {};

    // Validar telefone (opcional, mas se preenchido deve estar correto)
    if (formData.phone && formData.phone.trim()) {
      const phoneClean = formData.phone.replace(/\D/g, '');
      // Aceitar telefone brasileiro: 10 dígitos (fixo) ou 11 dígitos (celular)
      if (phoneClean.length < 10 || phoneClean.length > 11) {
        newErrors.phone = 'Telefone deve ter 10 ou 11 dígitos (DDD + número)';
      }
    }

    // Validar senha se estiver sendo alterada
    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Senha deve ter pelo menos 6 caracteres';
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'As senhas não coincidem';
      }

      // Se usuário já tem senha, validar senha atual
      if (user?.isPasswordSet && !formData.currentPassword) {
        newErrors.currentPassword = 'Senha atual é obrigatória';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Atualizar perfil
  const handleUpdateProfile = async () => {
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    setUpdating(true);
    try {
      const updateData = {};
      
      // Adicionar telefone se foi alterado (enviar apenas números para o backend)
      const currentPhoneFormatted = formatPhone(user?.phone);
      if (formData.phone !== currentPhoneFormatted) {
        // Enviar apenas números, o backend vai normalizar
        const phoneClean = formData.phone ? formData.phone.replace(/\D/g, '') : '';
        updateData.phone = phoneClean || '';
      }

      // Adicionar senha se foi preenchida
      if (formData.newPassword) {
        updateData.newPassword = formData.newPassword;
        if (user?.isPasswordSet) {
          updateData.currentPassword = formData.currentPassword;
        }
      }

      // Só atualizar se houver algo para atualizar
      if (Object.keys(updateData).length === 0) {
        toast.info('Nenhuma alteração foi feita');
        setUpdating(false);
        return;
      }

      const response = await api.put('/api/auth/profile', updateData);

      toast.success(response.data.message || 'Perfil atualizado com sucesso!');

      // Se a senha foi alterada, fazer logout para forçar novo login
      if (updateData.newPassword) {
        toast.success('Senha alterada! Por favor, faça login novamente.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        // Atualizar dados do usuário no contexto (recarregar dados)
        await refreshUser();
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }

    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao atualizar perfil';
      toast.error(errorMessage);
      
      // Preencher erros específicos
      if (error.response?.status === 401) {
        setErrors(prev => ({ ...prev, currentPassword: errorMessage }));
      }
    } finally {
      setUpdating(false);
    }
  };

  const planDaysRemaining = getPlanDaysRemaining();
  const isPlanExpired = planDaysRemaining !== null && planDaysRemaining === 0;
  const isPlanActive = planDaysRemaining !== null && planDaysRemaining > 0;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 4, color: '#e9edef', fontWeight: 'bold' }}>
        👤 Meu Perfil
      </Typography>

      <Grid container spacing={3}>
        {/* Informações do Usuário */}
        <Grid item xs={12} md={8}>
          <Card sx={{ background: '#202c33', border: '1px solid #313d43' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar 
                  sx={{ 
                    width: 64, 
                    height: 64,
                    background: 'linear-gradient(135deg, #00a884 0%, #128c7e 100%)',
                    fontSize: '2rem'
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ color: '#e9edef', fontWeight: 600 }}>
                    {user?.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#8696a0' }}>
                    {user?.email}
                  </Typography>
                  <Chip
                    label={user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                    size="small"
                    sx={{
                      mt: 1,
                      background: user?.role === 'admin' 
                        ? 'rgba(0, 168, 132, 0.2)' 
                        : 'rgba(102, 126, 234, 0.2)',
                      color: user?.role === 'admin' ? '#00a884' : '#667eea',
                      border: `1px solid ${user?.role === 'admin' ? '#00a884' : '#667eea'}`,
                      fontSize: '0.7rem'
                    }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 3, borderColor: '#313d43' }} />

              {/* Telefone */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <PhoneIcon sx={{ color: '#00a884' }} />
                  <Typography variant="h6" sx={{ color: '#e9edef' }}>
                    Telefone
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(00) 00000-0000"
                  error={!!errors.phone}
                  helperText={errors.phone || 'Opcional - Telefone para contato'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#e9edef',
                      '& fieldset': { borderColor: '#313d43' },
                      '&:hover fieldset': { borderColor: '#00a884' },
                      '&.Mui-focused fieldset': { borderColor: '#00a884' },
                    },
                    '& .MuiInputLabel-root': { color: '#8696a0' },
                    '& .MuiFormHelperText-root': { color: '#8696a0' }
                  }}
                />
              </Box>

              <Divider sx={{ my: 3, borderColor: '#313d43' }} />

              {/* Alterar Senha */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <LockIcon sx={{ color: '#00a884' }} />
                  <Typography variant="h6" sx={{ color: '#e9edef' }}>
                    Alterar Senha
                  </Typography>
                </Box>

                {user?.isPasswordSet && (
                  <TextField
                    fullWidth
                    type="password"
                    label="Senha Atual"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    error={!!errors.currentPassword}
                    helperText={errors.currentPassword}
                    margin="normal"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#e9edef',
                        '& fieldset': { borderColor: '#313d43' },
                        '&:hover fieldset': { borderColor: '#00a884' },
                        '&.Mui-focused fieldset': { borderColor: '#00a884' },
                      },
                      '& .MuiInputLabel-root': { color: '#8696a0' },
                      '& .MuiFormHelperText-root': { color: '#8696a0' }
                    }}
                  />
                )}

                <TextField
                  fullWidth
                  type="password"
                  label="Nova Senha"
                  value={formData.newPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                  error={!!errors.newPassword}
                  helperText={errors.newPassword || 'Deixe em branco se não quiser alterar'}
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#e9edef',
                      '& fieldset': { borderColor: '#313d43' },
                      '&:hover fieldset': { borderColor: '#00a884' },
                      '&.Mui-focused fieldset': { borderColor: '#00a884' },
                    },
                    '& .MuiInputLabel-root': { color: '#8696a0' },
                    '& .MuiFormHelperText-root': { color: '#8696a0' }
                  }}
                />

                <TextField
                  fullWidth
                  type="password"
                  label="Confirmar Nova Senha"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#e9edef',
                      '& fieldset': { borderColor: '#313d43' },
                      '&:hover fieldset': { borderColor: '#00a884' },
                      '&.Mui-focused fieldset': { borderColor: '#00a884' },
                    },
                    '& .MuiInputLabel-root': { color: '#8696a0' },
                    '& .MuiFormHelperText-root': { color: '#8696a0' }
                  }}
                />
              </Box>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleUpdateProfile}
                  disabled={updating}
                  startIcon={updating ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                  sx={{
                    background: '#00a884',
                    '&:hover': { background: '#008069' },
                    px: 4
                  }}
                >
                  {updating ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Informações do Plano */}
        <Grid item xs={12} md={4}>
          <Card sx={{ background: '#202c33', border: '1px solid #313d43', mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CalendarIcon sx={{ color: '#00a884' }} />
                <Typography variant="h6" sx={{ color: '#e9edef' }}>
                  Informações do Plano
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#8696a0', mb: 0.5 }}>
                  Plano Atual
                </Typography>
                <Chip
                  label={user?.plan === 'premium' ? '⭐ Premium' : '🆓 Free'}
                  sx={{
                    background: user?.plan === 'premium' 
                      ? 'rgba(0, 168, 132, 0.2)' 
                      : 'rgba(102, 126, 234, 0.2)',
                    color: user?.plan === 'premium' ? '#00a884' : '#667eea',
                    border: `1px solid ${user?.plan === 'premium' ? '#00a884' : '#667eea'}`,
                    fontWeight: 600
                  }}
                />
              </Box>

              {user?.planExpiresAt ? (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: '#8696a0', mb: 0.5 }}>
                      Data de Vencimento
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#e9edef', fontWeight: 500 }}>
                      {formatExpirationDate()}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: '#8696a0', mb: 0.5 }}>
                      Dias Restantes
                    </Typography>
                    {isPlanExpired ? (
                      <Alert severity="error" sx={{ mt: 1, background: 'rgba(241, 92, 109, 0.1)', border: '1px solid #f15c6d' }}>
                        ⚠️ Plano Expirado
                      </Alert>
                    ) : isPlanActive ? (
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          color: planDaysRemaining <= 7 ? '#ffab00' : '#00a884',
                          fontWeight: 'bold'
                        }}
                      >
                        {planDaysRemaining} {planDaysRemaining === 1 ? 'dia' : 'dias'}
                      </Typography>
                    ) : null}
                  </Box>
                </>
              ) : (
                <Alert severity="info" sx={{ mt: 1, background: 'rgba(102, 126, 234, 0.1)', border: '1px solid #667eea' }}>
                  Plano sem data de vencimento
                </Alert>
              )}

              {user?.trialEndsAt && user?.isInTrial && (
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #313d43' }}>
                  <Typography variant="body2" sx={{ color: '#8696a0', mb: 0.5 }}>
                    Período de Teste
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#667eea', fontWeight: 500 }}>
                    {getTrialDaysRemaining()} dias restantes
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Status da Conta */}
          <Card sx={{ background: '#202c33', border: '1px solid #313d43' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AccountCircleIcon sx={{ color: '#00a884' }} />
                <Typography variant="h6" sx={{ color: '#e9edef' }}>
                  Status da Conta
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#8696a0', mb: 0.5 }}>
                  Status
                </Typography>
                <Chip
                  label={
                    user?.status === 'approved' ? 'Aprovada' :
                    user?.status === 'pending' ? 'Pendente' :
                    user?.status === 'rejected' ? 'Rejeitada' :
                    user?.status === 'suspended' ? 'Suspensa' : 'Desconhecido'
                  }
                  sx={{
                    background: user?.status === 'approved' 
                      ? 'rgba(0, 168, 132, 0.2)' 
                      : 'rgba(255, 171, 0, 0.2)',
                    color: user?.status === 'approved' ? '#00a884' : '#ffab00',
                    border: `1px solid ${user?.status === 'approved' ? '#00a884' : '#ffab00'}`,
                    fontWeight: 500
                  }}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ color: '#8696a0', mb: 0.5 }}>
                  CPF
                </Typography>
                <Typography variant="body1" sx={{ color: '#e9edef' }}>
                  {formatCPF(user?.cpf)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserProfile;

