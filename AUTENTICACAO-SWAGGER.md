# Autenticacao no Swagger

Guia rapido para testar rotas protegidas via JWT no Swagger.

## Passos principais
1) Abrir Swagger: http://localhost:3000/documentacao
2) (Opcional) Criar usuario: POST /usuarios
3) Login: POST /usuarios/login e copiar o `token`
4) Autorizar: clicar em Authorize, colar o token (sem escrever Bearer) e confirmar
5) Testar rotas protegidas

## Corpos de exemplo
### Criar usuario (POST /usuarios)
```json
{
  "nome": "Joao Silva",
  "nickname": "joao_silva",
  "senha": "senha123",
  "anoIngresso": 2023,
  "cargo": "estudante"
}
```

### Login (POST /usuarios/login)
```json
{
  "nickname": "joao_silva",
  "senha": "senha123"
}
```

### Seguir usuario (POST /usuarios/toggle-seguir)
```json
{
  "targetUserId": "ID_DO_OUTRO_USUARIO"
}
```

### Curtir postagem (POST /postagens/toggle-curtida)
```json
{
  "postagemId": "ID_DA_POSTAGEM"
}
```

## Rotas e autenticacao
- Obrigatoria: POST /usuarios/toggle-seguir, POST /postagens/toggle-curtida
- Opcional (muda resposta se tiver token): GET /postagens
- Publicas: demais rotas abertas

## Como autorizar no Swagger
1) Fazer login e copiar o token
2) Clicar em Authorize
3) Colar o token (somente o token, sem Bearer)
4) Confirmar

## Erros comuns
- 401 token invalido ou expirado: refaca login e reautorize
- 401 sem token: colar o token em Authorize
- Token vazio/undefined: copiar novamente o campo `token` da resposta de login

## Dicas
- Token vale 7 dias (JWT_EXPIRES_IN)
- Use HTTPS em producao
- Para testar sem autenticacao, clique em Logout na modal Authorize
