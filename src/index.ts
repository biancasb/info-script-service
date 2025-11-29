import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import jwt from '@fastify/jwt';
import { config } from './config/env';
import { connectDatabase, closeDatabase } from './config/database';
import { usuariosRoutes } from './routes/usuarios';
import { postagensRoutes } from './routes/postagens';
import { materiasRoutes } from './routes/materias';

const fastify = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

async function start() {
  try {
    // Registra CORS
    await fastify.register(cors, {
      origin: true,
    });

    // Registra JWT
    await fastify.register(jwt, {
      secret: config.jwtSecret,
      sign: {
        expiresIn: config.jwtExpiresIn,
      },
    });

    // Registra middlewares de autenticação
    const { authenticate, optionalAuthenticate } = await import('./middlewares/auth');
    fastify.decorate('authenticate', authenticate);
    fastify.decorate('optionalAuthenticate', optionalAuthenticate);

    // Registra error handler global
    const { errorHandler } = await import('./middlewares/error-handler');
    fastify.setErrorHandler(errorHandler);

    // Registra Swagger
    await fastify.register(swagger, {
      openapi: {
        info: {
          title: 'InfoScript Backend API',
          description: 'API completa para rede social acadêmica com usuários, postagens, seguidores e curtidas',
          version: '1.0.0',
          contact: {
            name: 'InfoScript Team',
            email: 'contact@infoscript.com',
          },
        },
        servers: [
          {
            url: `http://localhost:${config.port}`,
            description: 'Servidor de Desenvolvimento',
          },
        ],
        tags: [
          { name: 'Usuários', description: 'Gerenciamento de usuários, seguindo e seguidores' },
          { name: 'Matérias', description: 'Gerenciamento de matérias e matrículas' },
          { name: 'Postagens', description: 'Gerenciamento de postagens e curtidas' },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
          schemas: {
            Usuario: {
              type: 'object',
              properties: {
                _id: { type: 'string', description: 'ID do usuário' },
                nome: { type: 'string', description: 'Nome completo' },
                nickname: { type: 'string', description: 'Nome de usuário único' },
                anoIngresso: { type: 'number', description: 'Ano de ingresso' },
                cargo: { 
                  type: 'string', 
                  enum: ['estudante', 'professor'],
                  description: 'Tipo de usuário' 
                },
                seguindo: { 
                  type: 'array', 
                  items: { type: 'string' },
                  description: 'IDs dos usuários que este usuário segue'
                },
                seguidores: { 
                  type: 'array', 
                  items: { type: 'string' },
                  description: 'IDs dos usuários que seguem este usuário'
                },
                criadoEm: { type: 'string', format: 'date-time' },
                atualizadoEm: { type: 'string', format: 'date-time' },
              },
            },
            Materia: {
              type: 'object',
              properties: {
                _id: { type: 'string', description: 'ID da matéria' },
                nome: { type: 'string', description: 'Nome da matéria' },
                descricao: { type: 'string', description: 'Descrição da matéria' },
                professorId: { type: 'string', description: 'ID do professor responsável' },
                professorNome: { type: 'string', description: 'Nome do professor' },
                estudantesMatriculados: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'IDs dos estudantes matriculados'
                },
                totalEstudantes: { type: 'number', description: 'Total de estudantes' },
                criadoEm: { type: 'string', format: 'date-time' },
                atualizadoEm: { type: 'string', format: 'date-time' },
              },
            },
            Postagem: {
              type: 'object',
              properties: {
                _id: { type: 'string', description: 'ID da postagem' },
                titulo: { type: 'string', description: 'Título da postagem' },
                texto: { type: 'string', description: 'Conteúdo da postagem' },
                tag: { type: 'string', description: 'Matéria/disciplina' },
                autorId: { type: 'string', description: 'ID do autor' },
                autorNome: { type: 'string', description: 'Nome do autor' },
                autorNickname: { type: 'string', description: 'Nickname do autor' },
                curtidas: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'IDs dos usuários que curtiram'
                },
                totalCurtidas: { type: 'number', description: 'Total de curtidas' },
                criadoEm: { type: 'string', format: 'date-time' },
                atualizadoEm: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    });

    await fastify.register(swaggerUi, {
      routePrefix: '/documentacao',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
        defaultModelsExpandDepth: -1, // Esconde os models por padrão
      },
      staticCSP: true,
      transformSpecificationClone: true,
    });

    // Conecta ao banco de dados
    await connectDatabase(config.mongoUri, config.mongoDbName);

    // Registra rotas
    await fastify.register(usuariosRoutes);
    await fastify.register(materiasRoutes);
    await fastify.register(postagensRoutes);

    // Rota inicial
    fastify.get('/', {
      schema: {
        hide: true // Esconde do Swagger
      }
    }, async (request, reply) => {
      return {
        message: 'Bem-vindo ao InfoScript Backend API',
        version: '1.0.0',
        documentacao: `http://localhost:${config.port}/documentacao`,
        endpoints: {
          autenticacao: {
            login: 'POST /usuarios/login (retorna JWT token)',
          },
          usuarios: {
            list: 'GET /usuarios',
            get: 'GET /usuarios/:id',
            getByNickname: 'GET /usuarios/nickname/:nickname',
            getByCargo: 'GET /usuarios/cargo/:cargo',
            create: 'POST /usuarios',
            update: 'PUT /usuarios/:id',
            delete: 'DELETE /usuarios/:id',
            toggleSeguir: 'POST /usuarios/toggle-seguir (requer autenticação)',
            listarSeguindo: 'GET /usuarios/:usuarioId/seguindo',
            listarSeguidores: 'GET /usuarios/:usuarioId/seguidores',
          },
          materias: {
            list: 'GET /materias',
            get: 'GET /materias/:id',
            getByUsuario: 'GET /materias/usuario/:usuarioId (estudante ou professor)',
            create: 'POST /materias (requer autenticação de professor)',
            update: 'PUT /materias/:id (requer autenticação)',
            delete: 'DELETE /materias/:id (requer autenticação)',
            matricular: 'POST /materias/:id/matricular (requer autenticação de professor)',
            desmatricular: 'DELETE /materias/:id/desmatricular (requer autenticação de professor)',
          },
          postagens: {
            feed: 'GET /postagens (autenticação opcional, ?tag=...)',
            get: 'GET /postagens/:id',
            getByUsuario: 'GET /postagens/usuario/:usuarioId',
            getByTag: 'GET /postagens/tag/:tag',
            getTags: 'GET /postagens/tags/lista',
            create: 'POST /postagens',
            update: 'PUT /postagens/:id',
            delete: 'DELETE /postagens/:id',
            toggleCurtida: 'POST /postagens/toggle-curtida (requer autenticação)',
            listarCurtidas: 'GET /postagens/:postagemId/curtidas',
            ranking: 'GET /postagens/ranking/curtidas',
          },
        },
      };
    });

    // Inicia o servidor
    await fastify.listen({
      port: config.port,
      host: config.host,
    });

    console.log(`🚀 Servidor rodando em http://${config.host}:${config.port}`);
    console.log(`📚 Documentação Swagger disponível em http://${config.host}:${config.port}/documentacao`);
  } catch (error) {
    fastify.log.error(error);
    await closeDatabase();
    process.exit(1);
  }
}

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM'] as const;
signals.forEach((signal) => {
  process.on(signal, async () => {
    console.log(`\n📡 Recebido sinal ${signal}, encerrando...`);
    await fastify.close();
    await closeDatabase();
    process.exit(0);
  });
});

start();

