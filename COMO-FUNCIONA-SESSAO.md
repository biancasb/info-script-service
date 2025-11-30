# 🔐 Como Funciona a Validação de Sessão - InfoScript Backend

## 📋 Visão Geral

O sistema usa **JWT (JSON Web Token)** para gerenciar sessões de usuário. Não há sessões no servidor (stateless), o token contém todas as informações necessárias.

---

## 🔄 Fluxo Completo

### 1️⃣ **Login - Criação da Sessão**

```
Cliente                          Servidor
  │                                 │
  ├─ POST /usuarios/login ────────►│
  │  {                              │
  │    nickname: "joao123",         │
  │    senha: "senha123"            │
  │  }                              │
  │                                 │
  │                          1. Valida credenciais
  │                          2. Hash da senha
  │                          3. Gera JWT token
  │                                 │
  │◄──── 200 OK ────────────────────┤
  {                                 │
    token: "eyJhbGc...",             │
    expiresIn: "7d",                │
    user: { ... }                   │
  }                                 │
  │                                 │
  └─ Salva token no localStorage   │
```

**Código (src/routes/usuarios.ts):**

```typescript
// Login gera o token JWT
const payload: JWTPayload = {
  userId: usuario._id!.toString(),
  nickname: usuario.nickname,
  cargo: usuario.cargo,
};

const token = fastify.jwt.sign(payload);

return {
  success: true,
  message: 'Login realizado com sucesso',
  token,                          // ← Token enviado ao cliente
  expiresIn: config.jwtExpiresIn, // ← "7d" (7 dias)
  user: { ... }
};
```

**Token JWT contém:**
```json
{
  "userId": "674a1234567890abcdef1234",
  "nickname": "joao123",
  "cargo": "estudante",
  "iat": 1701234567,  // Timestamp de criação
  "exp": 1701839367   // Timestamp de expiração (7 dias depois)
}
```

---

### 2️⃣ **Requisições Autenticadas - Validação da Sessão**

```
Cliente                          Servidor
  │                                 │
  ├─ POST /postagens/toggle-curtida│
  │  Headers:                       │
  │    Authorization: Bearer eyJ... │
  │  Body: { postagemId: "..." }   │
  │                                 │
  │                          1. Extrai token do header
  │                          2. Verifica assinatura
  │                          3. Verifica expiração
  │                          4. Decodifica payload
  │                          5. Adiciona em request.user
  │                                 │
  │                          ✅ Token válido!
  │                          Executa a rota...
  │                                 │
  │◄──── 200 OK ────────────────────┤
  {                                 │
    success: true,                  │
    action: "curtiu"                │
  }                                 │
```

---

## 🔧 Como Está Implementado

### 1. **Configuração JWT (src/index.ts)**

```typescript
// Registra plugin JWT
await fastify.register(jwt, {
  secret: config.jwtSecret,        // Chave secreta
  sign: {
    expiresIn: config.jwtExpiresIn, // 7 dias
  },
});

// Registra middlewares como decorators
fastify.decorate('authenticate', authenticate);
fastify.decorate('optionalAuthenticate', optionalAuthenticate);
```

---

### 2. **Middlewares de Autenticação (src/middlewares/auth.ts)**

#### A) **Autenticação Obrigatória**

```typescript
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Verifica token JWT
    await request.jwtVerify();
    // ✅ Se passar: request.user é populado com JWTPayload
    // ❌ Se falhar: lança erro
  } catch (err) {
    // Token inválido/expirado/ausente
    reply.status(401).send({
      success: false,
      error: 'Token inválido ou expirado. Faça login novamente.'
    });
  }
}
```

#### B) **Autenticação Opcional**

```typescript
export async function optionalAuthenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();
    // ✅ Se passar: request.user é populado
  } catch (err) {
    // ✅ Se falhar: apenas continua sem autenticação
    // Não retorna erro!
  }
}
```

---

### 3. **Uso nas Rotas**

#### A) **Rota COM Autenticação Obrigatória**

```typescript
// src/routes/postagens.ts (linha 555)
fastify.post<{ Body: { postagemId: string } }>(
  '/postagens/toggle-curtida',
  {
    onRequest: [fastify.authenticate], // ← Middleware aplicado aqui
    schema: {
      tags: ['Postagens'],
      security: [{ bearerAuth: [] }],  // ← Mostra cadeado no Swagger
      // ...
    }
  },
  async (request, reply) => {
    // Se chegou aqui, token é válido!
    const { userId } = request.user as JWTPayload; // ← Dados do token
    
    // Usa o userId do token (não precisa passar no body)
    const usuarioObjId = new ObjectId(userId);
    // ...
  }
);
```

#### B) **Rota COM Autenticação Opcional**

```typescript
// src/routes/postagens.ts (linha 14)
fastify.get<{ Querystring: { tag?: string } }>(
  '/postagens',
  {
    onRequest: [fastify.optionalAuthenticate], // ← Middleware opcional
    schema: {
      security: [{ bearerAuth: [] }, {}], // ← Com ou sem auth
      // ...
    }
  },
  async (request, reply) => {
    // Verifica se está autenticado
    if (request.user) {
      // ✅ Autenticado: Feed personalizado
      const { userId } = request.user as JWTPayload;
      // Busca postagens do usuário + quem ele segue
    } else {
      // 🔓 Não autenticado: Feed geral
      // Busca todas as postagens
    }
  }
);
```

#### C) **Rota SEM Autenticação**

```typescript
// src/routes/usuarios.ts
fastify.get('/usuarios', async (request, reply) => {
  // Sem middleware de autenticação
  // Rota pública, qualquer um pode acessar
});
```

---

## 🔍 Processo de Validação Detalhado

### Quando Requisição Chega:

```
1. Cliente envia request
   ↓
2. Fastify recebe
   ↓
3. Se rota tem onRequest: [fastify.authenticate]
   ↓
4. Middleware authenticate() é executado
   ↓
5. request.jwtVerify() é chamado
   ↓
6. @fastify/jwt verifica:
   ├─ Header "Authorization: Bearer <token>" existe?
   ├─ Token está bem formatado?
   ├─ Assinatura é válida? (usando secret)
   ├─ Token expirou?
   └─ Payload é válido?
   ↓
7a. ✅ VÁLIDO:
    - Decodifica payload
    - Adiciona em request.user = { userId, nickname, cargo }
    - Continua para a rota
   ↓
7b. ❌ INVÁLIDO:
    - Lança erro
    - Middleware catch
    - Retorna 401 Unauthorized
    - Rota NÃO é executada
```

---

## 🎯 Validações que Acontecem Automaticamente

### 1. **Assinatura**
```typescript
// Token é assinado com secret:
const token = jwt.sign(payload, 'infoscript-secret-key');

// Validação verifica:
// ✅ Foi assinado com a mesma chave?
// ❌ Se alguém modificou o token, assinatura fica inválida
```

### 2. **Expiração**
```typescript
// Token tem timestamp de expiração
{
  "exp": 1701839367  // Unix timestamp
}

// Validação verifica:
// ✅ Timestamp atual < exp ? Token válido : Token expirado
```

### 3. **Formato**
```typescript
// Token deve ter formato: header.payload.signature
// Exemplo: eyJhbGc...eyJ1c2V...SflKxw

// Validação verifica:
// ✅ Tem 3 partes separadas por '.'?
// ✅ Cada parte é Base64 válido?
```

---

## 📊 Rotas por Tipo de Autenticação

### 🔒 **Autenticação Obrigatória** (2 rotas)

| Rota | Linha | Descrição |
|------|-------|-----------|
| `POST /usuarios/toggle-seguir` | usuarios.ts:498 | Toggle seguir/deixar de seguir |
| `POST /postagens/toggle-curtida` | postagens.ts:555 | Toggle curtir/descurtir |

**Comportamento:**
- ✅ Com token válido: Executa normalmente
- ❌ Sem token ou token inválido: **Retorna 401 Unauthorized**

---

### 🔓✅ **Autenticação Opcional** (1 rota)

| Rota | Descrição |
|------|-----------|
| `GET /postagens` | Feed (personalizado se auth, geral se não) |

**Comportamento:**
- ✅ Com token válido: Feed personalizado (usuário + seguindo)
- 🔓 Sem token: Feed geral (todas as postagens)
- ⚠️ Com token inválido: Ignora erro, trata como não autenticado

---

### 🔓 **Sem Autenticação** (~30+ rotas)

Todas as demais rotas são públicas:
- `GET /usuarios`
- `POST /usuarios` (criar conta)
- `POST /usuarios/login`
- `GET /materias`
- `GET /postagens/:id`
- etc...

---

## 🧪 Testando a Validação

### 1. **Login e Obter Token**

```bash
curl -X POST http://localhost:3000/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "joao123",
    "senha": "senha123"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzRhMTIzNCI...",
  "expiresIn": "7d"
}
```

---

### 2. **Testar Rota Protegida COM Token Válido** ✅

```bash
# Copie o token da resposta acima
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:3000/postagens/toggle-curtida \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"postagemId": "674b1234567890abcdef5678"}'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Postagem curtida com sucesso",
  "action": "curtiu",
  "totalCurtidas": 5
}
```

---

### 3. **Testar Rota Protegida SEM Token** ❌

```bash
curl -X POST http://localhost:3000/postagens/toggle-curtida \
  -H "Content-Type: application/json" \
  -d '{"postagemId": "674b1234567890abcdef5678"}'
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Token inválido ou expirado. Faça login novamente."
}
```

---

### 4. **Testar Rota Protegida COM Token Inválido** ❌

```bash
curl -X POST http://localhost:3000/postagens/toggle-curtida \
  -H "Authorization: Bearer token-falso-123" \
  -H "Content-Type: application/json" \
  -d '{"postagemId": "674b1234567890abcdef5678"}'
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Token inválido ou expirado. Faça login novamente."
}
```

---

### 5. **Testar Rota Opcional COM Token** ✅

```bash
curl -X GET "http://localhost:3000/postagens?tag=Matemática" \
  -H "Authorization: Bearer $TOKEN"
```

**Response (200 OK - Feed Personalizado):**
```json
{
  "success": true,
  "count": 12,
  "authenticated": true,
  "feedType": "personalizado",
  "data": [/* postagens do usuário + quem ele segue */]
}
```

---

### 6. **Testar Rota Opcional SEM Token** ✅

```bash
curl -X GET "http://localhost:3000/postagens"
```

**Response (200 OK - Feed Geral):**
```json
{
  "success": true,
  "count": 50,
  "authenticated": false,
  "feedType": "geral",
  "data": [/* todas as postagens */]
}
```

---

## 🔐 Onde o Token é Verificado?

### Código Interno

```typescript
// 1. Cliente envia header:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// 2. Middleware executa (se rota tiver onRequest):
onRequest: [fastify.authenticate]

// 3. Dentro do middleware (src/middlewares/auth.ts):
export async function authenticate(request, reply) {
  try {
    await request.jwtVerify(); // ← AQUI! Verifica o token
    // Se passar, request.user é populado
  } catch (err) {
    // Token inválido → retorna 401
    reply.status(401).send({ error: 'Token inválido...' });
  }
}

// 4. Plugin @fastify/jwt faz a verificação:
request.jwtVerify() {
  ├─ Extrai token do header "Authorization"
  ├─ Remove prefixo "Bearer "
  ├─ Decodifica Base64
  ├─ Verifica assinatura usando secret
  ├─ Verifica expiração (exp < now?)
  └─ Se válido: adiciona payload em request.user
}

// 5. Na rota, você acessa os dados:
const { userId, nickname, cargo } = request.user as JWTPayload;
```

---

## 📦 Onde Ficam as Informações?

### No Token (Cliente - localStorage/cookie)

```javascript
// Frontend guarda o token:
localStorage.setItem('token', response.token);

// E envia em toda requisição:
fetch('/postagens/toggle-curtida', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

### No Request (Servidor - durante a requisição)

```typescript
// Após jwtVerify():
request.user = {
  userId: "674a1234567890abcdef1234",
  nickname: "joao123",
  cargo: "estudante",
  iat: 1701234567,
  exp: 1701839367
}

// Uso na rota:
const { userId } = request.user as JWTPayload;
```

---

## ⚙️ Configurações (src/config/env.ts)

```typescript
export const config = {
  jwtSecret: process.env.JWT_SECRET || 'infoscript-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
```

**Variáveis de Ambiente (.env):**
```env
JWT_SECRET=sua-chave-super-secreta-aqui
JWT_EXPIRES_IN=7d  # 7 dias, ou: 1h, 30m, 60s
```

---

## ⏰ Expiração de Sessão

### Como Funciona

```
Login: 29/11/2024 10:00:00
Token criado com expiresIn: '7d'
Token expira: 06/12/2024 10:00:00

Timeline:
├─ 29/11 10:00 - Login ✅
├─ 30/11 15:30 - Curtir postagem ✅ (token válido)
├─ 02/12 09:00 - Seguir usuário ✅ (token válido)
├─ 06/12 09:59 - Toggle curtida ✅ (token válido)
└─ 06/12 10:01 - Toggle curtida ❌ (token expirado!)
    └─ Resposta: 401 "Token inválido ou expirado"
```

### Quando Token Expira:

```typescript
// Requisição após 7 dias:
await request.jwtVerify();
// ❌ Lança erro: TokenExpiredError

// Middleware retorna:
{
  "success": false,
  "error": "Token inválido ou expirado. Faça login novamente."
}

// Frontend deve:
1. Detectar erro 401
2. Redirecionar para /login
3. Pedir credenciais novamente
4. Obter novo token
```

---

## 🎯 Resumo do Fluxo

### Login
```
POST /usuarios/login
→ Valida credenciais
→ Gera token JWT
→ Token válido por 7 dias
→ Cliente salva token
```

### Requisição Autenticada
```
POST /usuarios/toggle-seguir
Header: Authorization: Bearer <token>
→ Middleware authenticate() executa
→ Token é verificado (assinatura + expiração)
→ Se válido: request.user populado, rota executa
→ Se inválido: 401 Unauthorized
```

### Requisição Opcional
```
GET /postagens
Header: Authorization: Bearer <token> (opcional)
→ Middleware optionalAuthenticate() executa
→ Com token: request.user populado, feed personalizado
→ Sem token: request.user undefined, feed geral
→ Nunca retorna erro!
```

---

## 🔧 Como Funciona Tecnicamente

### @fastify/jwt Plugin

```typescript
// 1. Registra plugin
fastify.register(jwt, { secret: '...' });

// 2. Plugin adiciona métodos ao Fastify:
fastify.jwt.sign(payload)     // Gerar token
fastify.jwt.verify(token)     // Verificar token
request.jwtVerify()           // Verificar token do request
request.user                  // Dados decodificados

// 3. Plugin lê header automaticamente:
Authorization: Bearer <token>
               ^^^^^^^^^^^^^^
               Extrai essa parte
```

---

## ⚠️ Importante: Não Há Sessão no Servidor!

### Stateless vs Stateful

**❌ Sessão Stateful (tradicional):**
```
Servidor guarda sessões em memória/Redis:
{
  sessionId: "abc123",
  userId: "674a1234",
  expira: "2024-12-06"
}
```

**✅ Sessão Stateless (JWT - usado aqui):**
```
Servidor NÃO guarda nada!
Token contém tudo:
{
  userId: "674a1234",
  cargo: "estudante",
  exp: 1701839367
}
```

**Vantagens JWT:**
- ✅ Servidor não precisa guardar estado
- ✅ Escalável (múltiplos servidores sem sincronização)
- ✅ Performance (sem consulta ao banco/Redis)
- ✅ Simples

**Desvantagens JWT:**
- ⚠️ Não pode "invalidar" token antes da expiração
- ⚠️ Token roubado é válido até expirar
- ⚠️ Precisa fazer logout no cliente apenas

---

## 🛡️ Segurança

### O que o JWT Protege:

✅ **Autenticidade:** Token só pode ser criado pelo servidor (secret)  
✅ **Integridade:** Se modificar, assinatura fica inválida  
✅ **Expiração:** Token expira automaticamente  

### O que NÃO protege:

❌ **Confidencialidade:** Payload é Base64, não criptografado (visível)  
❌ **Revogação:** Não pode invalidar antes de expirar  

**Por isso:**
- ✅ Não coloque dados sensíveis no payload (senha, CPF, etc)
- ✅ Use HTTPS em produção
- ✅ Token expira em 7 dias (não muito longo)

---

## 🎉 Conclusão

**Validação de Sessão no InfoScript:**

1. **Stateless** - Sem estado no servidor
2. **JWT** - Token auto-contido
3. **Middleware** - Valida automaticamente
4. **7 dias** - Expiração configurável
5. **Seguro** - Assinatura + expiração

**Quando expira:** Usuário faz login novamente e obtém novo token.

---

**Arquivo:** `COMO-FUNCIONA-SESSAO.md`  
**Data:** 29 de Novembro de 2024


