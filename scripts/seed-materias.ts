import { MongoClient } from 'mongodb';
import { config } from '../src/config/env';

const materias = [
  { nome: "Anatomia Geral", descricao: "Disciplina de Anatomia Geral.", criadoEm: new Date(), atualizadoEm: new Date() },
  { nome: "Arquitetura de Computadores", descricao: "Disciplina de Arquitetura de Computadores.", criadoEm: new Date(), atualizadoEm: new Date() },
  { nome: "Introdução à Informática em Saúde", descricao: "Disciplina de Informática em Saúde.", criadoEm: new Date(), atualizadoEm: new Date() },
  { nome: "Programação Orientada a Objetos I", descricao: "Disciplina de POO I.", criadoEm: new Date(), atualizadoEm: new Date() },
  { nome: "Engenharia de Software II", descricao: "Disciplina de Engenharia de Software II.", criadoEm: new Date(), atualizadoEm: new Date() },
  { nome: "Introdução ao Processamento Digital de Imagens", descricao: "Disciplina de PDI.", criadoEm: new Date(), atualizadoEm: new Date() },
  { nome: "Introdução à Bioinformática", descricao: "Disciplina de Bioinformática.", criadoEm: new Date(), atualizadoEm: new Date() },
  { nome: "Biologia Molecular Computacional", descricao: "Disciplina de Biologia Molecular Computacional.", criadoEm: new Date(), atualizadoEm: new Date() },
  { nome: "Diagnóstico por Imagem I", descricao: "Disciplina de Diagnóstico por Imagem I.", criadoEm: new Date(), atualizadoEm: new Date() },
  { nome: "Telessaúde: Fundamentos e Aplicações", descricao: "Disciplina de Telessaúde.", criadoEm: new Date(), atualizadoEm: new Date() },
  { nome: "Tópicos Avançados em Informática Biomédica", descricao: "Disciplina de Tópicos Avançados em Informática Biomédica.", criadoEm: new Date(), atualizadoEm: new Date() },
  { nome: "Desenvolvimento Web", descricao: "Disciplina de Desenvolvimento Web.", criadoEm: new Date(), atualizadoEm: new Date() },
  { nome: "TCC", descricao: "Trabalho de Conclusão de Curso.", criadoEm: new Date(), atualizadoEm: new Date() }
];

async function seedMaterias() {
  const client = new MongoClient(config.mongoUri);

  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');

    const db = client.db(config.mongoDbName);
    const collection = db.collection('materias');

    // Limpar coleção antes de inserir (opcional)
    // await collection.deleteMany({});

    const result = await collection.insertMany(materias);
    console.log(`✅ ${result.insertedCount} matérias inseridas com sucesso!`);
    console.log('IDs inseridos:', result.insertedIds);

  } catch (error) {
    console.error('❌ Erro ao inserir matérias:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Conexão fechada');
  }
}

seedMaterias();
