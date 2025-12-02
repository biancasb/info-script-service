export const materiaSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string', description: 'ID da matéria' },
    nome: { type: 'string', description: 'Nome da matéria' },
    descricao: { type: 'string', description: 'Descrição da matéria' },
    estudantesMatriculados: {
      type: 'array',
      items: { type: 'string' },
      description: 'IDs dos estudantes matriculados'
    },
    totalEstudantes: { type: 'number', description: 'Total de estudantes matriculados' },
    criadoEm: { type: 'string', format: 'date-time' },
    atualizadoEm: { type: 'string', format: 'date-time' },
  },
};

export const criarMateriaSchema = {
  type: 'object',
  required: ['nome', 'descricao'],
  properties: {
    nome: { 
      type: 'string', 
      minLength: 3,
      maxLength: 100,
      description: 'Nome da matéria (ex: Matemática, Física)' 
    },
    descricao: { 
      type: 'string',
      minLength: 10,
      maxLength: 500,
      description: 'Descrição da matéria' 
    },
  },
};

export const atualizarMateriaSchema = {
  type: 'object',
  properties: {
    nome: { 
      type: 'string',
      minLength: 3,
      maxLength: 100,
      description: 'Nome da matéria' 
    },
    descricao: { 
      type: 'string',
      minLength: 10,
      maxLength: 500,
      description: 'Descrição da matéria' 
    },
  },
};

export const matricularEstudanteSchema = {
  type: 'object',
  required: ['estudanteId'],
  properties: {
    estudanteId: { 
      type: 'string',
      description: 'ID do estudante a ser matriculado' 
    },
  },
};