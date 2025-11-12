import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { InstanceProvider } from './contexts/InstanceContext';
import { I18nProvider } from './contexts/I18nContext';
import { Layout } from './components/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import SetPasswordPage from './components/Auth/SetPasswordPage';
import AdminPanel from './components/Admin/AdminPanel';
import HomePage from './components/HomePage';
import WhatsAppMain from './components/WhatsAppMain';
import InstanceManager from './components/InstanceManager';
import KanbanBoard from './components/KanbanBoard';
import MassDispatch from './components/MassDispatch';
import N8nIntegration from './components/N8nIntegration';
import AIWorkflows from './components/AIWorkflows';
import WebhookDocumentation from './components/WebhookDocumentation';
import StatusPage from './components/StatusPage';
import UserProfile from './components/UserProfile';
import MindClerkyPage from './components/MindClerky/MindClerkyPage';
import './App.css';

function App() {
  return (
    <Router 
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <I18nProvider>
        <AuthProvider>
          <Routes>
            {/* Rotas públicas (sem autenticação) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/complete-registration/:userId" element={<SetPasswordPage />} />
            <Route path="/status" element={<StatusPage />} />
            
            {/* Rotas protegidas */}
            <Route path="/*" element={
              <ProtectedRoute>
                <InstanceProvider>
                  <SocketProvider>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/instances" element={<InstanceManager />} />
                        <Route path="/chat/:instanceName" element={<WhatsAppMain />} />
                        <Route path="/crm/:instanceName" element={<KanbanBoard />} />
                        <Route path="/mass-dispatch" element={<MassDispatch />} />
                        <Route path="/n8n-integration" element={<N8nIntegration />} />
                        <Route path="/ai-workflows" element={<AIWorkflows />} />
                        <Route path="/mind-clerky" element={<MindClerkyPage />} />
                        <Route path="/webhook-docs" element={<WebhookDocumentation />} />
                        <Route path="/profile" element={<UserProfile />} />
                        <Route path="/admin" element={
                          <ProtectedRoute requireAdmin={true}>
                            <AdminPanel />
                          </ProtectedRoute>
                        } />
                      </Routes>
                    </Layout>
                  </SocketProvider>
                </InstanceProvider>
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </I18nProvider>
    </Router>
  );
}

export default App;
