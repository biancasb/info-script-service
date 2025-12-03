import { FastifyInstance } from 'fastify';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { getDatabase } from '../config/database';
import { Usuario, CriarUsuarioDTO, AtualizarUsuarioDTO, UsuarioResponse, Cargo } from '../types/usuario';
import { JWTPayload } from '../types/auth';
import { usuarioSchema, criarUsuarioSchema, loginSchema, seguirSchema } from '../schemas/usuario.schema';
import { config } from '../config/env';
import { COLLECTIONS, ERROR_MESSAGES, SUCCESS_MESSAGES, HTTP_STATUS } from '../constants';
import { successResponse, errorResponse, listResponse } from '../utils/response';
import { isValidObjectId, validateRequiredFields, isValidYear } from '../utils/validation';

const SALT_ROUNDS = 10;

// Função para remover a senha do objeto retornado
function removerSenha(usuario: Usuario): UsuarioResponse {
  const { senha, ...usuarioSemSenha } = usuario;
  return usuarioSemSenha as UsuarioResponse;
}

export async function usuariosRoutes(fastify: FastifyInstance) {
  
  // GET - Listar todos os usuários
  fastify.get('/usuarios', {
    schema: {
      tags: ['Usuários'],
      description: 'Lista todos os usuários cadastrados (estudantes e professores)',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            count: { type: 'number' },
            data: {
              type: 'array',
              items: usuarioSchema
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
  }, async (request, reply) => {
    try {
      const db = getDatabase();
      const usuarios = await db.collection<Usuario>(COLLECTIONS.USUARIOS).find().toArray();
      const usuariosSemSenha = usuarios.map(removerSenha);
      
      return listResponse(usuariosSemSenha);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(
        errorResponse(ERROR_MESSAGES.INTERNAL_ERROR)
      );
    }
  });

  // GET - Buscar um usuário por ID
  fastify.get<{ Params: { id: string } }>('/usuarios/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const db = getDatabase();
      
      if (!ObjectId.isValid(id)) {
        return reply.status(400).send({
          success: false,
          error: 'ID inválido',
        });
      }
      
      const usuario = await db.collection<Usuario>(COLLECTIONS.USUARIOS).findOne({ _id: new ObjectId(id) });
      
      if (!usuario) {
        return reply.status(404).send({
          success: false,
          error: 'Usuário não encontrado',
        });
      }
      
      return {
        success: true,
        data: removerSenha(usuario),
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erro ao buscar usuário',
      });
    }
  });

  // GET - Buscar usuário por nickname
  fastify.get<{ Params: { nickname: string } }>('/usuarios/nickname/:nickname', async (request, reply) => {
    try {
      const { nickname } = request.params;
      const db = getDatabase();
      
      const usuario = await db.collection<Usuario>(COLLECTIONS.USUARIOS).findOne({ nickname });
      
      if (!usuario) {
        return reply.status(404).send({
          success: false,
          error: 'Usuário não encontrado',
        });
      }
      
      return {
        success: true,
        data: removerSenha(usuario),
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erro ao buscar usuário',
      });
    }
  });

  // GET - Listar usuários por cargo
  fastify.get<{ Params: { cargo: string } }>('/usuarios/cargo/:cargo', async (request, reply) => {
    try {
      const { cargo } = request.params;
      
      if (!Object.values(Cargo).includes(cargo as Cargo)) {
        return reply.status(400).send({
          success: false,
          error: 'Cargo inválido. Use "estudante" ou "professor"',
        });
      }
      
      const db = getDatabase();
      const usuarios = await db.collection<Usuario>(COLLECTIONS.USUARIOS).find({ cargo: cargo as Cargo }).toArray();
      
      const usuariosSemSenha = usuarios.map(removerSenha);
      
      return {
        success: true,
        count: usuariosSemSenha.length,
        data: usuariosSemSenha,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erro ao buscar usuários',
      });
    }
  });

  // POST - Criar um novo usuário
  fastify.post<{ Body: CriarUsuarioDTO }>('/usuarios', {
    schema: {
      tags: ['Usuários'],
      description: 'Cria um novo usuário (estudante ou professor)',
      body: criarUsuarioSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: usuarioSchema
          }
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' }
          }
        },
          409: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string', description: 'Mensagem de erro' }
            }
          }
      }
    }
  }, async (request, reply) => {
    try {
      const { nome, nickname, senha, anoIngresso, cargo } = request.body;
      
      // Validações
      if (!nome || !nickname || !senha || !anoIngresso || !cargo) {
        return reply.status(400).send({
          success: false,
          error: 'Todos os campos são obrigatórios: nome, nickname, senha, anoIngresso, cargo',
        });
      }

      if (!Object.values(Cargo).includes(cargo)) {
        return reply.status(400).send({
          success: false,
          error: 'Cargo inválido. Use "estudante" ou "professor"',
        });
      }

      const anoAtual = new Date().getFullYear();
      if (anoIngresso < 1900 || anoIngresso > anoAtual + 1) {
        return reply.status(400).send({
          success: false,
          error: `Ano de ingresso inválido. Deve estar entre 1900 e ${anoAtual + 1}`,
        });
      }

      const db = getDatabase();
      
      // Verifica se o nickname já existe
      const usuarioExistente = await db.collection<Usuario>(COLLECTIONS.USUARIOS).findOne({ nickname });
      if (usuarioExistente) {
        return reply.status(409).send({
          success: false,
          error: 'Nickname já está em uso',
        });
      }
      
      // Hash da senha
      const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
      
      const novoUsuario: Usuario = {
        nome,
        nickname,
        senha: senhaHash,
        anoIngresso,
        cargo,
        seguindo: [],
        seguidores: [],
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };
      
      const result = await db.collection<Usuario>(COLLECTIONS.USUARIOS).insertOne(novoUsuario);
      
      return reply.status(201).send({
        success: true,
        message: 'Usuário criado com sucesso',
        data: removerSenha({
          ...novoUsuario,
          _id: result.insertedId,
        }),
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erro ao criar usuário',
      });
    }
  });

  // PUT - Atualizar um usuário
  fastify.put<{ Params: { id: string }; Body: AtualizarUsuarioDTO }>(
    '/usuarios/:id',
    async (request, reply) => {
      try {
        const { id } = request.params;
        const { nome, nickname, senha, anoIngresso, cargo } = request.body;
        
        if (!ObjectId.isValid(id)) {
          return reply.status(400).send({
            success: false,
            error: 'ID inválido',
          });
        }
        
        const db = getDatabase();
        
        // Verifica se o usuário existe
        const usuarioExistente = await db.collection<Usuario>(COLLECTIONS.USUARIOS).findOne({ _id: new ObjectId(id) });
        if (!usuarioExistente) {
          return reply.status(404).send({
            success: false,
            error: 'Usuário não encontrado',
          });
        }
        
        const updateData: Partial<Usuario> = {
          atualizadoEm: new Date(),
        };
        
        if (nome) updateData.nome = nome;
        if (nickname) {
          // Verifica se o novo nickname já está em uso por outro usuário
          const nicknameEmUso = await db.collection<Usuario>(COLLECTIONS.USUARIOS).findOne({
            nickname,
            _id: { $ne: new ObjectId(id) },
          });
          if (nicknameEmUso) {
            return reply.status(409).send({
              success: false,
              error: 'Nickname já está em uso',
            });
          }
          updateData.nickname = nickname;
        }
        if (senha) {
          updateData.senha = await bcrypt.hash(senha, SALT_ROUNDS);
        }
        if (anoIngresso) {
          const anoAtual = new Date().getFullYear();
          if (anoIngresso < 1900 || anoIngresso > anoAtual + 1) {
            return reply.status(400).send({
              success: false,
              error: `Ano de ingresso inválido. Deve estar entre 1900 e ${anoAtual + 1}`,
            });
          }
          updateData.anoIngresso = anoIngresso;
        }
        if (cargo) {
          if (!Object.values(Cargo).includes(cargo)) {
            return reply.status(400).send({
              success: false,
              error: 'Cargo inválido. Use "estudante" ou "professor"',
            });
          }
          updateData.cargo = cargo;
        }
        
        if (Object.keys(updateData).length === 1) { // Apenas atualizadoEm
          return reply.status(400).send({
            success: false,
            error: 'Nenhum campo para atualizar',
          });
        }
        
        const result = await db.collection<Usuario>(COLLECTIONS.USUARIOS).findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: updateData },
          { returnDocument: 'after' }
        );
        
        if (!result) {
          return reply.status(404).send({
            success: false,
            error: 'Usuário não encontrado',
          });
        }
        
        return {
          success: true,
          message: 'Usuário atualizado com sucesso',
          data: removerSenha(result),
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Erro ao atualizar usuário',
        });
      }
    }
  );

  // DELETE - Deletar um usuário
  fastify.delete<{ Params: { id: string } }>('/usuarios/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      
      if (!ObjectId.isValid(id)) {
        return reply.status(400).send({
          success: false,
          error: 'ID inválido',
        });
      }
      
      const db = getDatabase();
      const result = await db.collection<Usuario>(COLLECTIONS.USUARIOS).deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        return reply.status(404).send({
          success: false,
          error: 'Usuário não encontrado',
        });
      }
      
      return {
        success: true,
        message: 'Usuário deletado com sucesso',
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Erro ao deletar usuário',
      });
    }
  });

  // POST - Login (retorna JWT token)
  fastify.post<{ Body: { nickname: string; senha: string } }>(
    '/usuarios/login',
    {
      schema: {
        tags: ['Usuários'],
        description: 'Realiza login e retorna token JWT válido por 7 dias',
        body: loginSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              token: { type: 'string', description: 'Token JWT de autenticação' },
              expiresIn: { type: 'string', description: 'Tempo de expiração do token' },
              user: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  nome: { type: 'string' },
                  nickname: { type: 'string' },
                  cargo: { type: 'string' },
                  anoIngresso: { type: 'number' }
                }
              }
            }
          },
          401: {
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
        const { nickname, senha } = request.body;
        
        if (!nickname || !senha) {
          return reply.status(400).send({
            success: false,
            error: 'Nickname e senha são obrigatórios',
          });
        }
        
        const db = getDatabase();
        const usuario = await db.collection<Usuario>(COLLECTIONS.USUARIOS).findOne({ nickname });
        
        if (!usuario) {
          return reply.status(401).send({
            success: false,
            error: 'Credenciais inválidas',
          });
        }
        
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        
        if (!senhaValida) {
          return reply.status(401).send({
            success: false,
            error: 'Credenciais inválidas',
          });
        }

        // Gera token JWT
        const payload: JWTPayload = {
          userId: usuario._id!.toString(),
          nickname: usuario.nickname,
          cargo: usuario.cargo,
        };

        const token = fastify.jwt.sign(payload);
        
        return {
          success: true,
          message: 'Login realizado com sucesso',
          token,
          expiresIn: config.jwtExpiresIn,
          user: {
            _id: usuario._id!.toString(),
            nome: usuario.nome,
            nickname: usuario.nickname,
            cargo: usuario.cargo,
            anoIngresso: usuario.anoIngresso,
          },
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Erro ao realizar login',
        });
      }
    }
  );

  // ==================== SEGUIDORES ====================

  // POST - Toggle seguir/deixar de seguir (autenticado)
  fastify.post<{ Body: { targetUserId: string } }>(
    '/usuarios/toggle-seguir',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Usuários'],
        description: 'Toggle seguir/deixar de seguir um usuário (requer autenticação)',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['targetUserId'],
          properties: {
            targetUserId: { type: 'string', description: 'ID do usuário a seguir/deixar de seguir' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              action: { type: 'string', enum: ['seguiu', 'deixou_de_seguir'], description: 'Ação realizada' }
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
        const { targetUserId } = request.body;
        
        // Validações
        if (!targetUserId) {
          return reply.status(400).send({
            success: false,
            error: 'targetUserId é obrigatório',
          });
        }

        if (userId === targetUserId) {
          return reply.status(400).send({
            success: false,
            error: 'Você não pode seguir a si mesmo',
          });
        }

        if (!ObjectId.isValid(targetUserId)) {
          return reply.status(400).send({
            success: false,
            error: 'ID de usuário inválido',
          });
        }

        const db = getDatabase();
        const usuarioObjId = new ObjectId(userId);
        const targetObjId = new ObjectId(targetUserId);
        
        // Verifica se ambos os usuários existem
        const [usuario, targetUsuario] = await Promise.all([
          db.collection<Usuario>(COLLECTIONS.USUARIOS).findOne({ _id: usuarioObjId }),
          db.collection<Usuario>(COLLECTIONS.USUARIOS).findOne({ _id: targetObjId }),
        ]);
        
        if (!usuario || !targetUsuario) {
          return reply.status(404).send({
            success: false,
            error: 'Usuário não encontrado',
          });
        }

        // Verifica se já está seguindo
        const jaSeguindo = usuario.seguindo?.some(id => id.toString() === targetUserId);
        
        if (jaSeguindo) {
          // Deixa de seguir
          await Promise.all([
            db.collection<Usuario>(COLLECTIONS.USUARIOS).updateOne(
              { _id: usuarioObjId },
              { 
                $pull: { seguindo: targetObjId },
                $set: { atualizadoEm: new Date() }
              }
            ),
            db.collection<Usuario>(COLLECTIONS.USUARIOS).updateOne(
              { _id: targetObjId },
              { 
                $pull: { seguidores: usuarioObjId },
                $set: { atualizadoEm: new Date() }
              }
            ),
          ]);
          
          return {
            success: true,
            message: `Você deixou de seguir ${targetUsuario.nome} (@${targetUsuario.nickname})`,
            action: 'deixou_de_seguir',
          };
        } else {
          // Segue
          await Promise.all([
            db.collection<Usuario>(COLLECTIONS.USUARIOS).updateOne(
              { _id: usuarioObjId },
              { 
                $addToSet: { seguindo: targetObjId },
                $set: { atualizadoEm: new Date() }
              }
            ),
            db.collection<Usuario>(COLLECTIONS.USUARIOS).updateOne(
              { _id: targetObjId },
              { 
                $addToSet: { seguidores: usuarioObjId },
                $set: { atualizadoEm: new Date() }
              }
            ),
          ]);
          
          return {
            success: true,
            message: `Você agora está seguindo ${targetUsuario.nome} (@${targetUsuario.nickname})`,
            action: 'seguiu',
          };
        }
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Erro ao processar requisição',
        });
      }
    }
  );

  // GET - Listar quem o usuário está seguindo
  fastify.get<{ Params: { usuarioId: string } }>(
    '/usuarios/:usuarioId/seguindo',
    {
      schema: {
        tags: ['Usuários'],
        description: 'Lista todos os usuários que um usuário está seguindo',
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
              data: {
                type: 'array',
                items: usuarioSchema
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

        if (!usuario.seguindo || usuario.seguindo.length === 0) {
          return {
            success: true,
            count: 0,
            data: [],
          };
        }

        // Busca os dados completos dos usuários que está seguindo
        const seguindo = await db.collection<Usuario>(COLLECTIONS.USUARIOS)
          .find({ _id: { $in: usuario.seguindo } }, { projection: { senha: 0 } })
          .toArray();
        
        return {
          success: true,
          count: seguindo.length,
          data: seguindo.map(removerSenha),
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Erro ao buscar usuários seguidos',
        });
      }
    }
  );

  // GET - Listar seguidores do usuário
  fastify.get<{ Params: { usuarioId: string } }>(
    '/usuarios/:usuarioId/seguidores',
    {
      schema: {
        tags: ['Usuários'],
        description: 'Lista todos os seguidores de um usuário',
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
              data: {
                type: 'array',
                items: usuarioSchema
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

        if (!usuario.seguidores || usuario.seguidores.length === 0) {
          return {
            success: true,
            count: 0,
            data: [],
          };
        }

        // Busca os dados completos dos seguidores
        const seguidores = await db.collection<Usuario>(COLLECTIONS.USUARIOS)
          .find({ _id: { $in: usuario.seguidores } }, { projection: { senha: 0 } })
          .toArray();
        
        return {
          success: true,
          count: seguidores.length,
          data: seguidores.map(removerSenha),
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Erro ao buscar seguidores',
        });
      }
    }
  );

}

