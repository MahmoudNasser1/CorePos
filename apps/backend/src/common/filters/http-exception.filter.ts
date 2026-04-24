import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter')

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp()
    const response = context.getResponse()
    const request = context.getRequest<(Request & { id?: string })>()
    // Keep a server-side log for debugging; API response stays sanitized.
    this.logger.error(`Exception on ${request.url} rid=${request.id ?? 'n/a'}`, exception as any)

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    const raw =
      exception instanceof HttpException ? exception.getResponse() : undefined

    // Normalize Nest's various exception shapes into the API contract:
    // { success:false, error:{ code, message, details? } }
    let code =
      status === 401
        ? 'AUTH_UNAUTHORIZED'
        : status === 501
          ? 'NOT_IMPLEMENTED'
        : status === 409
          ? 'CONFLICT'
          : 'INVARIANT_VIOLATION'
    let message = 'Internal server error'
    let details: unknown | undefined

    if (typeof raw === 'string') {
      message = raw
    } else if (raw && typeof raw === 'object') {
      const r = raw as any
      if (typeof r.code === 'string') code = r.code
      if (typeof r.message === 'string') message = r.message
      else if (Array.isArray(r.message)) message = r.message.join(', ')
      if (r.details !== undefined) details = r.details
      // Backward-compat: if someone threw BadRequestException('text')
      if (!message && typeof r.error === 'string') message = r.error
    }

    if (status === 400 && code === 'INVARIANT_VIOLATION' && /company/i.test(String(message))) {
      code = 'TENANT_MISSING'
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        details: details ?? { path: request.url, requestId: request.id ?? null },
      },
    })
  }
}
