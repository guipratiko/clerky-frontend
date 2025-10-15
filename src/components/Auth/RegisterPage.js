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
  // WhatsApp,
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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

    const result = await register(formData.name, formData.email, formData.password);
    
    if (result.success) {
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    } else {
      setError(result.error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
          {/* Language Selector */}
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
              gutterBottom
            >
              {t('auth.registerSuccess')}
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ color: 'rgba(255,255,255,0.8)', mb: 3 }}
              gutterBottom
            >
              Sua conta foi criada com sucesso!
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ color: 'rgba(255,255,255,0.6)', mb: 2 }}
            >
              Para liberar o acesso ao sistema, você precisa aderir a um plano de assinatura.
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ color: 'rgba(255,255,255,0.6)', mb: 4 }}
            >
              Após a confirmação do pagamento, você receberá um link para ativar sua conta e começar a usar o sistema.
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
        <Paper
          elevation={24}
          sx={{
            padding: 4,
            borderRadius: 3,
            background: 'linear-gradient(180deg, #1e1e2e 0%, #2d2d44 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Box
              component="img"
              src="/img/logo.png"
              alt="Clerky CRM Logo"
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
              variant="h4" 
              component="h1" 
              fontWeight="bold"
              sx={{ color: '#fff', mb: 1 }}
              gutterBottom
            >
              Criar Conta
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ color: 'rgba(255,255,255,0.6)' }}
            >
              Registre-se para acessar o sistema WhatsApp
            </Typography>
          </Box>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2,
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

            <TextField
              fullWidth
              name="name"
              label="Nome Completo"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
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
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#00a884',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00a884',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.6)',
                  '&.Mui-focused': {
                    color: '#00a884',
                  },
                },
              }}
            />

            <TextField
              fullWidth
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
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
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#00a884',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00a884',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.6)',
                  '&.Mui-focused': {
                    color: '#00a884',
                  },
                },
              }}
            />

            <TextField
              fullWidth
              name="password"
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
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
                      onClick={togglePasswordVisibility}
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
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#00a884',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00a884',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.6)',
                  '&.Mui-focused': {
                    color: '#00a884',
                  },
                },
              }}
            />

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

            <TextField
              fullWidth
              name="confirmPassword"
              label="Confirmar Senha"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
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
                      onClick={toggleConfirmPasswordVisibility}
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
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#00a884',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00a884',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.6)',
                  '&.Mui-focused': {
                    color: '#00a884',
                  },
                },
              }}
            />

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
                'Criar Conta'
              )}
            </Button>
          </form>

          {/* Footer */}
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
