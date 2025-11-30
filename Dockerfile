# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./

# Instala as dependências
RUN npm ci

# Copia o código fonte
COPY src ./src

# Compila o TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copia apenas os arquivos necessários para produção
COPY package*.json ./

# Instala apenas dependências de produção
RUN npm ci --only=production

# Copia os arquivos compilados do builder
COPY --from=builder /app/dist ./dist

# Expõe a porta da aplicação
EXPOSE 3000

# Define variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Comando para iniciar a aplicação
CMD ["node", "dist/index.js"]




