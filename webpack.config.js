const path = require('path');

module.exports = {
  // ... outras configurações
  devServer: {
    // ... outras configurações
    client: {
      webSocketURL: {
        hostname: 'app.clerky.com.br',
        port: 443,
        pathname: '/ws',
        protocol: 'wss'
      }
    }
  }
};
