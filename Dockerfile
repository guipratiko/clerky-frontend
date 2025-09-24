# Dockerfile para Frontend React
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 3500

# Configurar variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3500

# Comando para iniciar a aplicação
CMD ["npm", "start"]
