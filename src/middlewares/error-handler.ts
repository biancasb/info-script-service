import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ERROR_MESSAGES } from '../constants/messages';
import { HTTP_STATUS } from '../constants/http-status';
import { errorResponse } from '../utils/response';

/**
 * Handler global de erros
 * Captura e formata erros de forma consistente
 */
export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  // Log do erro para debugging
  request.log.error(error);

  // Erros de validação do Fastify/Ajv
  if (error.validation) {
    reply.status(HTTP_STATUS.BAD_REQUEST).send(
      errorResponse(
        'Dados inválidos',
        error.validation
      )
    );
    return;
  }

  // Erro de JWT
  if (error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER' ||
      error.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED' ||
      error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID') {
    reply.status(HTTP_STATUS.UNAUTHORIZED).send(
      errorResponse(ERROR_MESSAGES.TOKEN_INVALID)
    );
    return;
  }

  // Erro genérico 500
  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  reply.status(statusCode).send(
    errorResponse(
      error.message || ERROR_MESSAGES.INTERNAL_ERROR
    )
  );
}

