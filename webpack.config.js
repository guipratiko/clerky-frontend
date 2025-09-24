const path = require('path');

module.exports = {
  // ... outras configurações
  devServer: {
    // ... outras configurações
    client: {
      webSocketURL: {
        hostname: 'ws.clerky.com.br',
        port: 3500,
        pathname: '/ws',
        protocol: 'wss'
      }
    }
  }
};
