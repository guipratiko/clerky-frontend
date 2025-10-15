import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

function SetPasswordPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Verificar se o usuário pode completar o registro
    const fetchUserData = async () => {
      try {
        const response = await api.get(`/api/auth/complete-registration/${userId}`);
        
        if (response.data.success) {
          setUserData(response.data.data);
          
          // Verificar se o plano expirou
          if (response.data.data.isPlanExpired) {
            setError('Seu plano expirou. Por favor, entre em contato com o suporte.');
            setLoading(false);
            return;
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erro ao verificar registro:', err);
        setError(err.response?.data?.error || 'Link inválido ou expirado');
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validações
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post(`/api/auth/complete-registration/${userId}`, {
        password
      });

      if (response.data.success) {
        setSuccess('Senha definida com sucesso! Redirecionando...');
        
        // Salvar token e fazer login automático
        const { token, user } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    } catch (err) {
      console.error('Erro ao definir senha:', err);
      setError(err.response?.data?.error || 'Erro ao definir senha');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.authPage}>
        <div style={styles.authContainer}>
          <div style={styles.authCard}>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ ...styles.spinner, margin: '0 auto 20px' }}></div>
              <p>Carregando...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !userData) {
  return (
    <div style={styles.authPage}>
      <div style={styles.authContainer}>
        <div style={styles.authCard}>
          <div style={styles.authHeader}>
            <img src="/img/logo.png" alt="Clerky Logo" style={styles.authLogo} />
            <h2 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '28px', fontWeight: '600' }}>Link Inválido</h2>
          </div>
          <div style={styles.alertError}>
            <span style={{ fontSize: '18px' }}>⚠️</span>
            <span>{error}</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            style={{ ...styles.btn, ...styles.btnSecondary, width: '100%', marginTop: '20px' }}
            onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
            onMouseLeave={(e) => (e.target.style.opacity = '1')}
          >
            ← Ir para Login
          </button>
        </div>
      </div>
    </div>
  );
  }

  return (
    <div style={styles.authPage}>
      <div style={styles.authContainer}>
        <div style={styles.authCard}>
          <div style={styles.authHeader}>
            <img src="/img/logo.png" alt="Clerky Logo" style={styles.authLogo} />
            <h2 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '28px', fontWeight: '600' }}>Defina sua Senha</h2>
            <p style={styles.authSubtitle}>
              Bem-vindo(a), {userData?.name}!
            </p>
          </div>

          {userData && (
            <div style={styles.planInfo}>
              <p style={styles.planInfoText}>
                <strong style={styles.strong}>Email:</strong> {userData.email}
              </p>
              <p style={styles.planInfoText}>
                <strong style={styles.strong}>Plano:</strong> {userData.plan === 'premium' ? '⭐ Premium' : 'Gratuito'}
              </p>
              {userData.planExpiresAt && (
                <p style={styles.planInfoTextLast}>
                  <strong style={styles.strong}>Válido até:</strong> {new Date(userData.planExpiresAt).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          )}

          {error && (
            <div style={styles.alertError}>
              <span style={{ fontSize: '18px' }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={styles.alertSuccess}>
              <span style={{ fontSize: '18px' }}>✅</span>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>🔒 Senha</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha (mínimo 6 caracteres)"
                required
                disabled={submitting}
                autoFocus
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = '#00a884'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="confirmPassword" style={styles.label}>🔒 Confirmar Senha</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Digite sua senha novamente"
                required
                disabled={submitting}
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = '#00a884'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{ 
                ...styles.btn, 
                ...(submitting ? styles.btnDisabled : styles.btnPrimary), 
                width: '100%' 
              }}
              onMouseEnter={(e) => !submitting && (e.target.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)')}
            >
              {submitting ? '⏳ Definindo senha...' : '✅ Definir Senha e Acessar'}
            </button>
          </form>

          <div style={styles.authFooter}>
            <p>
              Já tem conta? <a href="/login" style={styles.link}>Fazer login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  authPage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #111b21 0%, #1a1a2e 100%)',
    padding: '20px'
  },
  authContainer: {
    width: '100%',
    maxWidth: '500px'
  },
  authCard: {
    background: 'linear-gradient(180deg, #1e1e2e 0%, #2d2d44 100%)',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)'
  },
  authHeader: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  authLogo: {
    maxWidth: '120px',
    marginBottom: '20px',
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
  },
  authSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '16px',
    marginTop: '10px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '14px',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#fff',
    outline: 'none'
  },
  inputFocus: {
    borderColor: '#00a884',
    boxShadow: '0 0 0 2px rgba(0,168,132,0.1)'
  },
  btn: {
    padding: '14px 24px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #00a884 0%, #26d367 100%)',
    color: '#ffffff',
    boxShadow: '0 4px 15px rgba(0,168,132,0.3)'
  },
  btnPrimaryHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0,168,132,0.4)'
  },
  btnSecondary: {
    background: 'rgba(255,255,255,0.1)',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.2)'
  },
  btnDisabled: {
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.3)',
    cursor: 'not-allowed',
    transform: 'none'
  },
  authFooter: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)'
  },
  link: {
    color: '#00a884',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color 0.3s ease'
  },
  linkHover: {
    color: '#26d367',
    textDecoration: 'underline'
  },
  spinner: {
    border: '3px solid rgba(255,255,255,0.1)',
    borderTop: '3px solid #00a884',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite'
  },
  alertError: {
    padding: '14px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    backgroundColor: 'rgba(241,92,109,0.1)',
    color: '#f15c6d',
    border: '1px solid rgba(241,92,109,0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  alertSuccess: {
    padding: '14px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    backgroundColor: 'rgba(0,168,132,0.1)',
    color: '#00a884',
    border: '1px solid rgba(0,168,132,0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  planInfo: {
    marginBottom: '20px',
    padding: '16px',
    backgroundColor: 'rgba(0,168,132,0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(0,168,132,0.3)'
  },
  planInfoText: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    color: 'rgba(255,255,255,0.8)'
  },
  planInfoTextLast: {
    margin: '0',
    fontSize: '14px',
    color: 'rgba(255,255,255,0.8)'
  },
  strong: {
    color: '#00a884',
    fontWeight: '600'
  }
};

// Adicionar a animação do spinner globalmente
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  if (!document.querySelector('style[data-spinner]')) {
    style.setAttribute('data-spinner', 'true');
    document.head.appendChild(style);
  }
}

export default SetPasswordPage;

