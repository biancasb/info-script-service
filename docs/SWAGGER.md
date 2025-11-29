# Documentação Swagger/OpenAPI

## 📚 Acessando a Documentação

Após iniciar o servidor com `npm run dev` ou `docker-compose up`, acesse:

**URL da Documentação:** http://localhost:3000/documentacao

## 🎯 O que é o Swagger?

Swagger (também conhecido como OpenAPI) é um padrão para documentação de APIs REST. Ele gera automaticamente uma interface interativa onde você pode:

- ✅ **Visualizar todos os endpoints** disponíveis na API
- ✅ **Ver exemplos** de requisições e respostas
- ✅ **Testar endpoints** diretamente no navegador
- ✅ **Entender os parâmetros** necessários para cada requisição
- ✅ **Ver códigos de resposta** (200, 400, 404, 500, etc.)
- ✅ **Baixar a especificação** em JSON ou YAML

## 🖥️ Interface do Swagger UI

A documentação Swagger possui uma interface visual moderna com:

### 1. Lista de Endpoints Organizados por Tags

- **Health** - Verificação de saúde da API
- **Usuários** - Gerenciamento de usuários
- **Seguidores** - Sistema de seguir/seguidores
- **Postagens** - CRUD de postagens
- **Curtidas** - Sistema de curtidas
- **Examples** - Rotas de exemplo

### 2. Detalhes de Cada Endpoint

Para cada endpoint você verá:
- **Método HTTP** (GET, POST, PUT, DELETE)
- **URL do endpoint**
- **Descrição** do que o endpoint faz
- **Parâmetros** necessários
- **Body da requisição** (com exemplos)
- **Respostas possíveis** (com códigos de status)
- **Schemas** dos objetos retornados

### 3. Botão "Try it out"

Você pode testar os endpoints diretamente:
1. Clique em **"Try it out"**
2. Preencha os parâmetros necessários
3. Clique em **"Execute"**
4. Veja a resposta real da API

## 📖 Exemplo de Uso

### Testando o Endpoint de Criar Usuário

1. Acesse http://localhost:3000/documentacao
2. Procure pela tag **"Usuários"**
3. Clique em **POST /usuarios**
4. Clique no botão **"Try it out"**
5. Edite o JSON de exemplo:
```json
{
  "nome": "João Silva",
  "nickname": "joao_silva",
  "senha": "senha123",
  "anoIngresso": 2023,
  "cargo": "estudante"
}
```
6. Clique em **"Execute"**
7. Veja a resposta na seção **"Responses"**

### Testando o Feed Personalizado

1. Procure por **GET /postagens/feed/{usuarioId}**
2. Clique em **"Try it out"**
3. Cole um ID de usuário válido no campo `usuarioId`
4. (Opcional) Adicione uma tag no campo `tag` (ex: "Matemática")
5. Clique em **"Execute"**
6. Veja todas as postagens do feed

## 🔍 Recursos Avançados

### Baixar a Especificação OpenAPI

No topo da página Swagger, você pode:
- Baixar a especificação em **JSON** ou **YAML**
- Usar em ferramentas como Postman, Insomnia, etc.
- Gerar código cliente automaticamente

### Filtrar Endpoints

Use a caixa de pesquisa no topo para filtrar endpoints por nome.

### Expandir/Colapsar Todos

Botões para expandir ou colapsar todas as seções de uma vez.

## 🛠️ Integração com Ferramentas

### Postman

1. Acesse a documentação Swagger
2. Copie a URL: http://localhost:3000/documentacao/json
3. No Postman: **Import > Link > Cole a URL**
4. Todos os endpoints serão importados automaticamente!

### Insomnia

1. Acesse: http://localhost:3000/documentacao/json
2. Copie todo o JSON
3. No Insomnia: **Import/Export > Import Data > From Clipboard**

## 📊 Estrutura da Documentação

A documentação está organizada em:

### Tags (Categorias)

- **Health** - Status do servidor e banco de dados
- **Usuários** - CRUD, login, perfis
- **Seguidores** - Seguir, deixar de seguir, listar
- **Postagens** - Criar, editar, listar, feed
- **Curtidas** - Curtir, descurtir, ranking

### Schemas (Modelos de Dados)

Cada tipo de objeto possui um schema definido:
- **Usuario** - Estrutura de um usuário
- **Postagem** - Estrutura de uma postagem
- **CriarUsuario** - Dados necessários para criar
- **Login** - Dados de autenticação

## 💡 Dicas

### 1. Sempre Leia a Descrição

Cada endpoint tem uma descrição que explica:
- O que ele faz
- Quais validações existem
- Exemplos de uso
- Possíveis erros

### 2. Confira os Códigos de Status

- **200** - Sucesso
- **201** - Criado com sucesso
- **400** - Erro de validação
- **401** - Não autorizado
- **403** - Sem permissão
- **404** - Não encontrado
- **409** - Conflito (ex: nickname duplicado)
- **500** - Erro no servidor

### 3. Use os Exemplos

Todos os schemas têm exemplos pré-preenchidos. Use-os como base!

### 4. Teste em Ordem Lógica

1. Crie usuários primeiro
2. Depois crie postagens
3. Depois faça usuários seguirem outros
4. Por fim, teste curtidas e feed

## 🔐 Autenticação (Futuro)

A documentação já está preparada para autenticação JWT:
- `securitySchemes` configurado
- Quando implementar JWT, basta adicionar nas rotas
- Um botão "Authorize" aparecerá no topo do Swagger

## 📝 Customização

Para customizar a documentação, edite:
- `src/index.ts` - Configuração do Swagger
- `src/schemas/` - Schemas dos objetos
- Adicione `schema` nas rotas para documentá-las

### Exemplo de Schema em Rota

```typescript
fastify.post('/usuarios', {
  schema: {
    tags: ['Usuários'],
    description: 'Criar um novo usuário',
    body: criarUsuarioSchema,
    response: {
      201: usuarioResponseSchema
    }
  }
}, handler);
```

## 🌐 Servidor de Produção

Em produção, atualize a URL do servidor em `src/index.ts`:

```typescript
servers: [
  {
    url: 'https://api.infoscript.com',
    description: 'Servidor de Produção'
  }
]
```

## 📱 Responsivo

A interface do Swagger UI é totalmente responsiva e funciona em:
- Desktop
- Tablet
- Mobile

## 🎨 Temas

O Swagger UI usa um tema padrão limpo. Para customizar cores e estilo, você pode:
- Modificar o CSS no `swaggerUi.config`
- Usar temas prontos da comunidade
- Criar seu próprio tema

## 📞 Suporte

Para dúvidas sobre:
- **Swagger em geral**: https://swagger.io/docs/
- **Fastify Swagger**: https://github.com/fastify/fastify-swagger
- **OpenAPI Spec**: https://spec.openapis.org/oas/latest.html

---

**Aproveite a documentação interativa!** 🚀



