# 📂 Estrutura Completa do Projeto

Visualização detalhada de todos os arquivos e suas responsabilidades.

---

## 🌳 Árvore de Arquivos

```
infoscript-back/
│
├── 📁 src/                          # Código-fonte
│   │
│   ├── 📁 config/                   # Configurações
│   │   ├── database.ts              # MongoDB connection
│   │   └── env.ts                   # Environment variables
│   │
│   ├── 📁 constants/                # Constantes
│   │   ├── collections.ts           # Nomes das coleções MongoDB
│   │   ├── http-status.ts           # HTTP status codes
│   │   ├── messages.ts              # Mensagens erro/sucesso
│   │   └── index.ts                 # Export centralizado
│   │
│   ├── 📁 middlewares/              # Middlewares reutilizáveis
│   │   ├── auth.ts                  # Autenticação JWT
│   │   ├── error-handler.ts         # Error handler global
│   │   └── index.ts                 # Export centralizado
│   │
│   ├── 📁 routes/                   # Rotas da API
│   │   ├── usuarios.ts              # CRUD usuários + auth + seguidores
│   │   ├── materias.ts              # CRUD matérias + matrículas
│   │   └── postagens.ts             # CRUD postagens + curtidas
│   │
│   ├── 📁 schemas/                  # Validações Swagger/JSON Schema
│   │   ├── usuario.schema.ts        # Schemas de usuário
│   │   ├── materia.schema.ts        # Schemas de matéria
│   │   └── postagem.schema.ts       # Schemas de postagem
│   │
│   ├── 📁 types/                    # Tipos TypeScript
│   │   ├── auth.ts                  # Tipos de autenticação/JWT
│   │   ├── usuario.ts               # Interfaces de usuário
│   │   ├── materia.ts               # Interfaces de matéria
│   │   ├── postagem.ts              # Interfaces de postagem
│   │   ├── common.ts                # Tipos comuns/reutilizáveis
│   │   └── index.ts                 # Export centralizado
│   │
│   ├── 📁 utils/                    # Funções utilitárias
│   │   ├── database.ts              # Helpers MongoDB
│   │   ├── response.ts              # Padronização de respostas
│   │   ├── validation.ts            # Validações comuns
│   │   └── index.ts                 # Export centralizado
│   │
│   └── index.ts                     # 🎯 Entry point da aplicação
│
├── 📁 docs/                         # Documentação
│   ├── ARQUITETURA.md               # Arquitetura do projeto
│   ├── AUTENTICACAO.md              # Sistema JWT
│   ├── CONTRIBUINDO.md              # Guia de contribuição
│   ├── ESTRUTURA-PROJETO.md         # Este arquivo
│   ├── GUIA-RAPIDO.md               # Referência rápida
│   ├── REFATORACAO-COMPLETA.md      # Detalhes da refatoração
│   ├── SWAGGER.md                   # Como usar Swagger
│   └── TESTE-SWAGGER.md             # Testes
│
├── 📄 .env.example                  # Template de variáveis de ambiente
├── 📄 .gitignore                    # Arquivos ignorados pelo Git
├── 📄 CHANGELOG.md                  # Histórico de mudanças
├── 📄 docker-compose.yml            # Docker setup
├── 📄 Dockerfile                    # Docker image
├── 📄 package.json                  # Dependências e scripts
├── 📄 README.md                     # Documentação principal
└── 📄 tsconfig.json                 # Configuração TypeScript
```

---

## 📋 Responsabilidades

### 🔧 config/
**Responsabilidade:** Configurações da aplicação
- `database.ts` → Conexão MongoDB
- `env.ts` → Variáveis de ambiente

**Quando usar:** Alterar configurações de infraestrutura

---

### 🎯 constants/
**Responsabilidade:** Valores fixos e imutáveis
- `messages.ts` → Mensagens de erro/sucesso
- `http-status.ts` → Códigos HTTP
- `collections.ts` → Nomes de coleções

**Quando usar:** Adicionar nova mensagem ou constante

**Exemplo:**
```typescript
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';

if (!user) {
  return reply.status(HTTP_STATUS.NOT_FOUND).send({
    error: ERROR_MESSAGES.USER_NOT_FOUND
  });
}
```

---

### 🛡️ middlewares/
**Responsabilidade:** Lógica intermediária reutilizável
- `auth.ts` → Autenticação e autorização
- `error-handler.ts` → Tratamento global de erros

**Quando usar:** Criar lógica que precisa rodar antes/depois das rotas

**Exemplo:**
```typescript
import { authenticate } from '../middlewares';

fastify.post('/rota-protegida', {
  onRequest: [fastify.authenticate]
}, handler);
```

---

### 🛣️ routes/
**Responsabilidade:** Definir endpoints da API
- `usuarios.ts` → 13 endpoints de usuários
- `materias.ts` → 9 endpoints de matérias
- `postagens.ts` → 14 endpoints de postagens

**Quando usar:** Adicionar novo endpoint

**Padrão:**
```typescript
export async function minhaRoute(fastify: FastifyInstance) {
  fastify.get('/endpoint', {
    schema: { /* Swagger schema */ },
    onRequest: [ /* middlewares */ ]
  }, async (request, reply) => {
    // Handler
  });
}
```

---

### ✅ schemas/
**Responsabilidade:** Validação de dados (JSON Schema)
- Define estrutura de dados
- Valida requests/responses
- Gera documentação Swagger

**Quando usar:** Adicionar validação de schema

**Exemplo:**
```typescript
export const meuSchema = {
  type: 'object',
  required: ['campo1', 'campo2'],
  properties: {
    campo1: { type: 'string', minLength: 3 },
    campo2: { type: 'number', minimum: 0 }
  }
};
```

---

### 📘 types/
**Responsabilidade:** Definições de tipos TypeScript
- `auth.ts` → JWTPayload, AuthenticatedUser
- `usuario.ts` → Usuario, CriarUsuarioDTO
- `materia.ts` → Materia, CriarMateriaDTO
- `postagem.ts` → Postagem, CriarPostagemDTO
- `common.ts` → BaseDocument, PaginationParams

**Quando usar:** Criar nova interface ou type

**Padrão:**
```typescript
export interface MinhaInterface {
  _id?: ObjectId;
  campo: string;
  criadoEm: Date;
}

export interface CriarMeuDTO {
  campo: string;
}
```

---

### 🧰 utils/
**Responsabilidade:** Funções auxiliares reutilizáveis
- `validation.ts` → Validações comuns
- `response.ts` → Padronização de respostas
- `database.ts` → Helpers MongoDB

**Quando usar:** Extrair lógica repetitiva

**Padrão:**
```typescript
export function minhaUtil(param: string): boolean {
  // Lógica reutilizável
  return true;
}
```

---

## 🔄 Fluxo de Dados

### Request → Response

```
1. Cliente envia request
   ↓
2. Fastify recebe
   ↓
3. Middlewares globais (CORS, JWT)
   ↓
4. Middleware da rota (authenticate, etc)
   ↓
5. Validação de schema
   ↓
6. Handler da rota
   ├─ Valida com utils/validation
   ├─ Busca dados (utils/database)
   ├─ Lógica de negócio
   └─ Retorna com utils/response
   ↓
7. Error handler (se erro)
   ↓
8. Response ao cliente
```

---

## 🎨 Padrão de Resposta

### Sucesso
```json
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada"
}
```

### Erro
```json
{
  "success": false,
  "error": "Mensagem de erro"
}
```

### Lista
```json
{
  "success": true,
  "count": 10,
  "data": [ ... ]
}
```

---

## 🔐 Autenticação

### JWT Payload
```typescript
{
  userId: string,
  nickname: string,
  cargo: 'estudante' | 'professor',
  iat: number,     // issued at
  exp: number      // expires
}
```

### Usando no código
```typescript
const { userId, cargo } = request.user as JWTPayload;

if (cargo !== 'professor') {
  return errorResponse(ERROR_MESSAGES.ONLY_PROFESSORS);
}
```

---

## 📦 Dependências Principais

### Produção
```json
{
  "fastify": "^4.25.2",           // Framework web
  "@fastify/cors": "^8.5.0",      // CORS
  "@fastify/jwt": "^8.0.0",       // JWT auth
  "@fastify/swagger": "^8.14.0",  // Documentação
  "mongodb": "^6.3.0",            // Database
  "bcrypt": "^5.1.1",             // Hash de senhas
  "dotenv": "^16.3.1"             // Env vars
}
```

### Desenvolvimento
```json
{
  "typescript": "^5.3.3",         // TypeScript
  "tsx": "^4.7.0",                // TS executor
  "@types/node": "^20.10.6",      // Types Node
  "@types/bcrypt": "^5.0.2"       // Types Bcrypt
}
```

---

## 📊 Métricas do Projeto

### Código
- **Arquivos TypeScript:** 20+
- **Linhas de código:** ~3.500
- **Endpoints:** 36
- **Collections MongoDB:** 3

### Organização
- **Pastas src/:** 7
- **Middlewares:** 2
- **Utils:** 3
- **Constants:** 3
- **Types:** 5

### Documentação
- **Arquivos .md:** 10+
- **Swagger:** 100% coberto
- **Exemplos:** Completos

---

## 🎓 Glossário

| Termo | Significado |
|-------|-------------|
| **DTO** | Data Transfer Object - Objeto para transferir dados |
| **Middleware** | Função que processa request antes do handler |
| **Schema** | Definição da estrutura de dados |
| **JWT** | JSON Web Token - Token de autenticação |
| **Payload** | Dados contidos no token/request |
| **Aggregate** | Pipeline de operações MongoDB |
| **ObjectId** | Tipo de ID do MongoDB |

---

## 🔗 Links Úteis

### Documentação Oficial
- [Fastify](https://www.fastify.io/)
- [MongoDB Node Driver](https://www.mongodb.com/docs/drivers/node/)
- [TypeScript](https://www.typescriptlang.org/)
- [JSON Schema](https://json-schema.org/)

### Ferramentas
- [Swagger Editor](https://editor.swagger.io/)
- [MongoDB Compass](https://www.mongodb.com/products/compass)
- [Postman](https://www.postman.com/)
- [VS Code REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

---

**Última atualização:** 29/11/2024

