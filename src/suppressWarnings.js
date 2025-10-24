// Configuração para suprimir warnings de deprecação do webpack dev server
// Estes warnings são do próprio react-scripts e não afetam a funcionalidade

// Suprimir warnings específicos do webpack dev server
const originalWarn = console.warn;
console.warn = function(...args) {
  const message = args[0];
  
  // Suprimir warnings específicos de deprecação do webpack dev server
  if (
    typeof message === 'string' && 
    (message.includes('onAfterSetupMiddleware') || 
     message.includes('onBeforeSetupMiddleware') ||
     message.includes('DEP_WEBPACK_DEV_SERVER'))
  ) {
    return; // Não exibir estes warnings
  }
  
  // Exibir outros warnings normalmente
  originalWarn.apply(console, args);
};

// Suprimir warnings de deprecação do Node.js
const originalEmitWarning = process.emitWarning;
process.emitWarning = function(warning, ...args) {
  if (
    typeof warning === 'string' && 
    (warning.includes('onAfterSetupMiddleware') || 
     warning.includes('onBeforeSetupMiddleware'))
  ) {
    return; // Não exibir estes warnings
  }
  
  // Exibir outros warnings normalmente
  originalEmitWarning.apply(process, [warning, ...args]);
};
