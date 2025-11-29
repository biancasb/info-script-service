/**
 * Utilitários para padronizar respostas da API
 */

export interface SuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
  count?: number;
  [key: string]: any;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

/**
 * Cria resposta de sucesso padronizada
 */
export function successResponse<T>(
  data?: T,
  message?: string,
  extra?: Record<string, any>
): SuccessResponse<T> {
  return {
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message }),
    ...extra,
  };
}

/**
 * Cria resposta de erro padronizada
 */
export function errorResponse(
  error: string,
  details?: any
): ErrorResponse {
  return {
    success: false,
    error,
    ...(details && { details }),
  };
}

/**
 * Cria resposta de lista padronizada
 */
export function listResponse<T>(
  data: T[],
  extra?: Record<string, any>
): SuccessResponse<T[]> {
  return {
    success: true,
    count: data.length,
    data,
    ...extra,
  };
}

