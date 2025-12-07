# InfoScript Backend API

API REST para rede social acadêmica com autenticação JWT, matérias, postagens e seguir/seguidores.

---

## Inicio rapido

### Pre-requisitos
- Node.js 18+
- MongoDB 6+
- npm ou yarn

### Instalacao

```bash
git clone https://github.com/biancasb/info-script-service.git
cd info-script-service
npm install
cp .env.example .env  # ajuste as variaveis
npm run dev
```

Servidor: http://localhost:3000

---

## Documentacao

- Swagger UI: http://localhost:3000/documentacao
- Guias: `docs/ARQUITETURA.md`, `docs/AUTENTICACAO.md`, `docs/SWAGGER.md`

---

## Funcionalidades

### Usuarios
- CRUD de usuarios
- Login JWT (7 dias)
- Perfis: estudante e professor
- Seguir/deixar de seguir

### Materias
- CRUD (apenas professores)
- Matricular/desmatricular estudantes (apenas professores)
- Listagem por usuario (criadas ou matriculadas)

### Postagens
- CRUD
- Feed personalizado (com token) ou geral (sem token)
- Curtir/descurtir
- Filtro por materia/tag
- Ranking de curtidas

---

## Autenticacao

### Login
```http
POST /usuarios/login
Content-Type: application/json

{
  "nickname": "joao123",
  "senha": "senha123"
}
```

Resposta:
```json
{
  "success": true,
  "token": "eyJ...",
  "expiresIn": "7d",
  "user": { ... }
}
```

### Usando o token
```http
GET /postagens
Authorization: Bearer eyJ...
```

---

## Endpoints principais

### Usuarios
| Metodo | Endpoint | Descricao | Auth |
|--------|----------|-----------|------|
| POST | `/usuarios` | Criar usuario | Nao |
| POST | `/usuarios/login` | Fazer login | Nao |
| GET | `/usuarios` | Listar usuarios | Nao |
| GET | `/usuarios/:id` | Buscar por ID | Nao |
| POST | `/usuarios/toggle-seguir` | Seguir/deixar de seguir | Sim |

### Materias
| Metodo | Endpoint | Descricao | Auth |
|--------|----------|-----------|------|
| GET | `/materias` | Listar materias | Nao |
| GET | `/materias/usuario/:id` | Materias do usuario | Nao |
| POST | `/materias` | Criar materia | Professor |
| POST | `/materias/:id/matricular` | Matricular estudante | Professor |

### Postagens
| Metodo | Endpoint | Descricao | Auth |
|--------|----------|-----------|------|
| GET | `/postagens` | Feed | Opcional |
| GET | `/postagens/:id` | Buscar por ID | Nao |
| POST | `/postagens` | Criar postagem | Nao* |
| POST | `/postagens/toggle-curtida` | Curtir/descurtir | Sim |

*Estudantes precisam estar matriculados em pelo menos uma materia para postar.

---

## INFORMACAO IMPORTANTE PARA RODAR AS TAGS - LEIA AQUI

Para popular as materias usadas como tags nas postagens:

```bash
npm run seed:materias
```

Requisitos: MongoDB ativo, variaveis `.env` configuradas. O script `scripts/seed-materias.ts` cria/atualiza as materias base para que os filtros de tag funcionem.

---

## Arquitetura (visao geral)

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

Tecnologias: Fastify, TypeScript, MongoDB, JWT (@fastify/jwt), Swagger/OpenAPI, JSON Schema.

---

## Scripts

```bash
npm run dev         # desenvolvimento
npm run build       # build
npm start           # rodar build
npm run lint        # lint
npm run format      # formatar
npm run seed:materias  # popular materias base
```

---

## Variaveis de ambiente

Crie `.env` na raiz:

```env
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=infoscript
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

---

## Testando a API

### Com Swagger UI
1) Acesse `http://localhost:3000/documentacao`
2) Login em `POST /usuarios/login`
3) Copie o token
4) Clique em Authorize e cole o token (sem escrever Bearer)
5) Execute as rotas protegidas

### Com cURL
```bash
TOKEN=$(curl -X POST http://localhost:3000/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"nickname":"joao123","senha":"senha123"}' \
  | jq -r '.token')

curl -X GET http://localhost:3000/postagens \
  -H "Authorization: Bearer $TOKEN"
```

---

## Docker

```bash
docker-compose up -d
docker-compose logs -f
docker-compose down
```

---

## Contribuindo

1. Fork
2. Branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m "Adiciona nova funcionalidade"`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

## Licenca

ISC

---

## Autores

- InfoScript Team

---

Versao: 2.0.0  
Ultima atualizacao: 07/12/2025
