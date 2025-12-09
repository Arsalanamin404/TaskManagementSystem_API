import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();

      if (typeof errorResponse === 'string') {
        errorMessage = errorResponse;
      } else if (typeof errorResponse === 'object' && errorResponse !== null) {
        const message = (errorResponse as any).message;

        if (Array.isArray(message)) {
          errorMessage = message; // validation errors
        } else if (typeof message === 'string') {
          errorMessage = message;
        }
      }
    } else if (exception instanceof Error) {
      // Non HttpExceptions (Prisma/Axios/Mongo errors)
      errorMessage = exception.message;
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      error: errorMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}