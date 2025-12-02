import { ObjectId, Collection } from 'mongodb';

export async function findById<T>(
  collection: Collection<T>,
  id: string | ObjectId
): Promise<T | null> {
  const objectId = typeof id === 'string' ? new ObjectId(id) : id;
  return await collection.findOne({ _id: objectId } as any);
}

export async function existsById<T>(
  collection: Collection<T>,
  id: string | ObjectId
): Promise<boolean> {
  const doc = await findById(collection, id);
  return doc !== null;
}

export function toObjectId(id: string): ObjectId {
  return new ObjectId(id);
}

export function toObjectIds(ids: string[]): ObjectId[] {
  return ids.map(id => new ObjectId(id));
}

export function removeSensitiveFields<T extends { senha?: string }>(obj: T): Omit<T, 'senha'> {
  const { senha, ...rest } = obj;
  return rest;
}

