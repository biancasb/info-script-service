# Como Autenticar no Swagger

Guia rapido para usar o Swagger com rotas protegidas via JWT.

## Passos principais
1) Abrir o Swagger: http://localhost:3000/documentacao
2) (Opcional) Criar usuario: POST /usuarios com body de exemplo abaixo
3) Login: POST /usuarios/login e copiar o campo `token`
4) Autorizar: clicar em Authorize, colar o token sem escrever Bearer, confirmar
5) Testar rotas protegidas: enviar bodies e executar

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
- Publicas: demais rotas (usuarios, materias, postagens publicas)

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

---

## Exemplo Completo de Fluxo

### Cenário: Seguir um usuário e curtir sua postagem

```
1. Criar usuário A (você)
   POST /usuarios
   {
     "nome": "João Silva",
     "nickname": "joao",
     "senha": "123",
     "anoIngresso": 2023,
     "cargo": "estudante"
   }
   Resposta: { ..., "_id": "ID_A" }

2. Criar usuário B (outro)
   POST /usuarios
   {
     "nome": "Maria Santos",
     "nickname": "maria",
     "senha": "456",
     "anoIngresso": 2023,
     "cargo": "estudante"
   }
   Resposta: { ..., "_id": "ID_B" }

3. Fazer login com usuário A
   POST /usuarios/login
   {
     "nickname": "joao",
     "senha": "123"
   }
   Resposta: { ..., "token": "TOKEN_A" }

4. Autorizar no Swagger com TOKEN_A
   Clique em "Authorize" -> Cole TOKEN_A -> Authorize -> Close

5. Seguir usuário B
   POST /usuarios/toggle-seguir
   {
     "targetUserId": "ID_B"
   }
   Resposta: { "success": true, "action": "seguiu" }

6. Usuário B criar uma postagem
   POST /postagens
   {
     "titulo": "Olá mundo!",
     "texto": "Minha primeira postagem",
     "tag": "Geral",
     "autorId": "ID_B"
   }
   Resposta: { ..., "_id": "ID_POST" }

7. Curtir a postagem (ainda como usuário A autenticado)
   POST /postagens/toggle-curtida
   {
     "postagemId": "ID_POST"
   }
   Resposta: { "success": true, "action": "curtiu" }

8. Ver feed personalizado
   GET /postagens
   Resposta: {
     "authenticated": true,
     "feedType": "personalizado",
     "data": [ ]
   }
```

---

## Pronto!

Agora você sabe como autenticar no Swagger.

Resumo:
1. Login: Copie o token
2. Authorize: Cole o token no Swagger
3. Teste: Use rotas protegidas!

---

Documentação: COMO-AUTENTICAR-SWAGGER.md  
Data: 01/12/2025  
API: InfoScript Backend v1.0.0


