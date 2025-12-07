import { FastifyRequest, FastifyReply } from 'fastify';
import { JWTPayload } from '../types/auth';
import { ERROR_MESSAGES } from '../constants/messages';
import { HTTP_STATUS } from '../constants/http-status';
import { errorResponse } from '../utils/response';

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

export async function optionalAuthenticate(
  request: FastifyRequest,
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch (err) {
  }
}

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

export function getUserId(request: FastifyRequest): string | null {
  const user = request.user as JWTPayload | undefined;
  return user?.userId || null;
}

