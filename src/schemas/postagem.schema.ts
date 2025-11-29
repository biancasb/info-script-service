// Schemas para documentação Swagger dos endpoints de postagens

export const postagemSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string', description: 'ID da postagem' },
    titulo: { type: 'string', description: 'Título da postagem' },
    texto: { type: 'string', description: 'Conteúdo da postagem' },
    tag: { type: 'string', description: 'Disciplina/matéria' },
    autorId: { type: 'string', description: 'ID do autor' },
    autorNome: { type: 'string', description: 'Nome do autor' },
    autorNickname: { type: 'string', description: 'Nickname do autor' },
    curtidas: {
      type: 'array',
      items: { type: 'string' },
      description: 'IDs dos usuários que curtiram'
    },
    totalCurtidas: { type: 'number', description: 'Total de curtidas' },
    criadoEm: { type: 'string', format: 'date-time' },
    atualizadoEm: { type: 'string', format: 'date-time' },
  },
};

export const criarPostagemSchema = {
  type: 'object',
  required: ['titulo', 'texto', 'tag', 'autorId'],
  properties: {
    titulo: { type: 'string', description: 'Título da postagem', default: 'Introdução ao Cálculo' },
    texto: { type: 'string', description: 'Conteúdo da postagem', default: 'O cálculo diferencial estuda taxas de variação...' },
    tag: { type: 'string', description: 'Disciplina/matéria', default: 'Matemática' },
    autorId: { type: 'string', description: 'ID do autor', default: '692a7010729379791f7d8e34' },
  },
};

export const curtirPostagemSchema = {
  type: 'object',
  required: ['usuarioId', 'postagemId'],
  properties: {
    usuarioId: { type: 'string', description: 'ID do usuário', default: '692a7010729379791f7d8e34' },
    postagemId: { type: 'string', description: 'ID da postagem', default: '692a72343b0b45bd0e425e1d' },
  },
};

