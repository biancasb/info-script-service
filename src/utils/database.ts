import { ObjectId, Collection } from 'mongodb';

/**
 * Utilitários para operações de banco de dados
 * Simplifica operações comuns e evita repetição
 */

/**
 * Busca um documento por ID
 * Retorna null se não encontrado
 */
export async function findById<T>(
  collection: Collection<T>,
  id: string | ObjectId
): Promise<T | null> {
  const objectId = typeof id === 'string' ? new ObjectId(id) : id;
  return await collection.findOne({ _id: objectId } as any);
}

/**
 * Verifica se um documento existe por ID
 */
export async function existsById<T>(
  collection: Collection<T>,
  id: string | ObjectId
): Promise<boolean> {
  const doc = await findById(collection, id);
  return doc !== null;
}

/**
 * Converte string para ObjectId de forma segura
 */
export function toObjectId(id: string): ObjectId {
  return new ObjectId(id);
}

/**
 * Converte array de strings para array de ObjectIds
 */
export function toObjectIds(ids: string[]): ObjectId[] {
  return ids.map(id => new ObjectId(id));
}

/**
 * Remove campo senha de objeto usuário
 */
export function removeSensitiveFields<T extends { senha?: string }>(obj: T): Omit<T, 'senha'> {
  const { senha, ...rest } = obj;
  return rest;
}

