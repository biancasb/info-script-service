import { MongoClient, Db } from 'mongodb';

let db: Db | null = null;
let client: MongoClient | null = null;

export async function connectDatabase(uri: string, dbName: string): Promise<Db> {
  try {
    client = new MongoClient(uri);
    await client.connect();
    
    console.log('✅ Conectado ao MongoDB com sucesso!');
    
    db = client.db(dbName);
    return db;
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    throw error;
  }
}

export function getDatabase(): Db {
  if (!db) {
    throw new Error('Database não está conectado. Chame connectDatabase primeiro.');
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    console.log('🔌 Conexão com MongoDB fechada');
  }
}




