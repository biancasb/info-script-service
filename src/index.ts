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
  
    await fastify.register(cors, { origin: true });
    
    await fastify.register(jwt, {
      secret: config.jwtSecret,
      sign: { expiresIn: config.jwtExpiresIn },
    });

  
    const { authenticate, optionalAuthenticate } = await import('./middlewares/auth');
    fastify.decorate('authenticate', authenticate);
    fastify.decorate('optionalAuthenticate', optionalAuthenticate);

    const { errorHandler } = await import('./middlewares/error-handler');
    fastify.setErrorHandler(errorHandler);

    
    await fastify.register(swagger, {
      openapi: {
        info: {
          title: 'InfoScript Backend API',
          description: 'API da rede social acadêmica InfoScript',
          version: '1.0.0',
        },
        servers: [
          {
            url: `http://localhost:${config.port}`,
            description: 'Servidor de Desenvolvimento',
          },
        ],
        tags: [
          { name: 'Usuários', description: 'Gerenciamento de usuários' },
          { name: 'Matérias', description: 'Gerenciamento de matérias' },
          { name: 'Postagens', description: 'Gerenciamento de postagens' },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
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
        defaultModelsExpandDepth: -1,
      },
      staticCSP: true,
      transformSpecificationClone: true,
    });

   
    await connectDatabase(config.mongoUri, config.mongoDbName);

   
    await fastify.register(usuariosRoutes);
    await fastify.register(materiasRoutes);
    await fastify.register(postagensRoutes);

    fastify.get('/', { schema: { hide: true } }, () => ({
      message: 'Bem-vindo ao InfoScript Backend API',
      version: '1.0.0',
      documentacao: `http://localhost:${config.port}/documentacao`,
    }));

    await fastify.listen({
      port: config.port,
      host: config.host,
    });

    console.log(`Servidor rodando em http://${config.host}:${config.port}`);
    console.log(`Swagger: http://${config.host}:${config.port}/documentacao`);

  } catch (error) {
    fastify.log.error(error);
    await closeDatabase();
    process.exit(1);
  }
}

const signals = ['SIGINT', 'SIGTERM'] as const;

signals.forEach((signal) => {
  process.on(signal, async () => {
    console.log(`\n📡 Encerrando (${signal})...`);
    await fastify.close();
    await closeDatabase();
    process.exit(0);
  });
});

start();
