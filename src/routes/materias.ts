import { FastifyInstance } from 'fastify';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../config/database';
import { Materia, CriarMateriaDTO, AtualizarMateriaDTO, MatricularEstudanteDTO } from '../types/materia';
import { Usuario, Cargo } from '../types/usuario';
import { materiaSchema, criarMateriaSchema, matricularEstudanteSchema } from '../schemas/materia.schema';
import { COLLECTIONS } from '../constants';

export async function materiasRoutes(fastify: FastifyInstance) {
  
  // GET - Listar todas as matérias
  fastify.get('/materias', {
    schema: {
      tags: ['Matérias'],
      description: 'Lista todas as matérias cadastradas',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            count: { type: 'number' },
            data: {
              type: 'array',
              items: materiaSchema
            }
          }
        }
      }
    }
  }, async (_request, reply) => {
    try {
      const db = getDatabase();
      const materias = await db.collection<Materia>(COLLECTIONS.MATERIAS)
        .aggregate([
          {
            $addFields: {
              totalEstudantes: { $size: { $ifNull: ['$estudantesMatriculados', []] } }
            }
          },
          {
            $sort: { nome: 1 } // Ordenar por nome
          }
        ])
        .toArray();
      
      return {
        success: true,
        count: materias.length,
        data: materias,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erro ao buscar matérias',
      });
    }
  });

  // GET - Buscar uma matéria por ID
  fastify.get<{ Params: { id: string } }>('/materias/:id', {
    schema: {
      tags: ['Matérias'],
      description: 'Busca uma matéria por ID',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID da matéria' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: materiaSchema
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      
      if (!ObjectId.isValid(id)) {
        return reply.status(400).send({
          success: false,
          error: 'ID inválido',
        });
      }
      
      const db = getDatabase();
      const materias = await db.collection<Materia>(COLLECTIONS.MATERIAS)
        .aggregate([
          {
            $match: { _id: new ObjectId(id) }
          },
          {
            $addFields: {
              totalEstudantes: { $size: { $ifNull: ['$estudantesMatriculados', []] } }
            }
          }
        ])
        .toArray();
      
      if (!materias || materias.length === 0) {
        return reply.status(404).send({
          success: false,
          error: 'Matéria não encontrada',
        });
      }
      
      return {
        success: true,
        data: materias[0],
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erro ao buscar matéria',
      });
    }
  });

  // GET - Listar matérias de um usuário (estudante ou professor)
  fastify.get<{ Params: { usuarioId: string } }>(
    '/materias/usuario/:usuarioId',
    {
      schema: {
        tags: ['Matérias'],
        description: 'Lista matérias do usuário. Se estudante: matérias matriculadas. Se professor: matérias criadas.',
        params: {
          type: 'object',
          properties: {
            usuarioId: { type: 'string', description: 'ID do usuário' }
          },
          required: ['usuarioId']
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              count: { type: 'number' },
              usuarioId: { type: 'string' },
              cargo: { type: 'string', enum: ['estudante', 'professor'], description: 'Cargo do usuário' },
              tipo: { type: 'string', enum: ['matriculadas', 'criadas'], description: 'Tipo de matérias' },
              data: {
                type: 'array',
                items: materiaSchema
              }
            }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { usuarioId } = request.params;
        
        if (!ObjectId.isValid(usuarioId)) {
          return reply.status(400).send({
            success: false,
            error: 'ID de usuário inválido',
          });
        }
        
        const db = getDatabase();
        
        // Busca o usuário
        const usuario = await db.collection<Usuario>(COLLECTIONS.USUARIOS)
          .findOne({ _id: new ObjectId(usuarioId) });
        
        if (!usuario) {
          return reply.status(404).send({
            success: false,
            error: 'Usuário não encontrado',
          });
        }

        let materias;
        let tipo: 'matriculadas' | 'criadas';

        if (usuario.cargo === Cargo.ESTUDANTE) {
          // Se é estudante, retorna matérias em que está matriculado
          tipo = 'matriculadas';
          materias = await db.collection<Materia>(COLLECTIONS.MATERIAS)
            .aggregate([
              {
                $match: { 
                  estudantesMatriculados: new ObjectId(usuarioId) 
                }
              },
              {
                $addFields: {
                  totalEstudantes: { $size: { $ifNull: ['$estudantesMatriculados', []] } }
                }
              },
              {
                $sort: { nome: 1 }
              }
            ])
            .toArray();
        } else {
          // Se é professor, retorna matérias que criou
          tipo = 'criadas';
          materias = await db.collection<Materia>(COLLECTIONS.MATERIAS)
            .aggregate([
              {
                $match: { professorId: new ObjectId(usuarioId) }
              },
              {
                $addFields: {
                  totalEstudantes: { $size: { $ifNull: ['$estudantesMatriculados', []] } }
                }
              },
              {
                $sort: { nome: 1 }
              }
            ])
            .toArray();
        }
        
        return {
          success: true,
          count: materias.length,
          usuarioId,
          cargo: usuario.cargo,
          tipo,
          data: materias,
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Erro ao buscar matérias do usuário',
        });
      }
    }
  );

  // POST - Criar uma nova matéria (apenas professores)
  fastify.post<{ Body: CriarMateriaDTO }>(
    '/materias',
    {
      schema: {
        tags: ['Matérias'],
        description: 'Cria uma nova matéria. Apenas professores podem criar matérias.',
        body: criarMateriaSchema,
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: materiaSchema
            }
          },
          400: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' }
            }
          },
          403: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' }
            }
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' }
            }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { nome, descricao, professorId } = request.body;
        
        // Validações
        if (!nome || !descricao || !professorId) {
          return reply.status(400).send({
            success: false,
            error: 'Todos os campos são obrigatórios: nome, descricao, professorId',
          });
        }

        if (!ObjectId.isValid(professorId)) {
          return reply.status(400).send({
            success: false,
            error: 'ID de professor inválido',
          });
        }

        const db = getDatabase();
        
        // Verifica se o usuário existe e é um professor
        const professor = await db.collection<Usuario>(COLLECTIONS.USUARIOS)
          .findOne({ _id: new ObjectId(professorId) });
        
        if (!professor) {
          return reply.status(404).send({
            success: false,
            error: 'Professor não encontrado',
          });
        }

        if (professor.cargo !== Cargo.PROFESSOR) {
          return reply.status(403).send({
            success: false,
            error: 'Apenas professores podem criar matérias',
          });
        }
        
        // Verifica se já existe uma matéria com o mesmo nome
        const materiaExistente = await db.collection<Materia>(COLLECTIONS.MATERIAS)
          .findOne({ 
            nome: { $regex: new RegExp(`^${nome}$`, 'i') } 
          });
        
        if (materiaExistente) {
          return reply.status(409).send({
            success: false,
            error: 'Já existe uma matéria com este nome',
          });
        }
        
        const novaMateria: Materia = {
          nome,
          descricao,
          professorId: new ObjectId(professorId),
          professorNome: professor.nome,
          estudantesMatriculados: [],
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        };
        
        const result = await db.collection<Materia>(COLLECTIONS.MATERIAS).insertOne(novaMateria);
        
        return reply.status(201).send({
          success: true,
          message: 'Matéria criada com sucesso',
          data: {
            ...novaMateria,
            _id: result.insertedId,
            totalEstudantes: 0,
          },
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Erro ao criar matéria',
        });
      }
    }
  );

  // PUT - Atualizar uma matéria (apenas o professor que criou)
  fastify.put<{ 
    Params: { id: string }; 
    Body: AtualizarMateriaDTO & { professorId: string } 
  }>(
    '/materias/:id',
    {
      schema: {
        tags: ['Matérias'],
        description: 'Atualiza uma matéria. Apenas o professor que criou pode atualizar.',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ID da matéria' }
          },
          required: ['id']
        },
        body: {
          type: 'object',
          required: ['professorId'],
          properties: {
            professorId: { type: 'string', description: 'ID do professor' },
            nome: { type: 'string', description: 'Nome da matéria' },
            descricao: { type: 'string', description: 'Descrição da matéria' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: materiaSchema
            }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const { nome, descricao, professorId } = request.body;
        
        if (!ObjectId.isValid(id)) {
          return reply.status(400).send({
            success: false,
            error: 'ID inválido',
          });
        }

        if (!professorId || !ObjectId.isValid(professorId)) {
          return reply.status(400).send({
            success: false,
            error: 'ID de professor é obrigatório e deve ser válido',
          });
        }
        
        const db = getDatabase();
        
        // Verifica se a matéria existe
        const materiaExistente = await db.collection<Materia>(COLLECTIONS.MATERIAS)
          .findOne({ _id: new ObjectId(id) });
        
        if (!materiaExistente) {
          return reply.status(404).send({
            success: false,
            error: 'Matéria não encontrada',
          });
        }

        // Verifica se o usuário é o professor que criou a matéria
        if (materiaExistente.professorId.toString() !== professorId) {
          return reply.status(403).send({
            success: false,
            error: 'Você não tem permissão para editar esta matéria',
          });
        }

        // Verifica se o usuário é realmente um professor
        const professor = await db.collection<Usuario>(COLLECTIONS.USUARIOS)
          .findOne({ _id: new ObjectId(professorId) });
        
        if (!professor || professor.cargo !== Cargo.PROFESSOR) {
          return reply.status(403).send({
            success: false,
            error: 'Apenas professores podem editar matérias',
          });
        }
        
        const updateData: Partial<Materia> = {
          atualizadoEm: new Date(),
        };
        
        if (nome) {
          // Verifica se o novo nome já está em uso por outra matéria
          const nomeEmUso = await db.collection<Materia>(COLLECTIONS.MATERIAS).findOne({
            nome: { $regex: new RegExp(`^${nome}$`, 'i') },
            _id: { $ne: new ObjectId(id) },
          });
          if (nomeEmUso) {
            return reply.status(409).send({
              success: false,
              error: 'Já existe uma matéria com este nome',
            });
          }
          updateData.nome = nome;
        }
        if (descricao) updateData.descricao = descricao;
        
        if (Object.keys(updateData).length === 1) { // Apenas atualizadoEm
          return reply.status(400).send({
            success: false,
            error: 'Nenhum campo para atualizar',
          });
        }
        
        const result = await db.collection<Materia>(COLLECTIONS.MATERIAS).findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: updateData },
          { returnDocument: 'after' }
        );
        
        if (!result) {
          return reply.status(404).send({
            success: false,
            error: 'Matéria não encontrada',
          });
        }
        
        // Adiciona o contador de estudantes
        const materiaComContador = {
          ...result,
          totalEstudantes: result.estudantesMatriculados?.length || 0
        };
        
        return {
          success: true,
          message: 'Matéria atualizada com sucesso',
          data: materiaComContador,
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Erro ao atualizar matéria',
        });
      }
    }
  );

  // DELETE - Deletar uma matéria (apenas o professor que criou)
  fastify.delete<{ 
    Params: { id: string }; 
    Body: { professorId: string } 
  }>(
    '/materias/:id',
    {
      schema: {
        tags: ['Matérias'],
        description: 'Deleta uma matéria. Apenas o professor que criou pode deletar.',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ID da matéria' }
          },
          required: ['id']
        },
        body: {
          type: 'object',
          required: ['professorId'],
          properties: {
            professorId: { type: 'string', description: 'ID do professor' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const { professorId } = request.body;
        
        if (!ObjectId.isValid(id)) {
          return reply.status(400).send({
            success: false,
            error: 'ID inválido',
          });
        }

        if (!professorId || !ObjectId.isValid(professorId)) {
          return reply.status(400).send({
            success: false,
            error: 'ID de professor é obrigatório e deve ser válido',
          });
        }
        
        const db = getDatabase();
        
        // Verifica se a matéria existe
        const materia = await db.collection<Materia>(COLLECTIONS.MATERIAS)
          .findOne({ _id: new ObjectId(id) });
        
        if (!materia) {
          return reply.status(404).send({
            success: false,
            error: 'Matéria não encontrada',
          });
        }

        // Verifica se o usuário é o professor que criou a matéria
        if (materia.professorId.toString() !== professorId) {
          return reply.status(403).send({
            success: false,
            error: 'Você não tem permissão para deletar esta matéria',
          });
        }

        // Verifica se o usuário é realmente um professor
        const professor = await db.collection<Usuario>(COLLECTIONS.USUARIOS)
          .findOne({ _id: new ObjectId(professorId) });
        
        if (!professor || professor.cargo !== Cargo.PROFESSOR) {
          return reply.status(403).send({
            success: false,
            error: 'Apenas professores podem deletar matérias',
          });
        }
        
        const result = await db.collection<Materia>(COLLECTIONS.MATERIAS)
          .deleteOne({ _id: new ObjectId(id) });
        
        if (result.deletedCount === 0) {
          return reply.status(404).send({
            success: false,
            error: 'Matéria não encontrada',
          });
        }
        
        return {
          success: true,
          message: 'Matéria deletada com sucesso',
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Erro ao deletar matéria',
        });
      }
    }
  );

  // POST - Matricular um estudante em uma matéria (apenas professores)
  fastify.post<{ 
    Params: { id: string }; 
    Body: MatricularEstudanteDTO 
  }>(
    '/materias/:id/matricular',
    {
      schema: {
        tags: ['Matérias'],
        description: 'Matricula um estudante em uma matéria. Apenas professores podem fazer esta operação.',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ID da matéria' }
          },
          required: ['id']
        },
        body: matricularEstudanteSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: materiaSchema
            }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const { professorId, estudanteId } = request.body;
        
        if (!ObjectId.isValid(id)) {
          return reply.status(400).send({
            success: false,
            error: 'ID de matéria inválido',
          });
        }

        if (!ObjectId.isValid(professorId)) {
          return reply.status(400).send({
            success: false,
            error: 'ID de professor inválido',
          });
        }

        if (!ObjectId.isValid(estudanteId)) {
          return reply.status(400).send({
            success: false,
            error: 'ID de estudante inválido',
          });
        }
        
        const db = getDatabase();
        
        // Verifica se o professor existe e é realmente um professor
        const professor = await db.collection<Usuario>(COLLECTIONS.USUARIOS)
          .findOne({ _id: new ObjectId(professorId) });
        
        if (!professor) {
          return reply.status(404).send({
            success: false,
            error: 'Professor não encontrado',
          });
        }

        if (professor.cargo !== Cargo.PROFESSOR) {
          return reply.status(403).send({
            success: false,
            error: 'Apenas professores podem matricular estudantes',
          });
        }

        // Verifica se o estudante existe e é realmente um estudante
        const estudante = await db.collection<Usuario>(COLLECTIONS.USUARIOS)
          .findOne({ _id: new ObjectId(estudanteId) });
        
        if (!estudante) {
          return reply.status(404).send({
            success: false,
            error: 'Estudante não encontrado',
          });
        }

        if (estudante.cargo !== Cargo.ESTUDANTE) {
          return reply.status(400).send({
            success: false,
            error: 'O usuário especificado não é um estudante',
          });
        }

        // Verifica se a matéria existe
        const materia = await db.collection<Materia>(COLLECTIONS.MATERIAS)
          .findOne({ _id: new ObjectId(id) });
        
        if (!materia) {
          return reply.status(404).send({
            success: false,
            error: 'Matéria não encontrada',
          });
        }

        // Verifica se o estudante já está matriculado
        const jaMatriculado = materia.estudantesMatriculados.some(
          estudanteIdMatriculado => estudanteIdMatriculado.toString() === estudanteId
        );

        if (jaMatriculado) {
          return reply.status(409).send({
            success: false,
            error: 'Estudante já está matriculado nesta matéria',
          });
        }

        // Matricula o estudante
        const result = await db.collection<Materia>(COLLECTIONS.MATERIAS).findOneAndUpdate(
          { _id: new ObjectId(id) },
          { 
            $push: { estudantesMatriculados: new ObjectId(estudanteId) },
            $set: { atualizadoEm: new Date() }
          },
          { returnDocument: 'after' }
        );
        
        if (!result) {
          return reply.status(404).send({
            success: false,
            error: 'Matéria não encontrada',
          });
        }
        
        // Adiciona o contador de estudantes
        const materiaComContador = {
          ...result,
          totalEstudantes: result.estudantesMatriculados?.length || 0
        };
        
        return {
          success: true,
          message: `Estudante ${estudante.nome} matriculado com sucesso na matéria ${result.nome}`,
          data: materiaComContador,
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Erro ao matricular estudante',
        });
      }
    }
  );

  // DELETE - Desmatricular um estudante de uma matéria (apenas professores)
  fastify.delete<{ 
    Params: { id: string }; 
    Body: MatricularEstudanteDTO 
  }>(
    '/materias/:id/desmatricular',
    {
      schema: {
        tags: ['Matérias'],
        description: 'Desmatricula um estudante de uma matéria. Apenas professores podem fazer esta operação.',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ID da matéria' }
          },
          required: ['id']
        },
        body: matricularEstudanteSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: materiaSchema
            }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const { professorId, estudanteId } = request.body;
        
        if (!ObjectId.isValid(id)) {
          return reply.status(400).send({
            success: false,
            error: 'ID de matéria inválido',
          });
        }

        if (!ObjectId.isValid(professorId)) {
          return reply.status(400).send({
            success: false,
            error: 'ID de professor inválido',
          });
        }

        if (!ObjectId.isValid(estudanteId)) {
          return reply.status(400).send({
            success: false,
            error: 'ID de estudante inválido',
          });
        }
        
        const db = getDatabase();
        
        // Verifica se o professor existe e é realmente um professor
        const professor = await db.collection<Usuario>(COLLECTIONS.USUARIOS)
          .findOne({ _id: new ObjectId(professorId) });
        
        if (!professor) {
          return reply.status(404).send({
            success: false,
            error: 'Professor não encontrado',
          });
        }

        if (professor.cargo !== Cargo.PROFESSOR) {
          return reply.status(403).send({
            success: false,
            error: 'Apenas professores podem desmatricular estudantes',
          });
        }

        // Verifica se o estudante existe
        const estudante = await db.collection<Usuario>(COLLECTIONS.USUARIOS)
          .findOne({ _id: new ObjectId(estudanteId) });
        
        if (!estudante) {
          return reply.status(404).send({
            success: false,
            error: 'Estudante não encontrado',
          });
        }

        // Verifica se a matéria existe
        const materia = await db.collection<Materia>(COLLECTIONS.MATERIAS)
          .findOne({ _id: new ObjectId(id) });
        
        if (!materia) {
          return reply.status(404).send({
            success: false,
            error: 'Matéria não encontrada',
          });
        }

        // Verifica se o estudante está matriculado
        const estaMatriculado = materia.estudantesMatriculados.some(
          estudanteIdMatriculado => estudanteIdMatriculado.toString() === estudanteId
        );

        if (!estaMatriculado) {
          return reply.status(404).send({
            success: false,
            error: 'Estudante não está matriculado nesta matéria',
          });
        }

        // Desmatricula o estudante
        const result = await db.collection<Materia>(COLLECTIONS.MATERIAS).findOneAndUpdate(
          { _id: new ObjectId(id) },
          { 
            $pull: { estudantesMatriculados: new ObjectId(estudanteId) },
            $set: { atualizadoEm: new Date() }
          },
          { returnDocument: 'after' }
        );
        
        if (!result) {
          return reply.status(404).send({
            success: false,
            error: 'Matéria não encontrada',
          });
        }
        
        // Adiciona o contador de estudantes
        const materiaComContador = {
          ...result,
          totalEstudantes: result.estudantesMatriculados?.length || 0
        };
        
        return {
          success: true,
          message: `Estudante ${estudante.nome} desmatriculado com sucesso da matéria ${result.nome}`,
          data: materiaComContador,
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Erro ao desmatricular estudante',
        });
      }
    }
  );
}

