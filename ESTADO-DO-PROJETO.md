# Estado do Projeto - InfoScript Backend

## Visao geral
- Estrutura pronta e organizada (constants, middlewares, utils, types, schemas, config, docs).
- Constantes para collections, mensagens e status; middlewares de auth e professor; utils de responses e validacao.

## Problema atual
- Rotas ainda usam strings hardcoded, status numericos, validacoes inline e responses manuais.

## Direcao de refatoracao
- Substituir nomes de collections por `COLLECTIONS.*`.
- Trocar status por `HTTP_STATUS.*`.
- Usar `ERROR_MESSAGES`/`SUCCESS_MESSAGES`.
- Usar `isValidObjectId`, `validateRequiredFields` e responses `successResponse`, `errorResponse`, `listResponse`.

## Passos sugeridos (find & replace)
1) Atualizar imports: constants, responses, validations.
2) Collections: `usuarios` → `COLLECTIONS.USUARIOS`; `postagens` → `COLLECTIONS.POSTAGENS`; `materias` → `COLLECTIONS.MATERIAS`.
3) Status: 400/401/403/404/409/500/201 → correspondentes em `HTTP_STATUS`.
4) Mensagens: mapear strings para `ERROR_MESSAGES`/`SUCCESS_MESSAGES`.
5) Validacao: `ObjectId.isValid` → `isValidObjectId`.
6) Responses: objetos manuais → `successResponse`, `errorResponse`, `listResponse`.

## Estimativa
- usuarios.ts: ~45 min
- postagens.ts: ~40 min
- materias.ts: ~40 min
- Total aproximado: ~2h

## Beneficios esperados
- Consistencia de mensagens e status.
- Menos codigo duplicado e mais legibilidade.
- Facil manutencao e testes.

## Proximo passo
- Refatorar gradualmente iniciando por `usuarios.ts`, testar, seguir para `postagens.ts` e `materias.ts`.


