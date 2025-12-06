import { ObjectId } from 'mongodb';
import { Cargo } from './usuario';

export interface JWTPayload {
  userId: string;
  nome: string;
  nickname: string;
  cargo: Cargo;
  anoIngresso: number;
}

export interface AuthenticatedUser {
  _id: ObjectId;
  nickname: string;
  cargo: Cargo;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  expiresIn: string;
  user: {
    _id: string;
    nome: string;
    nickname: string;
    cargo: Cargo;
    anoIngresso: number;
  };
}


