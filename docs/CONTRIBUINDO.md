# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o InfoScript Backend! Este documento fornece diretrizes para tornar o processo de contribuição fácil e eficaz.

---

## 🎯 Começando

### 1. Fork e Clone

```bash
# Fork no GitHub
# Clone seu fork
git clone https://github.com/seu-usuario/infoscript-back.git
cd infoscript-back

# Adicione o repositório original como upstream
git remote add upstream https://github.com/original/infoscript-back.git
```

### 2. Configure o Ambiente

```bash
# Instale dependências
npm install

# Copie o arquivo de ambiente
cp .env.example .env

# Inicie o MongoDB local
# mongod

# Rode o projeto
npm run dev
```

---

## 📐 Padrões de Código

### Estrutura de Pastas

Adicione arquivos nas pastas apropriadas:

```
src/
├── constants/      # Adicione novas constantes aqui
├── middlewares/    # Adicione middlewares reutilizáveis
├── routes/         # Adicione novos endpoints
├── schemas/        # Adicione schemas de validação
├── types/          # Adicione novos tipos
└── utils/          # Adicione funções utilitárias
```

### Nomenclatura

```typescript
// Variáveis e funções: camelCase
const userId = '123';
function getUserById() {}

// Tipos e Interfaces: PascalCase
interface Usuario {}
type JWTPayload = {};

// Constantes: UPPER_SNAKE_CASE
const ERROR_MESSAGES = {};

// Arquivos: kebab-case
// user-service.ts
// error-handler.ts
```

### Imports

Sempre use imports centralizados:

```typescript
// ✅ BOM
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';
import { isValidObjectId, successResponse } from '../utils';

// ❌ EVITE
import { ERROR_MESSAGES } from '../constants/messages';
import { HTTP_STATUS } from '../constants/http-status';
```

### TypeScript

```typescript
// ✅ Use tipagem forte
function createUser(data: CriarUsuarioDTO): Promise<Usuario> {}

// ❌ Evite any
function createUser(data: any): any {}

// ✅ Use interfaces para objetos
interface UserData {
  nome: string;
  email: string;
}

// ✅ Use enums para valores fixos
enum Cargo {
  ESTUDANTE = 'estudante',
  PROFESSOR = 'professor',
}
```

---

## 🧪 Testes

### Escreva Testes

```typescript
// tests/utils/validation.test.ts
describe('isValidObjectId', () => {
  it('deve retornar true para ObjectId válido', () => {
    expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
  });

  it('deve retornar false para ID inválido', () => {
    expect(isValidObjectId('invalid')).toBe(false);
  });
});
```

### Execute Testes

```bash
# Rode todos os testes
npm test

# Rode com coverage
npm run test:coverage

# Rode específico
npm test validation
```

---

## 📝 Commits

### Mensagens Semânticas

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Formato
<tipo>(<escopo>): <descrição>

# Exemplos
feat(auth): adiciona autenticação JWT
fix(postagens): corrige validação de tag
docs(readme): atualiza exemplos de uso
refactor(utils): extrai validações comuns
test(usuarios): adiciona testes de criação
chore(deps): atualiza dependências
```

### Tipos
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `refactor`: Refatoração sem mudar comportamento
- `test`: Adicionar/modificar testes
- `chore`: Tarefas de manutenção
- `perf`: Melhorias de performance
- `style`: Formatação de código

---

## 🔄 Pull Request

### Antes de Submeter

```bash
# 1. Atualize seu fork
git fetch upstream
git rebase upstream/main

# 2. Rode linting
npm run lint

# 3. Rode formatação
npm run format

# 4. Rode testes
npm test

# 5. Verifique build
npm run build
```

### Template de PR

```markdown
## Descrição
[Descreva o que mudou]

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Documentação

## Checklist
- [ ] Código segue os padrões do projeto
- [ ] Adicionei testes
- [ ] Todos os testes passam
- [ ] Atualizei a documentação
- [ ] Atualizei o CHANGELOG.md
```

---

## 🐛 Reportando Bugs

### Template de Issue

```markdown
## Descrição do Bug
[Descrição clara do problema]

## Passos para Reproduzir
1. Faça GET em '/endpoint'
2. Com payload '...'
3. Veja o erro

## Comportamento Esperado
[O que deveria acontecer]

## Comportamento Atual
[O que está acontecendo]

## Ambiente
- OS: Windows/Linux/Mac
- Node.js: versão
- MongoDB: versão
```

---

## 💡 Sugerindo Funcionalidades

### Template de Feature Request

```markdown
## Descrição
[Descrição da funcionalidade]

## Problema que Resolve
[Qual problema esta feature resolve]

## Solução Proposta
[Como você imagina que funcione]

## Alternativas Consideradas
[Outras abordagens pensadas]
```

---

## 🎨 Code Review

### O que Revisamos

✅ **Funcionalidade**
- Código faz o que deveria?
- Edge cases cobertos?

✅ **Qualidade**
- Código legível?
- Nomes descritivos?
- Comentários quando necessário?

✅ **Padrões**
- Segue estrutura do projeto?
- Usa utils/constants existentes?
- Tipagem adequada?

✅ **Performance**
- Queries otimizadas?
- Sem operações desnecessárias?
- Async/await usado corretamente?

✅ **Segurança**
- Validações de input?
- Autenticação/autorização?
- Sem dados sensíveis expostos?

---

## 📚 Recursos Úteis

### Documentação
- [Fastify](https://www.fastify.io/)
- [MongoDB](https://www.mongodb.com/docs/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [JSON Schema](https://json-schema.org/)

### Ferramentas
- [Postman](https://www.postman.com/) - Testar APIs
- [MongoDB Compass](https://www.mongodb.com/products/compass) - GUI MongoDB
- [VS Code](https://code.visualstudio.com/) - Editor recomendado

---

## 🙏 Agradecimentos

Toda contribuição é valiosa! Seja código, documentação, bug reports ou sugestões.

Obrigado por fazer o InfoScript Backend melhor! 🎉

---

## 📞 Contato

Dúvidas? Entre em contato:
- Email: contact@infoscript.com
- GitHub Issues: [Link para issues]

---

**Última atualização:** 29/11/2024

