import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const { message: msg, error } = exceptionResponse as any;
        message = msg || 'An error occurred';
        // Only include validation errors in details, not internal errors
        if (status === HttpStatus.BAD_REQUEST && error === 'Bad Request') {
          details = (exceptionResponse as any).message;
        }
      } else {
        message = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log error details server-side only
    this.logger.error(
      `${request.method} ${request.url} - ${status}`,
      details ? `Validation errors: ${JSON.stringify(details)}` : (exception instanceof Error ? exception.stack : JSON.stringify(exception)),
    );

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      ...(details && { details }),
    };

    response.status(status).json(errorResponse);
  }
}
