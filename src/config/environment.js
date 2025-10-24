// Configuração de ambiente para produção
const config = {
  development: {
    API_URL: 'http://localhost:4500',
    FRONTEND_URL: 'http://localhost:3500'
  },
  production: {
    API_URL: 'https://back.clerky.com.br',
    FRONTEND_URL: 'https://app.clerky.com.br'
  }
};

// Detectar ambiente automaticamente
const detectEnvironment = () => {
  // Se estamos rodando em localhost, é desenvolvimento
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'development';
  }
  // Caso contrário, é produção
  return 'production';
};

const environment = process.env.NODE_ENV || detectEnvironment();
console.log('🌍 Ambiente detectado:', environment);

export default config[environment];
