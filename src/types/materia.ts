import { ObjectId } from 'mongodb';

export interface Materia {
  _id?: ObjectId;
  nome: string;
  descricao: string;
  estudantesMatriculados: ObjectId[]; 
  totalEstudantes?: number; 
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface CriarMateriaDTO {
  nome: string;
  descricao: string;
}

export interface AtualizarMateriaDTO {
  nome?: string;
  descricao?: string;
}

export interface MatricularEstudanteDTO {
  estudanteId: string; 
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