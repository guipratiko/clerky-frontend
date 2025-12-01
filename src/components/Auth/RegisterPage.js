import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  LinearProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  Badge,
  CheckCircle
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import LanguageSelector from '../LanguageSelector';
import { Link as RouterLink } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { register, loading } = useAuth();
  const { t } = useI18n();

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Formatação automática de CPF
    if (name === 'cpf') {
      value = value.replace(/\D/g, '');
      if (value.length <= 11) {
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      }
    }
    
    // Formatação automática de telefone
    if (name === 'phone') {
      value = value.replace(/\D/g, '');
      if (value.length <= 11) {
        if (value.length <= 10) {
          value = value.replace(/(\d{2})(\d)/, '($1) $2');
          value = value.replace(/(\d{4})(\d)/, '$1-$2');
        } else {
          value = value.replace(/(\d{2})(\d)/, '($1) $2');
          value = value.replace(/(\d{5})(\d)/, '$1-$2');
        }
      }
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError(t('auth.nameRequired'));
      return false;
    }

    if (!formData.email.trim()) {
      setError(t('auth.emailRequired'));
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError(t('auth.emailInvalid'));
      return false;
    }

    if (!formData.cpf.trim()) {
      setError('CPF é obrigatório');
      return false;
    }

    const cpfClean = formData.cpf.replace(/\D/g, '');
    if (cpfClean.length !== 11) {
      setError('CPF inválido. Digite 11 dígitos');
      return false;
    }

    // Validar telefone apenas se fornecido (opcional)
    if (formData.phone.trim()) {
      const phoneClean = formData.phone.replace(/\D/g, '');
      if (phoneClean.length < 10 || phoneClean.length > 11) {
        setError('Telefone inválido. Digite DDD + número');
        return false;
      }
    }

    if (!formData.password) {
      setError(t('auth.passwordRequired'));
      return false;
    }

    if (formData.password.length < 6) {
      setError(t('auth.passwordMinLength'));
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordsNotMatch'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await register(
      formData.name, 
      formData.email, 
      formData.password, 
      formData.cpf, 
      formData.phone
    );
    
    if (result.success) {
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        cpf: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });
    } else {
      setError(result.error);
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    
    return strength;
  };

  const getPasswordStrengthText = () => {
    const strength = getPasswordStrength();
    if (strength === 0) return '';
    if (strength <= 25) return t('auth.passwordWeak');
    if (strength <= 50) return t('auth.passwordRegular');
    if (strength <= 75) return t('auth.passwordGood');
    return t('auth.passwordStrong');
  };

  const getPasswordStrengthColor = () => {
    const strength = getPasswordStrength();
    if (strength <= 25) return 'error';
    if (strength <= 50) return 'warning';
    if (strength <= 75) return 'info';
    return 'success';
  };

  // Tela de sucesso
  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #111b21 0%, #1a1a2e 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            <LanguageSelector />
          </Box>
          
          <Paper
            elevation={24}
            sx={{
              padding: 4,
              borderRadius: 3,
              background: 'linear-gradient(180deg, #1e1e2e 0%, #2d2d44 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              textAlign: 'center'
            }}
          >
            <CheckCircle 
              sx={{ 
                fontSize: 80, 
                color: '#00a884',
                mb: 2
              }} 
            />
            <Typography 
              variant="h4" 
              component="h1" 
              fontWeight="bold"
              sx={{ color: '#fff', mb: 2 }}
            >
              {t('auth.registerSuccess')}
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ color: 'rgba(255,255,255,0.8)', mb: 3 }}
            >
              Sua conta foi criada com sucesso! 🎉
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ color: 'rgba(255,255,255,0.6)', mb: 2 }}
            >
              Você ganhou <strong style={{ color: '#00a884' }}>7 dias de teste grátis</strong> para explorar o sistema!
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ color: 'rgba(255,255,255,0.6)', mb: 1 }}
            >
              ✅ Acesso total ao WhatsApp, Chats e Kanban
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ color: 'rgba(255,255,255,0.4)', mb: 4 }}
            >
              *Disparo em Massa e Integração N8N disponíveis após trial
            </Typography>
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              size="large"
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #00a884 0%, #26d367 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #26d367 0%, #00a884 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,168,132,0.3)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Ir para Login
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  // Formulário de registro
  return (
    <Box
      sx={{
        minHeight: '100vh',
        height: '100vh',
        background: 'linear-gradient(135deg, #111b21 0%, #1a1a2e 100%)',
        overflow: 'auto',
        py: 3,
        '&::-webkit-scrollbar': {
          width: '10px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(0,0,0,0.2)',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0, 168, 132, 0.6)',
          borderRadius: '5px',
          '&:hover': {
            background: 'rgba(0, 168, 132, 0.8)',
          },
        },
      }}
    >
      <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', minHeight: '100%' }}>
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <LanguageSelector />
        </Box>

        <Paper
          elevation={24}
          sx={{
            width: '100%',
            padding: { xs: 3, sm: 4 },
            borderRadius: 3,
            background: 'linear-gradient(180deg, #1e1e2e 0%, #2d2d44 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            my: 2
          }}
        >
          {/* Logo e Subtítulo */}
          <Box textAlign="center" mb={4}>
            <Box
              component="img"
              src="/img/logo.png"
              alt="Clerky CRM"
              sx={{
                height: { xs: 60, sm: 80 },
                width: 'auto',
                maxWidth: '100%',
                mb: 2,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            />
            <Typography 
              variant="body1" 
              sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5 }}
            >
              Registre-se para começar
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ color: 'rgba(255,255,255,0.5)' }}
            >
              7 dias de teste grátis
            </Typography>
          </Box>

          {/* Formulário */}
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  backgroundColor: 'rgba(241,92,109,0.1)',
                  color: '#f15c6d',
                  border: '1px solid rgba(241,92,109,0.3)',
                  '& .MuiAlert-icon': {
                    color: '#f15c6d'
                  }
                }}
              >
                {error}
              </Alert>
            )}

            {/* Nome Completo */}
            <TextField
              fullWidth
              name="name"
              label="Nome Completo"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: 'rgba(255,255,255,0.6)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover fieldset': { borderColor: '#00a884' },
                  '&.Mui-focused fieldset': { borderColor: '#00a884' },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.6)',
                  '&.Mui-focused': { color: '#00a884' },
                },
              }}
            />

            {/* Email */}
            <TextField
              fullWidth
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: 'rgba(255,255,255,0.6)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover fieldset': { borderColor: '#00a884' },
                  '&.Mui-focused fieldset': { borderColor: '#00a884' },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.6)',
                  '&.Mui-focused': { color: '#00a884' },
                },
              }}
            />

            {/* CPF */}
            <TextField
              fullWidth
              name="cpf"
              label="CPF"
              value={formData.cpf}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="000.000.000-00"
              inputProps={{ maxLength: 14 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Badge sx={{ color: 'rgba(255,255,255,0.6)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover fieldset': { borderColor: '#00a884' },
                  '&.Mui-focused fieldset': { borderColor: '#00a884' },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.6)',
                  '&.Mui-focused': { color: '#00a884' },
                },
              }}
            />

            {/* Telefone */}
            <TextField
              fullWidth
              name="phone"
              label="Telefone (opcional)"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
              placeholder="(00) 00000-0000"
              inputProps={{ maxLength: 15 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone sx={{ color: 'rgba(255,255,255,0.6)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover fieldset': { borderColor: '#00a884' },
                  '&.Mui-focused fieldset': { borderColor: '#00a884' },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.6)',
                  '&.Mui-focused': { color: '#00a884' },
                },
              }}
            />

            {/* Senha */}
            <TextField
              fullWidth
              name="password"
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'rgba(255,255,255,0.6)' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                      sx={{ color: 'rgba(255,255,255,0.6)' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover fieldset': { borderColor: '#00a884' },
                  '&.Mui-focused fieldset': { borderColor: '#00a884' },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.6)',
                  '&.Mui-focused': { color: '#00a884' },
                },
              }}
            />

            {/* Indicador de Força da Senha */}
            {formData.password && (
              <Box sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Força da senha: {getPasswordStrengthText()}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getPasswordStrength()}
                  color={getPasswordStrengthColor()}
                  sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                />
              </Box>
            )}

            {/* Confirmar Senha */}
            <TextField
              fullWidth
              name="confirmPassword"
              label="Confirmar Senha"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'rgba(255,255,255,0.6)' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      disabled={loading}
                      sx={{ color: 'rgba(255,255,255,0.6)' }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover fieldset': { borderColor: '#00a884' },
                  '&.Mui-focused fieldset': { borderColor: '#00a884' },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.6)',
                  '&.Mui-focused': { color: '#00a884' },
                },
              }}
            />

            {/* Botão de Registro */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #00a884 0%, #26d367 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #26d367 0%, #00a884 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,168,132,0.3)',
                },
                '&:disabled': {
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.3)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Registrar'
              )}
            </Button>
          </form>

          {/* Link para Login */}
          <Box textAlign="center" mt={3}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Já tem uma conta?{' '}
              <Link
                component={RouterLink}
                to="/login"
                sx={{
                  color: '#00a884',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  '&:hover': {
                    color: '#26d367',
                    textDecoration: 'underline'
                  },
                  transition: 'color 0.3s ease'
                }}
              >
                Faça login
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
