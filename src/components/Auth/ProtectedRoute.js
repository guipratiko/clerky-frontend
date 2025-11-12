import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress, Alert } from '@mui/material';

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  requireApproved = true 
}) => {
  const { user, loading, isAdmin, isApproved } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Redirecionar para login se não estiver autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar se precisa estar aprovado
  if (requireApproved && !isApproved()) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        p={2}
      >
        <Alert 
          severity="warning" 
          sx={{ 
            maxWidth: 600,
            '& .MuiAlert-message': {
              textAlign: 'center'
            }
          }}
        >
          <strong>Conta Pendente de Aprovação</strong>
          <br />
          Para acessar o sistema, você precisa aderir a um plano de assinatura. Após a confirmação do pagamento, seu acesso será liberado automaticamente.
          <br />
          Entre em contato com o suporte se necessário.
        </Alert>
      </Box>
    );
  }

  // Verificar se precisa ser admin
  if (requireAdmin && !isAdmin()) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        p={2}
      >
        <Alert 
          severity="error"
          sx={{ 
            maxWidth: 600,
            '& .MuiAlert-message': {
              textAlign: 'center'
            }
          }}
        >
          <strong>Acesso Negado</strong>
          <br />
          Você não tem permissão para acessar esta página.
          <br />
          Apenas administradores podem acessar este recurso.
        </Alert>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;
