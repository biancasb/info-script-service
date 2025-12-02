# 🎓 InfoScript Backend API

API REST completa para rede social acadêmica com autenticação JWT, gerenciamento de matérias, postagens e sistema de seguir/seguidores.

---

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+ 
- MongoDB 6+
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/infoscript-back.git
cd infoscript-back

# Instale as dependências
npm install

# Configure as variáveis de ambiente (opcional)
cp .env.example .env

# Inicie o MongoDB (se local)
# mongod

# Inicie o servidor de desenvolvimento
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

---

## 📚 Documentação

### Swagger UI
Acesse a documentação interativa completa:
```
http://localhost:3000/documentacao
```

### Guias
- [🏗️ Arquitetura](docs/ARQUITETURA.md) - Estrutura e padrões do projeto
- [🔐 Autenticação](docs/AUTENTICACAO.md) - Sistema JWT e sessões
- [📖 Swagger](docs/SWAGGER.md) - Como usar a documentação

---

## ✨ Funcionalidades

### 👥 Usuários
- ✅ Criar, ler, atualizar e deletar usuários
- ✅ Login com JWT (token válido por 7 dias)
- ✅ Dois tipos: `estudante` e `professor`
- ✅ Sistema de seguir/deixar de seguir (toggle)

### 📚 Matérias
- ✅ CRUD de matérias (apenas professores)
- ✅ Matricular/desmatricular estudantes (apenas professores)
- ✅ Listar matérias por usuário (automático: criadas ou matriculadas)

### 📝 Postagens
- ✅ CRUD de postagens
- ✅ Feed personalizado (autenticado) ou geral (não autenticado)
- ✅ Curtir/descurtir postagens (toggle)
- ✅ Filtrar por matéria/tag
- ✅ Ranking de mais curtidas

---

## 🔐 Autenticação

### Login
```http
POST /usuarios/login
Content-Type: application/json

{
  "nickname": "joao123",
  "senha": "senha123"
}
```

**Resposta:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "7d",
  "user": { ... }
}
```

### Usando o Token
```http
GET /postagens
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Endpoints Principais

### Usuários
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/usuarios` | Criar usuário | Não |
| POST | `/usuarios/login` | Fazer login | Não |
| GET | `/usuarios` | Listar usuários | Não |
| GET | `/usuarios/:id` | Buscar por ID | Não |
| POST | `/usuarios/toggle-seguir` | Seguir/deixar de seguir | ✅ Sim |

### Matérias
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/materias` | Listar matérias | Não |
| GET | `/materias/usuario/:id` | Matérias do usuário | Não |
| POST | `/materias` | Criar matéria | ✅ Professor |
| POST | `/materias/:id/matricular` | Matricular estudante | ✅ Professor |

### Postagens
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/postagens` | Feed (inteligente) | Opcional |
| GET | `/postagens/:id` | Buscar por ID | Não |
| POST | `/postagens` | Criar postagem | Não* |
| POST | `/postagens/toggle-curtida` | Curtir/descurtir | ✅ Sim |

*Estudantes precisam estar matriculados em ≥1 matéria

---

## 🏗️ Arquitetura

```
src/
├── config/         # Configurações (DB, env)
├── constants/      # Constantes e mensagens
├── middlewares/    # Autenticação e error handler
├── routes/         # Endpoints da API
├── schemas/        # Validações Swagger
├── types/          # Tipos TypeScript
└── utils/          # Funções utilitárias
```

### Tecnologias
- **Runtime:** Node.js + TypeScript
- **Framework:** Fastify
- **Banco de Dados:** MongoDB
- **Autenticação:** JWT (@fastify/jwt)
- **Documentação:** Swagger/OpenAPI
- **Validação:** JSON Schema

---

## 🛠️ Scripts

```bash
# Desenvolvimento (hot reload)
npm run dev

# Build para produção
npm run build

# Rodar produção
npm start

# Linting
npm run lint

# Formatação
npm run format
```

---

## 🔧 Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
# Servidor
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=infoscript

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

---

## 📂 Estrutura do Banco de Dados

### Collections

**usuarios**
```javascript
{
  _id: ObjectId,
  nome: String,
  nickname: String (unique),
  senha: String (hash bcrypt),
  anoIngresso: Number,
  cargo: "estudante" | "professor",
  seguindo: [ObjectId],
  seguidores: [ObjectId],
  criadoEm: Date,
  atualizadoEm: Date
}
```

**materias**
```javascript
{
  _id: ObjectId,
  nome: String (unique),
  descricao: String,
  professorId: ObjectId,
  professorNome: String,
  estudantesMatriculados: [ObjectId],
  criadoEm: Date,
  atualizadoEm: Date
}
```

**postagens**
```javascript
{
  _id: ObjectId,
  titulo: String,
  texto: String,
  tag: String (matéria),
  autorId: ObjectId,
  autorNome: String,
  autorNickname: String,
  curtidas: [ObjectId],
  criadoEm: Date,
  atualizadoEm: Date
}
```

---

## 🎯 Regras de Negócio

### Postagens
- ✅ **Estudantes:** Devem estar matriculados em ≥1 matéria para postar
- ✅ **Professores:** Podem postar sem restrições
- ✅ **Tag:** Deve corresponder a uma matéria cadastrada

### Matérias
- ✅ **Criar/Editar/Deletar:** Apenas professores
- ✅ **Matricular/Desmatricular:** Apenas professores
- ✅ **Visualizar:** Todos

### Feed
- ✅ **Autenticado:** Postagens do usuário + quem ele segue
- ✅ **Não autenticado:** Todas as postagens

---

## 🧪 Testando a API

### Com Swagger UI
1. Acesse `http://localhost:3000/documentacao`
2. Faça login em `POST /usuarios/login`
3. Copie o token retornado
4. Clique no botão "Authorize" (🔒)
5. Cole: `Bearer <seu-token>`
6. Teste as rotas protegidas!

### Com cURL
```bash
# Login
TOKEN=$(curl -X POST http://localhost:3000/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"nickname":"joao123","senha":"senha123"}' \
  | jq -r '.token')

# Usar token
curl -X GET http://localhost:3000/postagens \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🐳 Docker

```bash
# Build e iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença ISC.

---

## 👥 Autores

- **InfoScript Team** - *Desenvolvimento inicial*

---

## 🙏 Agradecimentos

- Fastify pela framework incrível
- MongoDB pela flexibilidade
- Comunidade Open Source

---

**Versão:** 2.0.0  
**Última atualização:** 01/12/2025
