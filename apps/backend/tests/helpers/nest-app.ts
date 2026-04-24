import cookieParser from 'cookie-parser'
import { ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import { AppModule } from '../../src/app.module'
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter'
import { LoggingInterceptor } from '../../src/common/interceptors/logging.interceptor'
import { ResponseEnvelopeInterceptor } from '../../src/common/interceptors/response-envelope.interceptor'

export async function createTestApp() {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()

  const app = moduleRef.createNestApplication()

  app.setGlobalPrefix('v1')
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalInterceptors(new LoggingInterceptor())
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor())

  await app.init()
  return app
}

