import { FastifyInstance } from 'fastify';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../config/database';
import { Postagem, CriarPostagemDTO, AtualizarPostagemDTO } from '../types/postagem';
import { Usuario, Cargo } from '../types/usuario';
import { Materia } from '../types/materia';
import { JWTPayload } from '../types/auth';
import { postagemSchema, criarPostagemSchema } from '../schemas/postagem.schema';
import { COLLECTIONS } from '../constants';

export async function postagensRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: { tag?: string } }>(
    '/postagens',
    {
      onRequest: [fastify.optionalAuthenticate],
      schema: {
        tags: ['Postagens'],
        description: 'Retorna feed de postagens. Se autenticado: feed personalizado (usuário + quem ele segue). Se não autenticado: todas as postagens. Filtro opcional por tag.',
        security: [{ bearerAuth: [] }, {}],
        querystring: {
          type: 'object',
          properties: {
            tag: { type: 'string', description: 'Filtrar por disciplina/matéria' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              count: { type: 'number' },
              authenticated: { type: 'boolean', description: 'Se o usuário está autenticado' },
              feedType: { type: 'string', enum: ['personalizado', 'geral'], description: 'Tipo de feed retornado' },
              data: {
                type: 'array',
                items: postagemSchema
              }
            }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { tag } = request.query;
        const db = getDatabase();

        let query: any = {};
        let feedType: 'personalizado' | 'geral' = 'geral';
        let authenticated = false;

        if (request.user) {
          const { userId } = request.user as JWTPayload;
          authenticated = true;
          feedType = 'personalizado';

          const usuario = await db.collection<Usuario>(COLLECTIONS.USUARIOS)
            .findOne({ _id: new ObjectId(userId) });
          
          if (usuario) {
            const idsParaBuscar = [
              new ObjectId(userId),
              ...(usuario.seguindo || [])
            ];
            
            query.autorId = { $in: idsParaBuscar };
          }
        }

        if (tag) {
          query.tag = { $regex: new RegExp(`^${tag}$`, 'i') };
        }

        const postagens = await db.collection<Postagem>(COLLECTIONS.POSTAGENS)
          .aggregate([
            {
              $match: query
            },
            {
              $lookup: {
                from: COLLECTIONS.USUARIOS,
                localField: 'autorId',
                foreignField: '_id',
                as: 'autorInfo'
              }
            },
            {
              $unwind: {
                path: '$autorInfo',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $addFields: {
                totalCurtidas: { $size: { $ifNull: ['$curtidas', []] } },
                anoIngresso: '$autorInfo.anoIngresso',
                link: {
                  $cond: [
                    { $gt: [{ $strLenCP: { $ifNull: ['$link', ''] } }, 0] },
                    '$link',
                    { $concat: ['/postagens/', { $toString: '$_id' }] }
                  ]
                }
              }
            },
            {
              $project: {
                autorInfo: 0
              }
            },
            {
              $sort: { criadoEm: -1 }
            }
          ])
          .toArray();
        
        return {
          success: true,
          count: postagens.length,
          authenticated,
          feedType,
          data: postagens,
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Erro ao buscar feed de postagens',
        });
      }
    }
  );

  fastify.get<{ Params: { id: string } }>('/postagens/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      
      if (!ObjectId.isValid(id)) {
        return reply.status(400).send({
          success: false,
          error: 'ID inválido',
        });
      }
      
      const db = getDatabase();
      const postagens = await db.collection<Postagem>(COLLECTIONS.POSTAGENS)
        .aggregate([
          {
            $match: { _id: new ObjectId(id) }
          },
          {
            $addFields: {
              totalCurtidas: { $size: { $ifNull: ['$curtidas', []] } }
            }
          }
        ])
        .toArray();
      
      if (!postagens || postagens.length === 0) {
        return reply.status(404).send({
          success: false,
          error: 'Postagem não encontrada',
        });
      }
      
      return {
        success: true,
        data: postagens[0],
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erro ao buscar postagem',
      });
    }
  });

  fastify.get<{ Params: { usuarioId: string } }>(
    '/postagens/usuario/:usuarioId',
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
        const postagens = await db.collection<Postagem>(COLLECTIONS.POSTAGENS)
          .aggregate([
            {
              $match: { autorId: new ObjectId(usuarioId) }
            },
            {
              $addFields: {
                totalCurtidas: { $size: { $ifNull: ['$curtidas', []] } }
              }
            },
            {
              $sort: { criadoEm: -1 }
            }
          ])
          .toArray();
        
        return {
          success: true,
          count: postagens.length,
          data: postagens,
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Erro ao buscar postagens do usuário',
        });
      }
    }
  );

  fastify.get<{ Params: { tag: string } }>(
    '/postagens/tag/:tag',
    async (request, reply) => {
      try {
        const { tag } = request.params;
        
        const db = getDatabase();
        const postagens = await db.collection<Postagem>(COLLECTIONS.POSTAGENS)
          .aggregate([
            {
              $match: { tag: { $regex: new RegExp(`^${tag}$`, 'i') } }
            },
            {
              $addFields: {
                totalCurtidas: { $size: { $ifNull: ['$curtidas', []] } }
              }
            },
            {
              $sort: { criadoEm: -1 }
            }
          ])
          .toArray();
        
        return {
          success: true,
          count: postagens.length,
          tag,
          data: postagens,
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Erro ao buscar postagens por tag',
        });
      }
    }
  );

  fastify.get('/postagens/tags/lista', async (_request, reply) => {
    try {
      const db = getDatabase();
      const tags = await db.collection<Postagem>(COLLECTIONS.POSTAGENS)
        .distinct('tag');
      
      return {
        success: true,
        count: tags.length,
        data: tags.sort(),
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erro ao buscar tags',
      });
    }
  });

  fastify.post<{ Body: CriarPostagemDTO }>(
    '/postagens',
    {
      schema: {
        tags: ['Postagens'],
        description: 'Cria uma nova postagem vinculada a um usuário',
        body: criarPostagemSchema,
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: postagemSchema
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
              error: { type: 'string', description: 'Mensagem de erro' }
            }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { titulo, texto, tag, autorId, link } = request.body;
        
        if (!titulo || !texto || !tag || !autorId) {
          return reply.status(400).send({
            success: false,
            error: 'Todos os campos são obrigatórios: titulo, texto, tag, autorId',
          });
        }

        if (!ObjectId.isValid(autorId)) {
          return reply.status(400).send({
            success: false,
            error: 'ID de autor inválido',
          });
        }

        const db = getDatabase();
        
        const usuario = await db.collection<Usuario>(COLLECTIONS.USUARIOS)
          .findOne({ _id: new ObjectId(autorId) });
        
        if (!usuario) {
          return reply.status(404).send({
            success: false,
            error: 'Usuário não encontrado',
          });
        }

        const materiaExiste = await db.collection<Materia>(COLLECTIONS.MATERIAS)
          .findOne({ 
            nome: { $regex: new RegExp(`^${tag}$`, 'i') } 
          });
        
        if (!materiaExiste) {
          return reply.status(400).send({
            success: false,
            error: 'A tag informada não corresponde a nenhuma matéria cadastrada no sistema',
          });
        }
        
        const novaPostagem: Postagem = {
          titulo,
          texto,
          tag: materiaExiste.nome,
          link: link || undefined,
          autorId: new ObjectId(autorId),
          autorNome: usuario.nome,
          autorNickname: usuario.nickname,
          anoIngresso: usuario.anoIngresso,
          curtidas: [],
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        };
        
        const result = await db.collection<Postagem>(COLLECTIONS.POSTAGENS).insertOne(novaPostagem);
        await db.collection<Materia>(COLLECTIONS.MATERIAS).updateOne(
          { nome: { $regex: new RegExp(`^${materiaExiste.nome}$`, 'i') } },
          {
            $addToSet: { estudantesMatriculados: new ObjectId(autorId) },
            $set: { atualizadoEm: new Date() }
          }
        );

        return reply.status(201).send({
          success: true,
          message: 'Postagem criada com sucesso',
          data: {
            ...novaPostagem,
            _id: result.insertedId,
          },
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Erro ao criar postagem',
        });
      }
    }
  );

  fastify.put<{ Params: { id: string }; Body: AtualizarPostagemDTO & { autorId: string } }>(
    '/postagens/:id',
    async (request, reply) => {
      try {
        const { id } = request.params;
        const { titulo, texto, tag, autorId } = request.body;
        
        if (!ObjectId.isValid(id)) {
          return reply.status(400).send({
            success: false,
            error: 'ID inválido',
          });
        }

        if (!autorId || !ObjectId.isValid(autorId)) {
          return reply.status(400).send({
            success: false,
            error: 'ID de autor é obrigatório e deve ser válido',
          });
        }
        
        const db = getDatabase();
        
        const postagemExistente = await db.collection<Postagem>(COLLECTIONS.POSTAGENS)
          .findOne({ _id: new ObjectId(id) });
        
        if (!postagemExistente) {
          return reply.status(404).send({
            success: false,
            error: 'Postagem não encontrada',
          });
        }

        if (postagemExistente.autorId.toString() !== autorId) {
          return reply.status(403).send({
            success: false,
            error: 'Você não tem permissão para editar esta postagem',
          });
        }
        
        const updateData: Partial<Postagem> = {
          atualizadoEm: new Date(),
        };
        
        if (titulo) updateData.titulo = titulo;
        if (texto) updateData.texto = texto;
        if (tag) updateData.tag = tag;
        
        if (Object.keys(updateData).length === 1) {
          return reply.status(400).send({
            success: false,
            error: 'Nenhum campo para atualizar',
          });
        }
        
        const result = await db.collection<Postagem>(COLLECTIONS.POSTAGENS).findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: updateData },
          { returnDocument: 'after' }
        );
        
        if (!result) {
          return reply.status(404).send({
            success: false,
            error: 'Postagem não encontrada',
          });
        }
        
        return {
          success: true,
          message: 'Postagem atualizada com sucesso',
          data: result,
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Erro ao atualizar postagem',
        });
      }
    }
  );

  fastify.delete<{ Params: { id: string }; Body: { autorId: string } }>(
    '/postagens/:id',
    {
      schema: {
        tags: ['Postagens'],
        description: 'Deleta uma postagem pelo ID. Apenas o autor pode deletar. Se esta for a última postagem do autor com a mesma tag (matéria), o autor é desvinculado da matéria automaticamente.',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ID da postagem' }
          },
          required: ['id']
        },
        body: {
          type: 'object',
          properties: {
            autorId: { type: 'string', description: 'ID do autor da postagem' }
          },
          required: ['autorId']
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
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const { autorId } = request.body;
        
        if (!ObjectId.isValid(id)) {
          return reply.code(400).send({
            success: false,
            error: 'ID inválido',
          });
        }

        if (!autorId || !ObjectId.isValid(autorId)) {
          return reply.code(400).send({
            success: false,
            error: 'ID de autor é obrigatório e deve ser válido',
          });
        }
        
        const db = getDatabase();
        
        const postagem = await db.collection<Postagem>(COLLECTIONS.POSTAGENS)
          .findOne({ _id: new ObjectId(id) });
        
        if (!postagem) {
          return reply.code(404).send({
            success: false,
            error: 'Postagem não encontrada',
          });
        }

        if (postagem.autorId.toString() !== autorId) {
          return reply.code(403).send({
            success: false,
            error: 'Você não tem permissão para deletar esta postagem',
          });
        }
        
        const result = await db.collection<Postagem>(COLLECTIONS.POSTAGENS)
          .deleteOne({ _id: new ObjectId(id) });
        
        if (result.deletedCount === 0) {
          return reply.code(404).send({
            success: false,
            error: 'Postagem não encontrada',
          });
        }

        const restantes = await db.collection<Postagem>(COLLECTIONS.POSTAGENS).countDocuments({
          autorId: postagem.autorId,
          tag: postagem.tag
        });

        if (restantes === 0) {
          await db.collection<Materia>(COLLECTIONS.MATERIAS).updateOne(
            { nome: { $regex: new RegExp(`^${postagem.tag}$`, 'i') } },
            {
              $pull: { estudantesMatriculados: postagem.autorId },
              $set: { atualizadoEm: new Date() }
            }
          );
        }
        
        return {
          success: true,
          message: 'Postagem deletada com sucesso',
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          error: 'Erro ao deletar postagem',
        });
      }
    }
  );


  fastify.post<{ Body: { postagemId: string } }>(
    '/postagens/toggle-curtida',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Postagens'],
        description: 'Toggle curtir/descurtir uma postagem (requer autenticação)',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['postagemId'],
          properties: {
            postagemId: { type: 'string', description: 'ID da postagem' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              action: { type: 'string', enum: ['curtiu', 'descurtiu'], description: 'Ação realizada' },
              totalCurtidas: { type: 'number' }
            }
          },
          400: {
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
        const { userId } = request.user as JWTPayload;
        const { postagemId } = request.body;
        
        if (!postagemId) {
          return reply.status(400).send({
            success: false,
            error: 'postagemId é obrigatório',
          });
        }

        if (!ObjectId.isValid(postagemId)) {
          return reply.status(400).send({
            success: false,
            error: 'ID de postagem inválido',
          });
        }

        const db = getDatabase();
        const usuarioObjId = new ObjectId(userId);
        const postagemObjId = new ObjectId(postagemId);
        
        const postagem = await db.collection<Postagem>(COLLECTIONS.POSTAGENS).findOne({ _id: postagemObjId });
        
        if (!postagem) {
          return reply.status(404).send({
            success: false,
            error: 'Postagem não encontrada',
          });
        }

        const jaCurtiu = postagem.curtidas?.some(id => id.toString() === userId);
        
        let result;
        let action: 'curtiu' | 'descurtiu';
        
        if (jaCurtiu) {
          result = await db.collection<Postagem>(COLLECTIONS.POSTAGENS).findOneAndUpdate(
            { _id: postagemObjId },
            { 
              $pull: { curtidas: usuarioObjId },
              $set: { atualizadoEm: new Date() }
            },
            { returnDocument: 'after' }
          );
          action = 'descurtiu';
        } else {
          result = await db.collection<Postagem>(COLLECTIONS.POSTAGENS).findOneAndUpdate(
            { _id: postagemObjId },
            { 
              $addToSet: { curtidas: usuarioObjId },
              $set: { atualizadoEm: new Date() }
            },
            { returnDocument: 'after' }
          );
          action = 'curtiu';
        }
        
        return {
          success: true,
          message: action === 'curtiu' ? 'Postagem curtida com sucesso' : 'Curtida removida com sucesso',
          action,
          totalCurtidas: result?.curtidas?.length || 0,
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Erro ao processar requisição',
        });
      }
    }
  );

  fastify.get<{ Params: { postagemId: string } }>(
    '/postagens/:postagemId/curtidas',
    {
      schema: {
        tags: ['Postagens'],
        description: 'Lista todos os usuários que curtiram uma postagem',
        params: {
          type: 'object',
          properties: {
            postagemId: { type: 'string', description: 'ID da postagem' }
          },
          required: ['postagemId']
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              totalCurtidas: { type: 'number' },
              data: {
                type: 'array',
                items: {
                  type: 'object'
                }
              }
            }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { postagemId } = request.params;
        
        if (!ObjectId.isValid(postagemId)) {
          return reply.status(400).send({
            success: false,
            error: 'ID de postagem inválido',
          });
        }

        const db = getDatabase();
        const postagem = await db.collection<Postagem>(COLLECTIONS.POSTAGENS)
          .findOne({ _id: new ObjectId(postagemId) });
        
        if (!postagem) {
          return reply.status(404).send({
            success: false,
            error: 'Postagem não encontrada',
          });
        }

        if (!postagem.curtidas || postagem.curtidas.length === 0) {
          return {
            success: true,
            totalCurtidas: 0,
            data: [],
          };
        }

        const usuariosQueCurtiram = await db.collection<Usuario>(COLLECTIONS.USUARIOS)
          .find({ _id: { $in: postagem.curtidas } })
          .project({ senha: 0 }) 
          .toArray();
        
        return {
          success: true,
          totalCurtidas: usuariosQueCurtiram.length,
          data: usuariosQueCurtiram,
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Erro ao buscar curtidas',
        });
      }
    }
  );

  fastify.get('/postagens/ranking/curtidas', {
    schema: {
      tags: ['Postagens'],
      description: 'Retorna ranking das 20 postagens mais curtidas',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            count: { type: 'number' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  titulo: { type: 'string' },
                  texto: { type: 'string' },
                  tag: { type: 'string' },
                  autorNome: { type: 'string' },
                  totalCurtidas: { type: 'number' },
                  criadoEm: { type: 'string', format: 'date-time' }
                }
              }
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
      
      const postagens = await db.collection<Postagem>(COLLECTIONS.POSTAGENS)
        .aggregate([
          {
            $addFields: {
              totalCurtidas: { $size: { $ifNull: ['$curtidas', []] } }
            }
          },
          {
            $sort: { totalCurtidas: -1 }
          },
          {
            $limit: 20 
          }
        ])
        .toArray();
      
      return {
        success: true,
        count: postagens.length,
        data: postagens,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Erro ao buscar ranking de curtidas',
      });
    }
  });

  fastify.get<{ Querystring: { q?: string } }>(
    '/postagens/search/geral',
    {
      schema: {
        tags: ['Postagens'],
        description: 'Busca geral em todos os campos de postagens (título, texto, tag, autor) usando OR',
        querystring: {
          type: 'object',
          properties: {
            q: { type: 'string', description: 'Termo de busca' }
          },
          required: ['q']
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              count: { type: 'number' },
              query: { type: 'string' },
              data: {
                type: 'array',
                items: postagemSchema
              }
            }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { q } = request.query;

        if (!q || q.trim().length === 0) {
          return reply.status(400).send({
            success: false,
            error: 'Termo de busca obrigatório',
          });
        }

        const db = getDatabase();
        const searchTerm = q.trim();
        
        const regex = new RegExp(searchTerm, 'i');

        const postagens = await db.collection<Postagem>(COLLECTIONS.POSTAGENS)
          .aggregate([
            {
              $match: {
                $or: [
                  { titulo: regex },
                  { texto: regex },
                  { tag: regex },
                  { 'autor.nome': regex },
                  { 'autor.nickname': regex }
                ]
              }
            },
            {
              $addFields: {
                totalCurtidas: { $size: { $ifNull: ['$curtidas', []] } }
              }
            },
            {
              $sort: { criadoEm: -1 }
            }
          ])
          .toArray();

        return {
          success: true,
          count: postagens.length,
          query: searchTerm,
          data: postagens,
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Erro ao realizar busca',
        });
      }
    }
  );
}


