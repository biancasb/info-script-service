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
        },
        500: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' }
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
      return reply.code(500).send({
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
        description: 'Lista matérias em que o usuário (estudante ou professor) está matriculado.',
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
              tipo: { type: 'string', enum: ['matriculadas'], description: 'Tipo de matérias retornadas' },
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

        const usuario = await db.collection<Usuario>(COLLECTIONS.USUARIOS)
          .findOne({ _id: new ObjectId(usuarioId) });

        if (!usuario) {
          return reply.status(404).send({
            success: false,
            error: 'Usuário não encontrado',
          });
        }

        const materias = await db.collection<Materia>(COLLECTIONS.MATERIAS)
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
            { $sort: { nome: 1 } }
          ])
          .toArray();

        return {
          success: true,
          count: materias.length,
          usuarioId,
          cargo: usuario.cargo,
          tipo: 'matriculadas',
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


  // DELETE - Deletar uma matéria pelo ID
  fastify.delete<{ Params: { id: string } }>(
    '/materias/:id',
    {
      schema: {
        tags: ['Matérias'],
        description: 'Deleta uma matéria pelo ID.',
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
              message: { type: 'string' }
            }
          },
          400: {
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
        const { id } = request.params;

        if (!ObjectId.isValid(id)) {
          return reply.status(400).send({
            success: false,
            error: 'ID inválido',
          });
        }

        const db = getDatabase();

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

  // POST - Matricular um usuário na matéria (professor ou estudante)
  fastify.post<{ 
    Params: { id: string }; 
    Body: MatricularEstudanteDTO 
  }>(
    '/materias/:id/matricular',
    {
      schema: {
        tags: ['Matérias'],
        description: 'Matricula um usuário (professor ou estudante) em uma matéria.',
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
        const { estudanteId } = request.body;
        
        if (!ObjectId.isValid(id)) {
          return reply.status(400).send({
            success: false,
            error: 'ID de matéria inválido',
          });
        }

        if (!ObjectId.isValid(estudanteId)) {
          return reply.status(400).send({
            success: false,
            error: 'ID de usuário inválido',
          });
        }
        
        const db = getDatabase();

        // Verifica se o usuário existe
        const estudante = await db.collection<Usuario>(COLLECTIONS.USUARIOS)
          .findOne({ _id: new ObjectId(estudanteId) });
        
        if (!estudante) {
          return reply.status(404).send({
            success: false,
            error: 'Usuário não encontrado',
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

        // Verifica se o usuário já está matriculado
        const jaMatriculado = materia.estudantesMatriculados?.some(
          estudanteIdMatriculado => estudanteIdMatriculado.toString() === estudanteId
        );

        if (jaMatriculado) {
          return reply.status(409).send({
            success: false,
            error: 'Usuário já está matriculado nesta matéria',
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
          message: `Usuário ${estudante.nome} matriculado com sucesso na matéria ${result.nome}`,
          data: materiaComContador,
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          error: 'Erro ao matricular usuário',
        });
      }
    }
  );

  // DELETE - Desmatricular um usuário de uma matéria (professor ou estudante)
  fastify.delete<{ 
    Params: { id: string }; 
    Body: { usuarioId: string } 
  }>(
    '/materias/:id/desmatricular',
    {
      schema: {
        tags: ['Matérias'],
        description: 'Desmatricula um usuário (professor ou estudante) de uma matéria.',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ID da matéria' }
          },
          required: ['id']
        },
        body: {
          type: 'object',
          properties: {
            usuarioId: { type: 'string', description: 'ID do usuário a desmatricular' }
          },
          required: ['usuarioId']
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: materiaSchema
            }
          },
          400: {
            type: 'object',
            properties: { success: { type: 'boolean' }, error: { type: 'string' } }
          },
          404: {
            type: 'object',
            properties: { success: { type: 'boolean' }, error: { type: 'string' } }
          },
          500: {
            type: 'object',
            properties: { success: { type: 'boolean' }, error: { type: 'string' } }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const { usuarioId } = request.body;

        if (!ObjectId.isValid(id)) {
          return reply.code(400).send({
            success: false,
            error: 'ID de matéria inválido',
          });
        }

        if (!ObjectId.isValid(usuarioId)) {
          return reply.code(400).send({
            success: false,
            error: 'ID de usuário inválido',
          });
        }

        const db = getDatabase();

        // Verifica se o usuário existe
        const usuario = await db.collection<Usuario>(COLLECTIONS.USUARIOS)
          .findOne({ _id: new ObjectId(usuarioId) });

        if (!usuario) {
          return reply.code(404).send({
            success: false,
            error: 'Usuário não encontrado',
          });
        }

        // Verifica se a matéria existe
        const materia = await db.collection<Materia>(COLLECTIONS.MATERIAS)
          .findOne({ _id: new ObjectId(id) });

        if (!materia) {
          return reply.code(404).send({
            success: false,
            error: 'Matéria não encontrada',
          });
        }

        // Verifica se o usuário está matriculado
        const estaMatriculado = materia.estudantesMatriculados?.some(
          idMatriculado => idMatriculado.toString() === usuarioId
        );

        if (!estaMatriculado) {
          return reply.code(404).send({
            success: false,
            error: 'Usuário não está matriculado nesta matéria',
          });
        }

        // Desmatricula o usuário
        const result = await db.collection<Materia>(COLLECTIONS.MATERIAS).findOneAndUpdate(
          { _id: new ObjectId(id) },
          {
            $pull: { estudantesMatriculados: new ObjectId(usuarioId) },
            $set: { atualizadoEm: new Date() }
          },
          { returnDocument: 'after' }
        );

        if (!result) {
          return reply.code(404).send({
            success: false,
            error: 'Matéria não encontrada',
          });
        }

        const materiaComContador = {
          ...result,
          totalEstudantes: result.estudantesMatriculados?.length || 0
        };

        return {
          success: true,
            message: `Usuário ${usuario.nome} desmatriculado com sucesso da matéria ${result.nome}`,
          data: materiaComContador,
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          error: 'Erro ao desmatricular usuário',
        });
      }
    }
  );
}