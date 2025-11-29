import { ObjectId } from 'mongodb';

export interface Postagem {
  _id?: ObjectId;
  titulo: string;
  texto: string;
  tag: string; // disciplina/matéria (ex: "Matemática", "Física", "Programação")
  autorId: ObjectId; // ID do usuário que criou a postagem
  autorNome?: string; // Nome do autor (desnormalizado para facilitar consultas)
  autorNickname?: string; // Nickname do autor (desnormalizado)
  curtidas: ObjectId[]; // IDs dos usuários que curtiram a postagem
  totalCurtidas?: number; // Contador de curtidas (calculado)
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface CriarPostagemDTO {
  titulo: string;
  texto: string;
  tag: string;
  autorId: string; // ID como string, será convertido para ObjectId
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
  curtiuPostagem?: boolean; // Se o usuário logado curtiu esta postagem
  criadoEm: Date;
  atualizadoEm: Date;
}

