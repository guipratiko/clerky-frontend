# Dockerfile para Frontend React - Produção
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar todas as dependências (incluindo devDependencies para build)
RUN npm ci

# Copiar código fonte
COPY . .

# Configurar variáveis de ambiente para build
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false
ENV REACT_APP_API_URL=https://back.clerky.com.br
ENV REACT_APP_SOCKET_URL=https://back.clerky.com.br
ENV REACT_APP_UPLOADS_URL=https://back.clerky.com.br/uploads
ENV REACT_APP_FRONTEND_URL=https://app.clerky.com.br

# Fazer build da aplicação React
RUN npm run build

# Stage 2: Servir arquivos estáticos com serve
FROM node:18-alpine

# Instalar serve globalmente
RUN npm install -g serve

# Copiar arquivos buildados do stage anterior
COPY --from=builder /app/build /app/build

# Expor porta 3500
EXPOSE 3500

# Comando para servir arquivos estáticos
CMD ["serve", "-s", "build", "-l", "3500"]
