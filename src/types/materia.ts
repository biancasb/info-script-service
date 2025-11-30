import { ObjectId } from 'mongodb';

export interface Materia {
  _id?: ObjectId;
  nome: string;
  descricao: string;
  professorId: ObjectId; // ID do professor que criou a matéria
  professorNome?: string; // Nome do professor (desnormalizado)
  estudantesMatriculados: ObjectId[]; // IDs dos estudantes matriculados
  totalEstudantes?: number; // Contador de estudantes (calculado)
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface CriarMateriaDTO {
  nome: string;
  descricao: string;
  professorId: string; // ID como string, será convertido para ObjectId
}

export interface AtualizarMateriaDTO {
  nome?: string;
  descricao?: string;
}

export interface MatricularEstudanteDTO {
  professorId: string; // ID do professor que está fazendo a operação
  estudanteId: string; // ID do estudante a ser matriculado
}

export interface MateriaResponse {
  _id: ObjectId;
  nome: string;
  descricao: string;
  professor: {
    _id: ObjectId;
    nome: string;
  };
  estudantesMatriculados: ObjectId[];
  totalEstudantes: number;
  criadoEm: Date;
  atualizadoEm: Date;
}


