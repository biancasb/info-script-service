
export const usuarioSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string', description: 'ID do usuário' },
    nome: { type: 'string', description: 'Nome completo' },
    nickname: { type: 'string', description: 'Nome de usuário único' },
    anoIngresso: { type: 'number', description: 'Ano de ingresso' },
    cargo: { 
      type: 'string', 
      enum: ['estudante', 'professor'],
      description: 'Tipo de usuário'
    },
    seguindo: { 
      type: 'array',
      items: { type: 'string' },
      description: 'IDs dos usuários que está seguindo'
    },
    seguidores: { 
      type: 'array',
      items: { type: 'string' },
      description: 'IDs dos seguidores'
    },
    totalSeguindo: { type: 'number', description: 'Total de usuários seguindo' },
    totalSeguidores: { type: 'number', description: 'Total de seguidores' },
    criadoEm: { type: 'string', format: 'date-time' },
    atualizadoEm: { type: 'string', format: 'date-time' },
  },
};

export const criarUsuarioSchema = {
  type: 'object',
  required: ['nome', 'nickname', 'senha', 'anoIngresso', 'cargo'],
  properties: {
    nome: { type: 'string', description: 'Nome completo', default: 'Maria Santos' },
    nickname: { type: 'string', description: 'Nome de usuário único', default: 'maria_santos' },
    senha: { type: 'string', description: 'Senha do usuário', default: 'senha123' },
    anoIngresso: { type: 'number', description: 'Ano de ingresso', default: 2023 },
    cargo: { 
      type: 'string',
      enum: ['estudante', 'professor'],
      description: 'Tipo de usuário',
      default: 'estudante'
    },
  },
};

export const loginSchema = {
  type: 'object',
  required: ['nickname', 'senha'],
  properties: {
    nickname: { type: 'string', description: 'Nome de usuário', default: 'maria_santos' },
    senha: { type: 'string', description: 'Senha', default: 'senha123' },
  },
};

export const seguirSchema = {
  type: 'object',
  required: ['usuarioId', 'seguirId'],
  properties: {
    usuarioId: { type: 'string', description: 'ID do usuário que vai seguir', default: '692a7010729379791f7d8e34' },
    seguirId: { type: 'string', description: 'ID do usuário a ser seguido', default: '692a74ca073443fa79b01715' },
  },
};

