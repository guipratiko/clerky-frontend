import { useI18n } from '../contexts/I18nContext';

// Hook para mensagens de toast traduzidas
export const useToastMessages = () => {
  const { t } = useI18n();

  const messages = {
    loginSuccess: t('auth.loginSuccess'),
    registerSuccess: t('auth.registerSuccess'),
    logoutSuccess: t('auth.logoutSuccess'),
    loginError: t('auth.loginError'),
    registerError: t('auth.registerError'),
    authCheckError: 'Erro ao verificar autenticação'
  };

  return messages;
};
