import { ObjectId } from 'mongodb';

export interface Postagem {
  _id?: ObjectId;
  titulo: string;
  texto: string;
  tag: string;
  link?: string;
  autorId: ObjectId;
  autorNome?: string;
  autorNickname?: string;
  curtidas: ObjectId[];
  totalCurtidas?: number;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface CriarPostagemDTO {
  titulo: string;
  texto: string;
  tag: string;
  autorId: string;
  link?: string;
}

export interface AtualizarPostagemDTO {
  titulo?: string;
  texto?: string;
  tag?: string;
}

export interface PostagemResponse {
  _id: ObjectId;
  titulo: string;
  texto: string;
  tag: string;
  autor: {
    _id: ObjectId;
    nome: string;
    nickname: string;
  };
  curtidas?: ObjectId[];
  totalCurtidas: number;
  curtiuPostagem?: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

