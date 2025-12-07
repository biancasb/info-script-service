# Como Funciona a Sessao (JWT)

O backend usa JWT e nao guarda sessao no servidor. O token leva os dados do usuario e expira em 7 dias.

## Fluxo rapido
1) Criar usuario: POST /usuarios
2) Login: POST /usuarios/login (retorna token e expiresIn)
3) Rotas protegidas: enviar header `Authorization: Bearer <token>`

## Onde configurar
- `src/config/env.ts`: JWT_SECRET, JWT_EXPIRES_IN
- `src/middlewares/auth.ts`: authenticate e optionalAuthenticate
- `src/index.ts`: registro do plugin @fastify/jwt

## Rotas conforme autenticacao
- Protegidas: POST /usuarios/toggle-seguir, POST /postagens/toggle-curtida
- Autenticacao opcional: GET /postagens
- Publicas: GET /usuarios, POST /usuarios, POST /usuarios/login, GET /materias, GET /postagens/:id

## Como autorizar no Swagger
1) Fazer login em POST /usuarios/login
2) Copiar o campo token
3) Clicar em Authorize, colar o token (sem escrever Bearer) e confirmar

## Exemplo via curl
```bash
curl -X POST http://localhost:3000/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{ "nickname": "joao", "senha": "senha123" }'

TOKEN="coloque_o_token_aqui"

curl -X POST http://localhost:3000/postagens/toggle-curtida \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "postagemId": "ID_DA_POSTAGEM" }'
```

## Erros comuns
- 401 token invalido ou expirado: refaca login e reautorize
- 401 token ausente: adicionar header Authorization: Bearer <token>

## Dicas
- Nao coloque dados sensiveis no payload do token
- Use HTTPS em producao
- Para testar sem auth no Swagger, clique em Logout no modal Authorize
