# 🏗️ Arquitetura do Projeto - InfoScript Backend

## 📁 Estrutura de Pastas

```
src/
├── config/              # Configurações da aplicação
│   ├── database.ts     # Configuração MongoDB
│   └── env.ts          # Variáveis de ambiente
│
├── constants/          # Constantes da aplicação
│   ├── collections.ts  # Nomes das coleções MongoDB
│   ├── http-status.ts  # HTTP status codes
│   ├── messages.ts     # Mensagens de erro/sucesso
│   └── index.ts        # Export centralizado
│
├── middlewares/        # Middlewares reutilizáveis
│   ├── auth.ts         # Autenticação JWT
│   ├── error-handler.ts # Tratamento global de erros
│   └── index.ts        # Export centralizado
│
├── routes/             # Rotas da API
│   ├── usuarios.ts     # CRUD usuários + autenticação + seguidores
│   ├── materias.ts     # CRUD matérias + matrículas
│   └── postagens.ts    # CRUD postagens + curtidas
│
├── schemas/            # Schemas de validação (Swagger)
│   ├── usuario.schema.ts
│   ├── materia.schema.ts
│   └── postagem.schema.ts
│
├── types/              # Tipos TypeScript
│   ├── auth.ts         # Tipos de autenticação
│   ├── usuario.ts      # Tipos de usuário
│   ├── materia.ts      # Tipos de matéria
│   ├── postagem.ts     # Tipos de postagem
│   ├── common.ts       # Tipos comuns
│   └── index.ts        # Export centralizado
│
├── utils/              # Funções utilitárias
│   ├── database.ts     # Helpers MongoDB
│   ├── response.ts     # Padronização de respostas
│   ├── validation.ts   # Validações comuns
│   └── index.ts        # Export centralizado
│
└── index.ts            # Ponto de entrada da aplicação
```

---

## 🔄 Fluxo de Requisição

```
Cliente
  ↓
1. Fastify recebe requisição
  ↓
2. Middlewares globais (CORS, JWT)
  ↓
3. Middleware de autenticação (se necessário)
  ↓
4. Validação de schema (Swagger)
  ↓
5. Handler da rota
  ├── Validações com utils/validation
  ├── Operações no banco com utils/database
  └── Resposta padronizada com utils/response
  ↓
6. Error handler (se houver erro)
  ↓
7. Resposta ao cliente
```

---

## 🎯 Princípios de Design

### 1. **Single Responsibility**
Cada arquivo/módulo tem uma responsabilidade única:
- `routes/` → Define endpoints
- `middlewares/` → Lógica reutilizável
- `utils/` → Funções auxiliares
- `constants/` → Valores fixos

### 2. **DRY (Don't Repeat Yourself)**
- Validações em `utils/validation.ts`
- Respostas em `utils/response.ts`
- Mensagens em `constants/messages.ts`
- Operações DB em `utils/database.ts`

### 3. **Separation of Concerns**
- Lógica de negócio separada da configuração
- Tipos separados da implementação
- Constantes separadas do código

### 4. **Clean Code**
- Nomes descritivos
- Funções pequenas e focadas
- Comentários explicativos
- Tipagem forte

---

## 📊 Camadas da Aplicação

```
┌─────────────────────────────────────┐
│         Camada de Apresentação      │
│     (Routes + Schemas Swagger)      │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│       Camada de Aplicação           │
│    (Middlewares + Validations)      │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│         Camada de Negócio           │
│       (Utils + Business Logic)      │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│        Camada de Dados              │
│      (MongoDB + Collections)        │
└─────────────────────────────────────┘
```

---

## 🔐 Autenticação e Autorização

### JWT Token
```typescript
{
  userId: string,
  nickname: string,
  cargo: 'estudante' | 'professor',
  iat: number,
  exp: number
}
```

### Middlewares
- `authenticate` → Obrigatório (401 se inválido)
- `optionalAuthenticate` → Opcional (não retorna erro)
- `requireProfessor` → Verifica se é professor

### Fluxo
1. Login → Gera token JWT (7 dias)
2. Cliente envia token em requisições
3. Middleware valida token
4. Request.user contém dados do usuário

---

## 🗄️ Banco de Dados

### Collections MongoDB
- `usuarios` → Estudantes e professores
- `materias` → Matérias/disciplinas
- `postagens` → Postagens dos usuários

### Relacionamentos
```
Usuario (1) ──┐
              ├── (N) Postagens
Usuario (N) ──┘

Professor (1) ──┐
                ├── (N) Materias
Estudante (N) ──┘

Usuario (N) ──── (N) Usuario (seguindo/seguidores)

Postagem (1) ──── (N) Usuario (curtidas)
```

---

## 🚀 Performance

### Otimizações Implementadas
1. **Índices MongoDB** (a implementar)
   - `usuarios.nickname` (unique)
   - `postagens.autorId`
   - `materias.professorId`

2. **Aggregation Pipelines**
   - Feed de postagens
   - Contagem de curtidas/matrículas
   - Ordenação eficiente

3. **Projeções**
   - Remover campo `senha` nas consultas
   - Retornar apenas campos necessários

4. **Async/Await**
   - Operações não-bloqueantes
   - Múltiplas queries em paralelo (Promise.all)

---

## 📝 Padrões de Código

### Nomenclatura
```typescript
const userId = '123';
function getUserById() {}

interface Usuario {}
type JWTPayload = {};

const ERROR_MESSAGES = {};
const HTTP_STATUS = {};
```

### Imports
```typescript
import { FastifyInstance } from 'fastify';
import { ObjectId } from 'mongodb';

import { config } from '../config/env';

import { Usuario, Cargo } from '../types';

import { isValidObjectId } from '../utils';

import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';
```

### Error Handling
```typescript
try {
  const result = await operation();
  return successResponse(result);
} catch (error) {
  fastify.log.error(error);
  return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(
    errorResponse(ERROR_MESSAGES.INTERNAL_ERROR)
  );
}
```

---

## 🧪 Testes (a implementar)

### Estrutura Sugerida
```
tests/
├── unit/
│   ├── utils/
│   ├── middlewares/
│   └── validators/
├── integration/
│   ├── routes/
│   └── database/
└── e2e/
    └── scenarios/
```

---

## 📚 Documentação

### Swagger
- URL: `http://localhost:3000/documentacao`
- Schemas auto-gerados
- Testável via interface

### Comentários
```typescript
/**
 * Descrição da função
 * @param param1 - Descrição do parâmetro
 * @returns Descrição do retorno
 */
```

---

## 🔧 Manutenção

### Adicionar Nova Rota
1. Criar handler em `src/routes/`
2. Adicionar schema em `src/schemas/`
3. Criar tipos em `src/types/`
4. Registrar em `src/index.ts`

### Adicionar Nova Validação
1. Criar função em `src/utils/validation.ts`
2. Usar nas rotas que precisam

### Adicionar Nova Mensagem
1. Adicionar em `src/constants/messages.ts`
2. Usar via import centralizado

---

**Última atualização:** 01/12/2025

