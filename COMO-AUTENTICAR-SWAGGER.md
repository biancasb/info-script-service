# 🔐 Como Autenticar no Swagger - Guia Passo a Passo

**InfoScript Backend API**

---

## 📋 Visão Geral

Para testar rotas protegidas (que têm o cadeado 🔒), você precisa primeiro fazer login e depois informar o token JWT no Swagger.

---

## 🎯 Passo a Passo Completo

### **Passo 1: Acesse o Swagger**

```
http://localhost:3000/documentacao
```

---

### **Passo 2: Crie um Usuário (se ainda não tiver)**

**Localize a rota:** `POST /usuarios` (na seção "Usuários")

1. Clique na rota para expandir
2. Clique no botão **"Try it out"** (canto superior direito da rota)
3. No campo "Request body", cole este JSON:

```json
{
  "nome": "João Silva",
  "nickname": "joao_silva",
  "senha": "senha123",
  "anoIngresso": 2023,
  "cargo": "estudante"
}
```

4. Clique no botão **"Execute"**
5. ✅ Você verá a resposta **201 Created** com os dados do usuário criado

---

### **Passo 3: Faça Login para Obter o Token**

**Localize a rota:** `POST /usuarios/login` (na seção "Usuários")

1. Clique na rota para expandir
2. Clique no botão **"Try it out"**
3. No campo "Request body", cole este JSON:

```json
{
  "nickname": "joao_silva",
  "senha": "senha123"
}
```

4. Clique no botão **"Execute"**
5. ✅ Você verá a resposta **200 OK** com algo assim:

```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzRhMTIzNDU2Nzg5MGFiY2RlZjEyMzQiLCJuaWNrbmFtZSI6ImpvYW9fc2lsdmEiLCJjYXJnbyI6ImVzdHVkYW50ZSIsImlhdCI6MTcwMTIzNDU2NywiZXhwIjoxNzAxODM5MzY3fQ.abcdefghijklmnopqrstuvwxyz1234567890",
  "expiresIn": "7d",
  "user": {
    "_id": "674a1234567890abcdef1234",
    "nome": "João Silva",
    "nickname": "joao_silva",
    "cargo": "estudante",
    "anoIngresso": 2023
  }
}
```

6. **⚠️ IMPORTANTE:** Copie o valor do campo **`token`** (o texto grande que começa com `eyJ...`)

---

### **Passo 4: Autorize o Swagger com o Token**

#### **4.1. Localize o Botão "Authorize"**

No **topo da página do Swagger**, você verá um botão verde com um cadeado:

```
🔓 Authorize
```

Clique nele!

---

#### **4.2. Cole o Token**

Uma janela modal vai abrir com o título **"Available authorizations"**.

Você verá:

```
┌─ bearerAuth (http, Bearer)
│
│  Value: [                                    ]
│         ↑ Cole o token aqui
│
│  [Authorize]  [Close]
```

**No campo "Value":**
1. Cole o token que você copiou do login
2. ⚠️ **NÃO** precisa digitar "Bearer" antes - o Swagger adiciona automaticamente
3. Apenas cole o token puro: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

#### **4.3. Clique em "Authorize"**

Depois de colar o token, clique no botão **"Authorize"**.

✅ O botão vai mudar para:
```
✓ Authorized
```

E o cadeado mudará de 🔓 para 🔒

---

#### **4.4. Feche a Janela**

Clique no botão **"Close"** para fechar a janela modal.

---

### **Passo 5: Teste uma Rota Protegida!**

Agora você está autenticado! Vamos testar.

#### **Exemplo 1: Toggle Seguir um Usuário**

**Rota:** `POST /usuarios/toggle-seguir` (🔒 com cadeado)

1. Primeiro, crie outro usuário para seguir (repita o Passo 2 com nickname diferente)
2. Copie o `_id` desse segundo usuário
3. Vá na rota `POST /usuarios/toggle-seguir`
4. Clique em "Try it out"
5. No Request body:

```json
{
  "targetUserId": "ID_DO_OUTRO_USUARIO_AQUI"
}
```

6. Clique em "Execute"
7. ✅ Sucesso! Você verá:

```json
{
  "success": true,
  "message": "Você agora está seguindo Maria Santos (@maria_santos)",
  "action": "seguiu"
}
```

---

#### **Exemplo 2: Toggle Curtir uma Postagem**

**Rota:** `POST /postagens/toggle-curtida` (🔒 com cadeado)

1. Primeiro, crie uma postagem (rota `POST /postagens`)
2. Copie o `_id` da postagem
3. Vá na rota `POST /postagens/toggle-curtida`
4. Clique em "Try it out"
5. No Request body:

```json
{
  "postagemId": "ID_DA_POSTAGEM_AQUI"
}
```

6. Clique em "Execute"
7. ✅ Sucesso!

```json
{
  "success": true,
  "message": "Postagem curtida com sucesso",
  "action": "curtiu",
  "totalCurtidas": 1
}
```

---

### **Passo 6: Feed Personalizado (Autenticação Opcional)**

**Rota:** `GET /postagens` (🔓✅ autenticação opcional)

Esta rota funciona COM e SEM autenticação, mas o comportamento muda:

#### **SEM autenticação:**
- Retorna **todas as postagens** (feed geral)
- `feedType: "geral"`

#### **COM autenticação:**
- Retorna postagens **suas + dos usuários que você segue**
- `feedType: "personalizado"`

**Teste:**

1. Vá na rota `GET /postagens`
2. Clique em "Try it out"
3. Clique em "Execute"
4. ✅ Com token configurado, você verá:

```json
{
  "success": true,
  "count": 5,
  "authenticated": true,        ← Você está autenticado
  "feedType": "personalizado",  ← Feed personalizado
  "data": [ /* suas postagens + quem você segue */ ]
}
```

---

## 🔄 Como Remover a Autenticação

Se quiser testar rotas sem autenticação:

1. Clique no botão **"Authorize"** 🔒 (topo da página)
2. Clique no botão **"Logout"** ao lado de "bearerAuth"
3. Clique em "Close"
4. ✅ Agora você está desautenticado (cadeado volta para 🔓)

---

## ⚠️ Erros Comuns

### **Erro 1: "Token inválido ou expirado"**

```json
{
  "success": false,
  "error": "Token inválido ou expirado. Faça login novamente."
}
```

**Causa:** Token expirou (7 dias) ou está incorreto

**Solução:**
1. Faça login novamente (Passo 3)
2. Copie o novo token
3. Atualize no Swagger (Passo 4)

---

### **Erro 2: "Unauthorized" (401)**

**Causa:** Você não informou o token no Swagger

**Solução:**
1. Verifique se o botão no topo mostra 🔒 Authorize (autenticado)
2. Se mostrar 🔓 Authorize (desautenticado), repita o Passo 4
3. Certifique-se de que colou o token corretamente

---

### **Erro 3: Token aparece como "undefined" ou vazio**

**Causa:** Você não copiou o token do login

**Solução:**
1. Repita o Passo 3 (fazer login)
2. Na resposta, role até o campo `"token"`
3. Copie APENAS o valor (texto entre aspas)
4. Não copie as aspas nem outras partes da resposta

---

## 📊 Resumo Visual

```
┌─────────────────────────────────────────────────────────┐
│  1. CRIAR USUÁRIO                                       │
│     POST /usuarios                                      │
│     → Cria conta                                        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  2. FAZER LOGIN                                         │
│     POST /usuarios/login                                │
│     → Retorna TOKEN                                     │
└─────────────────────────────────────────────────────────┘
                        ↓
                   Copie o token
                        ↓
┌─────────────────────────────────────────────────────────┐
│  3. AUTORIZAR NO SWAGGER                                │
│     Clique em 🔓 Authorize (topo da página)            │
│     Cole o token                                        │
│     Clique em "Authorize"                               │
│     Clique em "Close"                                   │
└─────────────────────────────────────────────────────────┘
                        ↓
                   ✅ Autenticado!
                        ↓
┌─────────────────────────────────────────────────────────┐
│  4. TESTAR ROTAS PROTEGIDAS                             │
│     POST /usuarios/toggle-seguir          🔒            │
│     POST /postagens/toggle-curtida        🔒            │
│     GET  /postagens (feed personalizado)  🔓✅          │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Checklist Rápido

Antes de testar rotas protegidas, verifique:

- [ ] ✅ Criei um usuário (`POST /usuarios`)
- [ ] ✅ Fiz login (`POST /usuarios/login`)
- [ ] ✅ Copiei o token da resposta
- [ ] ✅ Cliquei em "Authorize" no topo do Swagger
- [ ] ✅ Colei o token no campo "Value"
- [ ] ✅ Cliquei em "Authorize" na modal
- [ ] ✅ Cliquei em "Close"
- [ ] ✅ O botão agora mostra 🔒 (cadeado fechado)

Se todos os itens estão marcados, você está pronto! ✅

---

## 🔐 Rotas que Exigem Autenticação

### **Autenticação Obrigatória** 🔒

Estas rotas **NÃO funcionam** sem token:

| Rota | Descrição |
|------|-----------|
| `POST /usuarios/toggle-seguir` | Seguir/deixar de seguir usuário |
| `POST /postagens/toggle-curtida` | Curtir/descurtir postagem |

**Se tentar sem token:** ❌ Erro 401 Unauthorized

---

### **Autenticação Opcional** 🔓✅

Esta rota funciona com **e** sem token, mas o resultado muda:

| Rota | Sem Token | Com Token |
|------|-----------|-----------|
| `GET /postagens` | Feed geral (todas) | Feed personalizado (suas + seguindo) |

---

### **Sem Autenticação** 🔓

Todas as outras rotas (~27) funcionam sem token:
- Criar usuário
- Buscar usuários
- Criar matérias
- Criar postagens
- Ver curtidas de uma postagem
- Ranking de postagens
- etc.

---

## 💡 Dicas Extras

### **Dica 1: Token Válido por 7 Dias**

Você não precisa fazer login toda hora! O token vale por 7 dias.

Uma vez configurado no Swagger, ele fica salvo na sessão do navegador até você:
- Fechar o navegador, ou
- Fazer logout no Swagger, ou
- O token expirar (7 dias)

---

### **Dica 2: Testar com Diferentes Usuários**

Para testar seguir/seguidores:

1. Crie 2 ou 3 usuários diferentes
2. Faça login com cada um (copie cada token)
3. No Swagger, alterne entre tokens:
   - Authorize com token do usuário A
   - Siga o usuário B
   - Logout
   - Authorize com token do usuário B
   - Veja que A está seguindo você!

---

### **Dica 3: Console do Navegador**

Se tiver problemas, abra o Console do navegador (F12):
- Clique na aba "Network"
- Faça a requisição
- Veja os headers enviados
- Verifique se `Authorization: Bearer <token>` está presente

---

## 🚀 Exemplo Completo de Fluxo

### **Cenário: Seguir um usuário e curtir sua postagem**

```javascript
// 1. Criar usuário A (você)
POST /usuarios
{
  "nome": "João Silva",
  "nickname": "joao",
  "senha": "123",
  "anoIngresso": 2023,
  "cargo": "estudante"
}
// Resposta: { ..., "_id": "ID_A" }

// 2. Criar usuário B (outro)
POST /usuarios
{
  "nome": "Maria Santos",
  "nickname": "maria",
  "senha": "456",
  "anoIngresso": 2023,
  "cargo": "estudante"
}
// Resposta: { ..., "_id": "ID_B" }

// 3. Fazer login com usuário A
POST /usuarios/login
{
  "nickname": "joao",
  "senha": "123"
}
// Resposta: { ..., "token": "TOKEN_A" }

// 4. Autorizar no Swagger com TOKEN_A
🔓 Authorize → Cole TOKEN_A → Authorize → Close

// 5. Seguir usuário B
POST /usuarios/toggle-seguir
{
  "targetUserId": "ID_B"
}
// Resposta: { "success": true, "action": "seguiu" }

// 6. Usuário B criar uma postagem
POST /postagens
{
  "titulo": "Olá mundo!",
  "texto": "Minha primeira postagem",
  "tag": "Geral",
  "autorId": "ID_B"
}
// Resposta: { ..., "_id": "ID_POST" }

// 7. Curtir a postagem (ainda como usuário A autenticado)
POST /postagens/toggle-curtida
{
  "postagemId": "ID_POST"
}
// Resposta: { "success": true, "action": "curtiu" }

// 8. Ver feed personalizado
GET /postagens
// Resposta: {
//   "authenticated": true,
//   "feedType": "personalizado",
//   "data": [ /* postagem de Maria aparece aqui! */ ]
// }
```

---

## ✅ Pronto!

Agora você sabe como autenticar no Swagger!

**Resumo:**
1. 🔓 Login → Copie token
2. 🔒 Authorize → Cole token
3. ✅ Teste rotas protegidas!

---

**Documentação:** `COMO-AUTENTICAR-SWAGGER.md`  
**Data:** 29/11/2024  
**API:** InfoScript Backend v1.0.0


