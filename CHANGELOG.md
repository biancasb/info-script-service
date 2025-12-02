# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

## [2.0.0] - 01/12/2025

### 🎉 Refatoração Completa

#### Adicionado
- ✨ Pasta `src/constants/` com mensagens, HTTP status e nomes de coleções
- ✨ Pasta `src/middlewares/` com auth e error handler
- ✨ Pasta `src/utils/` com validações, respostas e helpers de database
- ✨ Pasta `docs/` para organizar documentação
- ✨ Arquivo `.env.example` para template de configuração
- ✨ Error handler global para tratamento consistente de erros
- ✨ Exports centralizados (index.ts) em cada pasta
- ✨ Tipos comuns em `src/types/common.ts`
- ✨ Documentação de arquitetura em `docs/ARQUITETURA.md`
- ✨ Guia completo de refatoração em `docs/REFATORACAO-COMPLETA.md`

#### Melhorado
- ♻️ README completamente reescrito com exemplos práticos
- ♻️ Middlewares de autenticação agora em arquivo separado
- ♻️ Validações centralizadas em utils
- ♻️ Respostas da API padronizadas
- ♻️ Mensagens de erro/sucesso centralizadas
- ♻️ Estrutura de pastas mais organizada

#### Movido
- 📁 `AUTENTICACAO.md` → `docs/AUTENTICACAO.md`
- 📁 `SWAGGER.md` → `docs/SWAGGER.md`
- 📁 `TESTE-SWAGGER.md` → `docs/TESTE-SWAGGER.md`

#### Removido
- 🗑️ Código duplicado em rotas
- 🗑️ Mensagens hardcoded
- 🗑️ Validações repetitivas

---

## [1.0.0] - 01/12/2025

### Sistema de Autenticação JWT

#### Adicionado
- ✨ Login com JWT (token válido por 7 dias)
- ✨ Middleware de autenticação obrigatória
- ✨ Middleware de autenticação opcional
- ✨ Toggle seguir/deixar de seguir
- ✨ Toggle curtir/descurtir
- ✨ Feed unificado (personalizado se autenticado)
- ✨ API consolidada de matérias por usuário

#### Melhorado
- ♻️ APIs de seguir/deixar consolidadas em toggle
- ♻️ APIs de curtir/descurtir consolidadas em toggle
- ♻️ Feed de postagens inteligente baseado em autenticação
- ♻️ API de matérias detecta automaticamente tipo de usuário

#### Removido
- ❌ `POST /usuarios/seguir`
- ❌ `POST /usuarios/deixar-de-seguir`
- ❌ `GET /usuarios/:id/segue/:outroId`
- ❌ `POST /postagens/curtir`
- ❌ `POST /postagens/descurtir`
- ❌ `GET /postagens/:id/curtiu/:usuarioId`
- ❌ `GET /postagens/feed/:usuarioId`
- ❌ `GET /materias/estudante/:id`
- ❌ `GET /materias/professor/:id`

---

## [0.9.0] - 01/12/2025

### Sistema de Matérias

#### Adicionado
- ✨ CRUD de matérias (apenas professores)
- ✨ Matrícula/desmatrícula de estudantes
- ✨ Validação: estudantes precisam estar matriculados para postar
- ✨ Tag de postagens deve corresponder a matéria cadastrada
- ✨ API para listar matérias por estudante
- ✨ API para listar matérias por professor

---

## [0.5.0] - Versão Inicial

### Funcionalidades Base

#### Adicionado
- ✨ CRUD de usuários
- ✨ CRUD de postagens
- ✨ Sistema de seguir/seguidores
- ✨ Sistema de curtidas
- ✨ Login básico
- ✨ Swagger UI
- ✨ Docker support
- ✨ MongoDB integration

---

## Legenda

- ✨ Novo recurso
- ♻️ Refatoração/Melhoria
- 🐛 Correção de bug
- 📝 Documentação
- 🔒 Segurança
- ⚡ Performance
- 🗑️ Removido
- 📁 Movido
- ❌ Deprecated

