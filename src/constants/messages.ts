

export const ERROR_MESSAGES = {
  INVALID_ID: 'ID inválido',
  INVALID_IDS: 'IDs inválidos',
  MISSING_FIELDS: 'Campos obrigatórios ausentes',
  
  USER_NOT_FOUND: 'Usuário não encontrado',
  USERS_NOT_FOUND: 'Um ou ambos os usuários não foram encontrados',
  INVALID_CREDENTIALS: 'Credenciais inválidas',
  NICKNAME_IN_USE: 'Nickname já está em uso',
  CANNOT_FOLLOW_SELF: 'Você não pode seguir a si mesmo',
  ALREADY_FOLLOWING: 'Você já está seguindo este usuário',
  NOT_FOLLOWING: 'Você não está seguindo este usuário',
  INVALID_CARGO: 'Cargo inválido. Use "estudante" ou "professor"',
  ONLY_PROFESSORS: 'Apenas professores podem realizar esta ação',
  ONLY_STUDENTS: 'O usuário especificado não é um estudante',
  
  POST_NOT_FOUND: 'Postagem não encontrada',
  NO_PERMISSION_EDIT_POST: 'Você não tem permissão para editar esta postagem',
  NO_PERMISSION_DELETE_POST: 'Você não tem permissão para deletar esta postagem',
  ALREADY_LIKED: 'Você já curtiu esta postagem',
  NOT_LIKED: 'Você não curtiu esta postagem',
  STUDENT_NEEDS_ENROLLMENT: 'Estudantes precisam estar matriculados em pelo menos uma matéria para criar postagens',
  INVALID_TAG: 'A tag informada não corresponde a nenhuma matéria cadastrada no sistema',
  
  SUBJECT_NOT_FOUND: 'Matéria não encontrada',
  SUBJECT_NAME_IN_USE: 'Já existe uma matéria com este nome',
  NO_PERMISSION_EDIT_SUBJECT: 'Você não tem permissão para editar esta matéria',
  NO_PERMISSION_DELETE_SUBJECT: 'Você não tem permissão para deletar esta matéria',
  ALREADY_ENROLLED: 'Estudante já está matriculado nesta matéria',
  NOT_ENROLLED: 'Estudante não está matriculado nesta matéria',
  
  TOKEN_INVALID: 'Token inválido ou expirado. Faça login novamente.',
  UNAUTHORIZED: 'Não autorizado',
  
  INTERNAL_ERROR: 'Erro interno do servidor',
  NO_FIELDS_TO_UPDATE: 'Nenhum campo para atualizar',
} as const;

export const SUCCESS_MESSAGES = {
  USER_CREATED: 'Usuário criado com sucesso',
  USER_UPDATED: 'Usuário atualizado com sucesso',
  USER_DELETED: 'Usuário deletado com sucesso',
  LOGIN_SUCCESS: 'Login realizado com sucesso',
  
  POST_CREATED: 'Postagem criada com sucesso',
  POST_UPDATED: 'Postagem atualizada com sucesso',
  POST_DELETED: 'Postagem deletada com sucesso',
  POST_LIKED: 'Postagem curtida com sucesso',
  POST_UNLIKED: 'Curtida removida com sucesso',
  
  
  SUBJECT_CREATED: 'Matéria criada com sucesso',
  SUBJECT_UPDATED: 'Matéria atualizada com sucesso',
  SUBJECT_DELETED: 'Matéria deletada com sucesso',
  
  STUDENT_ENROLLED: (studentName: string, subjectName: string) => 
    `Estudante ${studentName} matriculado com sucesso na matéria ${subjectName}`,
  STUDENT_UNENROLLED: (studentName: string, subjectName: string) => 
    `Estudante ${studentName} desmatriculado com sucesso da matéria ${subjectName}`,
  
  NOW_FOLLOWING: (name: string, nickname: string) => 
    `Você agora está seguindo ${name} (@${nickname})`,
  UNFOLLOWED: (name: string, nickname: string) => 
    `Você deixou de seguir ${name} (@${nickname})`,
} as const;

