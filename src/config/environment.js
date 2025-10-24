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

export default config[process.env.NODE_ENV || 'development'];
