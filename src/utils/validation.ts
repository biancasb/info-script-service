import { ObjectId } from 'mongodb';

/**
 * Utilitários de validação
 * Funções reutilizáveis para validações comuns
 */

/**
 * Valida se uma string é um ObjectId válido do MongoDB
 */
export function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id);
}

/**
 * Valida se múltiplos IDs são válidos
 */
export function areValidObjectIds(...ids: string[]): boolean {
  return ids.every(id => ObjectId.isValid(id));
}

/**
 * Valida ano de ingresso
 */
export function isValidYear(year: number): { valid: boolean; message?: string } {
  const currentYear = new Date().getFullYear();
  
  if (year < 1900 || year > currentYear + 1) {
    return {
      valid: false,
      message: `Ano de ingresso inválido. Deve estar entre 1900 e ${currentYear + 1}`,
    };
  }
  
  return { valid: true };
}

/**
 * Valida se todos os campos obrigatórios estão presentes
 */
export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): { valid: boolean; missing?: string[] } {
  const missing = requiredFields.filter(field => !data[field]);
  
  if (missing.length > 0) {
    return {
      valid: false,
      missing: missing as string[],
    };
  }
  
  return { valid: true };
}

