// Configuração de ambiente para produção
const config = {
  development: {
    API_URL: 'http://localhost:4700',
    FRONTEND_URL: 'http://localhost:3500'
  },
  production: {
    API_URL: 'https://back.clerky.com.br',
    FRONTEND_URL: 'https://app.clerky.com.br'
  }
};

// Detectar ambiente automaticamente
const detectEnvironment = () => {
  if (typeof window === 'undefined') {
    return process.env.NODE_ENV || 'development';
  }

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('env') === 'production') {
    console.log('🔧 Ambiente forçado para produção via URL');
    return 'production';
  }

  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('💻 Localhost detectado:', hostname);
    return 'development';
  }

  if (hostname === 'app.clerky.com.br' || hostname.includes('clerky.com.br')) {
    console.log('🌐 Domínio de produção detectado:', hostname);
    return 'production';
  }

  console.log('🌍 Hostname desconhecido, assumindo desenvolvimento:', hostname);
  return 'development';
};

const resolvedEnv = (() => {
  const env = process.env.NODE_ENV || detectEnvironment();
  if (config[env]) return env;
  console.warn(`⚠️ Ambiente "${env}" não possui configuração específica. Usando desenvolvimento.`);
  return 'development';
})();

console.log('🌍 Ambiente detectado:', resolvedEnv);

export default config[resolvedEnv];
