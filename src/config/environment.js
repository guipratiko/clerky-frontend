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
  // Verificar se há um parâmetro na URL forçando produção (para testes)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('env') === 'production') {
    console.log('🔧 Ambiente forçado para produção via URL');
    return 'production';
  }
  
  // Verificar o hostname
  const hostname = window.location.hostname;
  
  // Se estamos em um domínio de produção, é produção
  if (hostname === 'app.clerky.com.br' || hostname.includes('clerky.com.br')) {
    console.log('🌐 Domínio de produção detectado:', hostname);
    return 'production';
  }
  
  // Se estamos rodando em localhost, é desenvolvimento
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('💻 Localhost detectado:', hostname);
    return 'development';
  }
  
  // Caso contrário, assumir produção
  console.log('🌍 Hostname desconhecido, assumindo produção:', hostname);
  return 'production';
};

const environment = process.env.NODE_ENV || detectEnvironment();
console.log('🌍 Ambiente detectado:', environment);

export default config[environment];
