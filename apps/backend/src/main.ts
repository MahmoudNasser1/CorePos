import './load-env'
import 'reflect-metadata'
import cookieParser from 'cookie-parser'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import type { Request, Response, NextFunction } from 'express'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'
import { ResponseEnvelopeInterceptor } from './common/interceptors/response-envelope.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Backward compatible prefixing:
  // Some clients (and early E2E harnesses) may call routes without `/v1`.
  // We rewrite known API paths to include `/v1` while keeping non-API routes (e.g. `/docs`) intact.
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const url = req.url ?? ''
    if (url.startsWith('/v1/') || url === '/v1') return next()
    if (url.startsWith('/docs')) return next()
    if (url.startsWith('/health') || url.startsWith('/readiness')) {
      req.url = `/v1${url}`
      return next()
    }
    if (
      url.startsWith('/auth') ||
      url.startsWith('/onboarding') ||
      url.startsWith('/finance') ||
      url.startsWith('/inventory') ||
      url.startsWith('/contacts') ||
      url.startsWith('/reports') ||
      url.startsWith('/admin')
    ) {
      req.url = `/v1${url}`
    }
    return next()
  })

  app.setGlobalPrefix('v1')

  app.enableCors({
    origin: [
      /http:\/\/localhost:300\d/,
      /http:\/\/127\.0\.0\.1:300\d/,
      /http:\/\/localhost:400\d/,
      /http:\/\/127\.0\.0\.1:400\d/,
      // فتح الواجهة من جهاز آخر على الشبكة المحلية (مثلاً http://192.168.x.x:4001)
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/,
      /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/,
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  })
  
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalInterceptors(new LoggingInterceptor())
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor())

  const config = new DocumentBuilder()
    .setTitle('CorePOS Backend API')
    .setDescription('CorePOS backend service (NestJS + Drizzle + PostgreSQL)')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)

  const port = Number(process.env.BACKEND_PORT ?? 4000)
  await app.listen(port)
}

void bootstrap()
