import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Observable, tap } from 'rxjs'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>()
    const method = request.method
    const path = request.url
    const start = Date.now()

    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - start
        console.log(`[backend] ${method} ${path} ${elapsed}ms`)
      }),
    )
  }
}
