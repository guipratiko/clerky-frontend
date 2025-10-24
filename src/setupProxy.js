const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:4700',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug'
    })
  );
};
