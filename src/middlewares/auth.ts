import { FastifyRequest, FastifyReply } from 'fastify';
import { JWTPayload } from '../types/auth';
import { ERROR_MESSAGES } from '../constants/messages';
import { HTTP_STATUS } from '../constants/http-status';
import { errorResponse } from '../utils/response';

/**
 * Middleware de autenticação obrigatória
 * Verifica se há token JWT válido e adiciona dados do usuário ao request
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(HTTP_STATUS.UNAUTHORIZED).send(
      errorResponse(ERROR_MESSAGES.TOKEN_INVALID)
    );
  }
}

/**
 * Middleware de autenticação opcional
 * Tenta verificar JWT, mas não retorna erro se não houver token
 */
export async function optionalAuthenticate(
  request: FastifyRequest,
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch (err) {
    // Silenciosamente ignora erro - usuário não está autenticado
  }
}

/**
 * Verifica se o usuário autenticado é professor
 */
export function requireProfessor(
  request: FastifyRequest,
  reply: FastifyReply
): boolean {
  const user = request.user as JWTPayload | undefined;
  
  if (!user || user.cargo !== 'professor') {
    reply.status(HTTP_STATUS.FORBIDDEN).send(
      errorResponse(ERROR_MESSAGES.ONLY_PROFESSORS)
    );
    return false;
  }
  
  return true;
}

/**
 * Extrai user ID do token JWT
 */
export function getUserId(request: FastifyRequest): string | null {
  const user = request.user as JWTPayload | undefined;
  return user?.userId || null;
}

