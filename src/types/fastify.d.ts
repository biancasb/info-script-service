import 'fastify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { JWTPayload } from '../types/auth';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    optionalAuthenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    user?: JWTPayload;
  }
}