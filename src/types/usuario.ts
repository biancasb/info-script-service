import { ObjectId } from 'mongodb';

export enum Cargo {
  ESTUDANTE = 'estudante',
  PROFESSOR = 'professor',
}

export interface Usuario {
  _id?: ObjectId;
  nome: string;
  nickname: string;
  senha: string; 
  anoIngresso: number;
  cargo: Cargo;
  seguindo: ObjectId[]; 
  seguidores: ObjectId[]; 
  criadoEm?: Date;
  atualizadoEm?: Date;
}

export interface CriarUsuarioDTO {
  nome: string;
  nickname: string;
  senha: string; 
  anoIngresso: number;
  cargo: Cargo;
}

export interface AtualizarUsuarioDTO {
  nome?: string;
  nickname?: string;
  senha?: string; 
  anoIngresso?: number;
  cargo?: Cargo;
}

export interface UsuarioResponse {
  _id: ObjectId;
  nome: string;
  nickname: string;
  anoIngresso: number;
  cargo: Cargo;
  seguindo?: ObjectId[];
  seguidores?: ObjectId[];
  totalSeguindo?: number;
  totalSeguidores?: number;
  criadoEm?: Date;
  atualizadoEm?: Date;
}

