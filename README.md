# InfoScript Backend API

API REST da rede social acadêmica: autenticação JWT, matérias, postagens e seguir/seguidores.

## Início rápido

Pré-requisitos: Node.js 18+, MongoDB 6+, npm/yarn.

```bash
git clone https://github.com/biancasb/info-script-service.git
cd info-script-service
npm install
cp .env.example .env
npm run dev
```

Servidor: http://localhost:3000

## Documentação

- Swagger UI: http://localhost:3000/documentacao
- Guias: `docs/ARQUITETURA.md`, `docs/AUTENTICACAO.md`, `docs/SWAGGER.md`

## Principais recursos

- Usuários: CRUD, login JWT (7d), seguir/deixar de seguir
- Matérias: CRUD (professores), matricular/desmatricular estudantes, listar por usuário
- Postagens: CRUD, feed geral/personalizado, curtir/descurtir, filtro por tag/matéria, ranking de curtidas

## Autenticação (exemplo)

Login
```http
POST /usuarios/login
Content-Type: application/json

{
  "nickname": "joao123",
  "senha": "senha123"
}
```

Token em requests protegidos
```http
GET /postagens
Authorization: Bearer eyJ...
```

## Endpoints principais

### Usuários
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/usuarios` | Criar usuário | Não |
| POST | `/usuarios/login` | Fazer login | Não |
| GET | `/usuarios` | Listar usuários | Não |
| GET | `/usuarios/:id` | Buscar por ID | Não |
| POST | `/usuarios/toggle-seguir` | Seguir/deixar de seguir | Sim |

### Matérias
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/materias` | Listar matérias | Não |
| GET | `/materias/usuario/:id` | Matérias do usuário | Não |
| POST | `/materias` | Criar matéria | Professor |
| POST | `/materias/:id/matricular` | Matricular estudante | Professor |

### Postagens
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/postagens` | Feed | Opcional |
| GET | `/postagens/:id` | Buscar por ID | Não |
| POST | `/postagens` | Criar postagem | Não* |
| POST | `/postagens/toggle-curtida` | Curtir/descurtir | Sim |

*Estudantes precisam estar matriculados em ao menos uma matéria para postar.

## Seed de matérias (tags) — obrigatório para filtros

```bash
npm run seed:materias
```

Requisitos: MongoDB ativo e `.env` preenchido. O script `scripts/seed-materias.ts` cria/atualiza as matérias base usadas como tags.

## Arquitetura (visão geral)

```
src/
├── config/
├── constants/
├── middlewares/
├── routes/
├── schemas/
├── types/
└── utils/
```

Stack: Fastify, TypeScript, MongoDB, JWT (@fastify/jwt), Swagger/OpenAPI, JSON Schema.

## Scripts

```bash
npm run dev
npm run build
npm start
npm run lint
npm run format
npm run seed:materias
```

## Variáveis de ambiente

`.env` na raiz:

```env
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=infoscript
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

## Testando a API

Swagger UI
1) Acesse `http://localhost:3000/documentacao`
2) Faça login em `POST /usuarios/login`
3) Copie o token
4) Clique em Authorize e cole o token (sem escrever "Bearer")
5) Execute as rotas protegidas

cURL
```bash
TOKEN=$(curl -X POST http://localhost:3000/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"nickname":"joao123","senha":"senha123"}' \
  | jq -r '.token')

curl -X GET http://localhost:3000/postagens \
  -H "Authorization: Bearer $TOKEN"
```

## Docker

```bash
docker-compose up -d
docker-compose logs -f
docker-compose down
```

## Contribuindo

1) Branch: `git checkout -b feature/minha-feature`
2) Commit: `git commit -m "Minha feature"`
3) Push e abra um PR

## Licença e autores

- Licença ISC
- InfoScript Team

Versão: 2.0.0  
Última atualização: 07/12/2025
