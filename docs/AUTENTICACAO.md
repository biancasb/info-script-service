# 🔐 Sistema de Autenticação JWT - InfoScript Backend

## Implementação Completa

O sistema de autenticação JWT foi implementado com sucesso na API InfoScript Backend, permitindo sessões seguras e controle de acesso às rotas.

---

## 🎯 Funcionalidades Implementadas

### 1. **Login com JWT**
- Endpoint: `POST /usuarios/login`
- Retorna token JWT válido por 7 dias
- Token contém: userId, nickname e cargo do usuário

### 2. **Middlewares de Autenticação**
- **`authenticate`**: Autenticação obrigatória (retorna erro 401 se token inválido)
- **`optionalAuthenticate`**: Autenticação opcional (continua sem erro se não autenticado)

### 3. **Rotas Protegidas**
Rotas que **requerem autenticação**:
- `POST /usuarios/toggle-seguir` - Toggle seguir/deixar de seguir
- `POST /postagens/toggle-curtida` - Toggle curtir/descurtir
- Outras rotas especificadas com `onRequest: [fastify.authenticate]`

### 4. **Rotas com Autenticação Opcional**
Rotas que **funcionam com ou sem autenticação**:
- `GET /postagens` - Feed unificado (personalizado se autenticado, geral se não)

---

## 📝 Como Usar

### 1. Fazer Login

**Request:**
```bash
POST /usuarios/login
Content-Type: application/json

{
  "nickname": "joao123",
  "senha": "senha123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "7d",
  "user": {
    "_id": "674a1234567890abcdef1234",
    "nome": "João Silva",
    "nickname": "joao123",
    "cargo": "estudante",
    "anoIngresso": 2024
  }
}
```

### 2. Usar o Token em Requisições

Adicione o token no header `Authorization`:

```bash
GET /postagens
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

ou

```bash
POST /usuarios/toggle-seguir
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "targetUserId": "674a5555666677778888bbbb"
}
```

---

## 🔒 Rotas por Tipo de Autenticação

### Autenticação Obrigatória ✅

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/usuarios/toggle-seguir` | Toggle seguir/deixar de seguir |
| POST | `/postagens/toggle-curtida` | Toggle curtir/descurtir |

### Autenticação Opcional 🔓✅

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/postagens` | Feed (personalizado se auth, geral se não) |

### Sem Autenticação 🔓

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/usuarios` | Criar usuário |
| POST | `/usuarios/login` | Fazer login |
| GET | `/usuarios` | Listar usuários |
| GET | `/materias` | Listar matérias |
| etc... | ... | Demais rotas públicas |

---

## 🔄 APIs Consolidadas

### 1. **Seguir/Deixar de Seguir → Toggle**

**Antes:**
- `POST /usuarios/seguir` (body: usuarioId, seguirId)
- `POST /usuarios/deixar-de-seguir` (body: usuarioId, deixarDeSeguirId)
- `GET /usuarios/:usuarioId/segue/:outroUsuarioId` ❌ Removido

**Agora:**
- `POST /usuarios/toggle-seguir` (body: targetUserId) ✅
  - Se já está seguindo → deixa de seguir
  - Se não está seguindo → segue
  - Retorna ação realizada: `"seguiu"` ou `"deixou_de_seguir"`

**Exemplo:**
```bash
POST /usuarios/toggle-seguir
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetUserId": "674a5555666677778888bbbb"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Você agora está seguindo Maria Santos (@maria_s)",
  "action": "seguiu"
}
```

### 2. **Curtir/Descurtir → Toggle**

**Antes:**
- `POST /postagens/curtir` (body: usuarioId, postagemId)
- `POST /postagens/descurtir` (body: usuarioId, postagemId)
- `GET /postagens/:postagemId/curtiu/:usuarioId` ❌ Removido

**Agora:**
- `POST /postagens/toggle-curtida` (body: postagemId) ✅
  - Se já curtiu → descurte
  - Se não curtiu → curte
  - Retorna ação realizada: `"curtiu"` ou `"descurtiu"`

**Exemplo:**
```bash
POST /postagens/toggle-curtida
Authorization: Bearer <token>
Content-Type: application/json

{
  "postagemId": "674b1234567890abcdef5678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Postagem curtida com sucesso",
  "action": "curtiu",
  "totalCurtidas": 15
}
```

### 3. **Feed Personalizado → Feed Unificado**

**Antes:**
- `GET /postagens/feed/:usuarioId` (feed personalizado)
- `GET /postagens` (todas as postagens)

**Agora:**
- `GET /postagens?tag=Matemática` ✅
  - **Com autenticação**: Feed personalizado (usuário + quem ele segue)
  - **Sem autenticação**: Feed geral (todas as postagens)
  - Parâmetro opcional `tag` para filtrar por matéria

**Exemplo com autenticação:**
```bash
GET /postagens?tag=Física
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 12,
  "authenticated": true,
  "feedType": "personalizado",
  "data": [...]
}
```

**Exemplo sem autenticação:**
```bash
GET /postagens
```

**Response:**
```json
{
  "success": true,
  "count": 50,
  "authenticated": false,
  "feedType": "geral",
  "data": [...]
}
```

### 4. **Matérias por Usuário → Consolidada**

**Antes:**
- `GET /materias/estudante/:estudanteId`
- `GET /materias/professor/:professorId`

**Agora:**
- `GET /materias/usuario/:usuarioId` ✅
  - Detecta automaticamente se é estudante ou professor
  - **Estudante**: Retorna matérias em que está matriculado
  - **Professor**: Retorna matérias que criou

**Exemplo:**
```bash
GET /materias/usuario/674a5555666677778888bbbb
```

**Response (Estudante):**
```json
{
  "success": true,
  "count": 3,
  "usuarioId": "674a5555666677778888bbbb",
  "cargo": "estudante",
  "tipo": "matriculadas",
  "data": [...]
}
```

**Response (Professor):**
```json
{
  "success": true,
  "count": 5,
  "usuarioId": "674a1111222233334444aaaa",
  "cargo": "professor",
  "tipo": "criadas",
  "data": [...]
}
```

---

## ⚙️ Configuração

### Variáveis de Ambiente

Adicione ao arquivo `.env`:

```env
JWT_SECRET=sua-chave-secreta-aqui
JWT_EXPIRES_IN=7d
```

**Importante:** Em produção, use uma chave secreta forte e única!

### Valores Padrão

Se não configurado no `.env`:
- `JWT_SECRET`: `"infoscript-secret-key-change-in-production"`
- `JWT_EXPIRES_IN`: `"7d"` (7 dias)

---

## 🔐 Segurança

### Payload do JWT

```typescript
{
  userId: string;      // ID do usuário
  nickname: string;    // Username
  cargo: 'estudante' | 'professor';  // Tipo de usuário
  iat: number;         // Timestamp de criação
  exp: number;         // Timestamp de expiração
}
```

### Tratamento de Erros

**Token Inválido ou Expirado:**
```json
{
  "success": false,
  "error": "Token inválido ou expirado. Faça login novamente."
}
```

**Sem Permissão:**
```json
{
  "success": false,
  "error": "Apenas professores podem criar matérias"
}
```

---

## 📊 Impacto nas APIs

### Resumo das Mudanças

| Tipo | Antes | Agora | Mudança |
|------|-------|-------|---------|
| Seguir/Deixar | 2 APIs + 1 verificação | 1 API toggle | ✅ Simplificado |
| Curtir/Descurtir | 2 APIs + 1 verificação | 1 API toggle | ✅ Simplificado |
| Feed | 2 APIs separadas | 1 API unificada | ✅ Inteligente |
| Matérias | 2 APIs separadas | 1 API unificada | ✅ Detecta tipo |

### APIs Removidas

❌ `POST /usuarios/seguir`  
❌ `POST /usuarios/deixar-de-seguir`  
❌ `GET /usuarios/:usuarioId/segue/:outroUsuarioId`  
❌ `POST /postagens/curtir`  
❌ `POST /postagens/descurtir`  
❌ `GET /postagens/:postagemId/curtiu/:usuarioId`  
❌ `GET /postagens/feed/:usuarioId`  
❌ `GET /materias/estudante/:estudanteId`  
❌ `GET /materias/professor/:professorId`  

### APIs Adicionadas

✅ `POST /usuarios/toggle-seguir` (requer auth)  
✅ `POST /postagens/toggle-curtida` (requer auth)  
✅ `GET /postagens` (auth opcional, comportamento inteligente)  
✅ `GET /materias/usuario/:usuarioId` (detecta tipo)  

---

## 🚀 Testando

### No Swagger

1. Acesse `http://localhost:3000/documentacao`
2. Faça login em `POST /usuarios/login`
3. Copie o token retornado
4. Clique no botão "Authorize" (cadeado) no topo
5. Cole o token no formato: `Bearer <seu-token>`
6. Clique em "Authorize"
7. Teste as rotas protegidas!

### Via cURL

```bash
# 1. Login
curl -X POST http://localhost:3000/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"nickname":"joao123","senha":"senha123"}'

# 2. Copie o token e use nas requisições
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 3. Toggle seguir
curl -X POST http://localhost:3000/usuarios/toggle-seguir \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"targetUserId":"674a5555666677778888bbbb"}'

# 4. Feed personalizado
curl -X GET "http://localhost:3000/postagens?tag=Matemática" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📚 Benefícios

### 1. **Segurança**
- Tokens JWT seguros
- Sessões com expiração automática
- Proteção de rotas sensíveis

### 2. **UX Melhorado**
- APIs toggle mais intuitivas
- Comportamento inteligente baseado em autenticação
- Menos requisições necessárias

### 3. **Código Limpo**
- Menos código duplicado
- Lógica consolidada
- Mais fácil de manter

### 4. **Performance**
- Menos endpoints para gerenciar
- Validações otimizadas
- Queries mais eficientes

---

**Versão da API:** 2.0.0  
**Data da Implementação:** 29 de Novembro de 2024

