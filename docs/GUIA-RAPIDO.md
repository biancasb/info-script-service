# ⚡ Guia Rápido - InfoScript Backend

Referência rápida para desenvolvedores.

---

## 🚀 Comandos Essenciais

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start

# Lint
npm run lint

# Format
npm run format
```

---

## 📡 Endpoints Principais

### Autenticação
```http
POST /usuarios/login
{
  "nickname": "joao123",
  "senha": "senha123"
}
→ Retorna token JWT
```

### Usuários
```http
GET    /usuarios                      # Listar todos
GET    /usuarios/:id                  # Buscar por ID
POST   /usuarios                      # Criar
PUT    /usuarios/:id                  # Atualizar
DELETE /usuarios/:id                  # Deletar
POST   /usuarios/toggle-seguir        # Seguir/deixar (auth)
GET    /usuarios/:id/seguindo         # Lista quem segue
GET    /usuarios/:id/seguidores       # Lista seguidores
```

### Matérias
```http
GET    /materias                      # Listar todas
GET    /materias/:id                  # Buscar por ID
GET    /materias/usuario/:id          # Matérias do usuário
POST   /materias                      # Criar (professor)
PUT    /materias/:id                  # Atualizar (professor)
DELETE /materias/:id                  # Deletar (professor)
POST   /materias/:id/matricular       # Matricular (professor)
DELETE /materias/:id/desmatricular    # Desmatricular (professor)
```

### Postagens
```http
GET    /postagens?tag=Math            # Feed (auth opcional)
GET    /postagens/:id                 # Buscar por ID
GET    /postagens/usuario/:id         # Por usuário
GET    /postagens/tag/:tag            # Por matéria
POST   /postagens                     # Criar
PUT    /postagens/:id                 # Atualizar
DELETE /postagens/:id                 # Deletar
POST   /postagens/toggle-curtida      # Curtir/descurtir (auth)
GET    /postagens/:id/curtidas        # Listar curtidas
GET    /postagens/ranking/curtidas    # Top 20
```

---

## 🔐 Autenticação

### Header
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Rotas que Requerem Auth
- `POST /usuarios/toggle-seguir`
- `POST /postagens/toggle-curtida`

### Rotas com Auth Opcional
- `GET /postagens` (muda comportamento se autenticado)

---

## 📁 Estrutura de Código

### Adicionar Nova Rota

```typescript
// 1. Criar em src/routes/minha-rota.ts
import { FastifyInstance } from 'fastify';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import { successResponse, errorResponse } from '../utils';

export async function minhaRoute(fastify: FastifyInstance) {
  fastify.get('/exemplo', async (request, reply) => {
    try {
      // Sua lógica
      return successResponse(data);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(
        errorResponse(ERROR_MESSAGES.INTERNAL_ERROR)
      );
    }
  });
}

// 2. Registrar em src/index.ts
import { minhaRoute } from './routes/minha-rota';
await fastify.register(minhaRoute);
```

### Usar Constantes

```typescript
import { ERROR_MESSAGES, HTTP_STATUS, COLLECTIONS } from '../constants';

// Mensagens
ERROR_MESSAGES.USER_NOT_FOUND
SUCCESS_MESSAGES.USER_CREATED

// Status codes
HTTP_STATUS.OK
HTTP_STATUS.NOT_FOUND

// Coleções
COLLECTIONS.USUARIOS
COLLECTIONS.POSTAGENS
```

### Usar Utils

```typescript
import { 
  isValidObjectId,
  successResponse,
  errorResponse,
  findById 
} from '../utils';

// Validação
if (!isValidObjectId(id)) {
  return errorResponse('ID inválido');
}

// Busca no DB
const user = await findById(collection, userId);

// Resposta
return successResponse(data, 'Sucesso!');
```

### Usar Middlewares

```typescript
import { authenticate } from '../middlewares';

// Rota protegida
fastify.post('/rota', {
  onRequest: [fastify.authenticate]
}, async (request, reply) => {
  const { userId } = request.user as JWTPayload;
  // ...
});
```

---

## 🗄️ MongoDB

### Conectar
```typescript
import { getDatabase } from '../config/database';

const db = getDatabase();
const collection = db.collection('usuarios');
```

### Operações Comuns

```typescript
// Buscar
const user = await collection.findOne({ _id: new ObjectId(id) });

// Listar
const users = await collection.find().toArray();

// Criar
await collection.insertOne(newUser);

// Atualizar
await collection.updateOne(
  { _id: new ObjectId(id) },
  { $set: { nome: 'Novo Nome' } }
);

// Deletar
await collection.deleteOne({ _id: new ObjectId(id) });

// Aggregation
const results = await collection.aggregate([
  { $match: { ... } },
  { $sort: { criadoEm: -1 } }
]).toArray();
```

---

## 🎨 Swagger Schema

### Adicionar Schema

```typescript
// src/schemas/exemplo.schema.ts
export const exemploSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    nome: { type: 'string' },
    ativo: { type: 'boolean' }
  }
};

// Usar na rota
fastify.get('/exemplo', {
  schema: {
    tags: ['Exemplos'],
    description: 'Retorna exemplo',
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: exemploSchema
        }
      }
    }
  }
}, handler);
```

---

## 🔧 Debugging

### Logs

```typescript
// Fastify já tem logger integrado
fastify.log.info('Informação');
fastify.log.error('Erro');
fastify.log.warn('Aviso');
fastify.log.debug('Debug');
```

### MongoDB Queries

```typescript
// Ver query no console
const query = { nome: 'João' };
console.log('Query:', JSON.stringify(query, null, 2));
const result = await collection.find(query).toArray();
```

---

## ⚠️ Checklist antes de Commit

- [ ] Código sem erros de linting (`npm run lint`)
- [ ] Código formatado (`npm run format`)
- [ ] Testes passando (`npm test`)
- [ ] Sem console.log desnecessários
- [ ] Documentação atualizada
- [ ] CHANGELOG atualizado (se aplicável)
- [ ] Mensagem de commit semântica

---

## 📚 Recursos Rápidos

### Constantes
```
src/constants/messages.ts    # Todas as mensagens
src/constants/http-status.ts # Status codes
src/constants/collections.ts # Nomes de coleções
```

### Utils
```
src/utils/validation.ts      # Validações
src/utils/response.ts        # Respostas padronizadas
src/utils/database.ts        # Helpers MongoDB
```

### Middlewares
```
src/middlewares/auth.ts           # Autenticação
src/middlewares/error-handler.ts  # Error handling
```

---

## 🎯 Boas Práticas

### DO ✅
- Use constantes do `constants/`
- Use utils para lógica reutilizável
- Escreva comentários JSDoc
- Retorne respostas padronizadas
- Use tipagem forte
- Valide inputs
- Log erros apropriadamente

### DON'T ❌
- Hardcode mensagens
- Repita código
- Use `any` sem necessidade
- Ignore erros
- Exponha dados sensíveis (senhas)
- Faça queries síncronas

---

## 🚨 Troubleshooting

### Servidor não inicia
```bash
# Verifica porta em uso
netstat -ano | findstr :3000

# Mata processo
taskkill /F /PID <PID>
```

### MongoDB não conecta
```bash
# Verifica se está rodando
mongosh

# Inicia MongoDB
mongod
```

### Erro de dependências
```bash
# Limpa e reinstala
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Ajuda

- 📖 [Documentação Completa](../README.md)
- 🏗️ [Arquitetura](ARQUITETURA.md)
- 🔐 [Autenticação](AUTENTICACAO.md)
- 🤝 [Contribuindo](CONTRIBUINDO.md)

---

**Dica:** Mantenha este guia aberto enquanto desenvolve! 🚀

