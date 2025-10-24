const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Determinar a URL do backend baseada no ambiente
  const backendUrl = process.env.REACT_APP_API_URL || 
                    (process.env.NODE_ENV === 'production' ? 'https://back.clerky.com.br' : 'http://localhost:4700');
  
  console.log('🔧 Proxy configurado para:', backendUrl);
  
  app.use(
    '/api',
    createProxyMiddleware({
      target: backendUrl,
      changeOrigin: true,
      secure: process.env.NODE_ENV === 'production',
      logLevel: 'debug',
      timeout: 30000, // 30 segundos de timeout
      onError: (err, req, res) => {
        console.error('❌ Erro no proxy:', err.message);
        res.status(504).json({
          error: 'Gateway Timeout',
          message: 'Servidor backend não respondeu a tempo'
        });
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('📡 Proxy request:', req.method, req.url, '->', backendUrl + req.url);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('📡 Proxy response:', proxyRes.statusCode, req.url);
      }
    })
  );
};
