const path = require('path');

module.exports = function(webpackEnv) {
  const isEnvDevelopment = webpackEnv === 'development';
  const isEnvProduction = webpackEnv === 'production';

  return {
    mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
    
    devServer: {
      client: {
        webSocketURL: {
          hostname: 'app.clerky.com.br',
          port: 443,
          pathname: '/ws',
          protocol: 'wss'
        }
      },
      // Configurações adicionais para forçar o uso da configuração
      host: '0.0.0.0',
      port: 3500,
      allowedHosts: 'all'
    }
  };
};
