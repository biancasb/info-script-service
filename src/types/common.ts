import { ObjectId } from 'mongodb';

/**
 * Tipos comuns e reutilizáveis
 */

/**
 * Documento base com timestamps
 */
export interface BaseDocument {
  _id?: ObjectId;
  criadoEm: Date;
  atualizadoEm: Date;
}

/**
 * Parâmetros de paginação
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Resultado paginado
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Filtros comuns
 */
export interface BaseFilters {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

