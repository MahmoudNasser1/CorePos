import 'reflect-metadata'
import cookieParser from 'cookie-parser'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'
import { ResponseEnvelopeInterceptor } from './common/interceptors/response-envelope.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  
  app.setGlobalPrefix('v1')

  app.enableCors({
    origin: [
      /http:\/\/localhost:300\d/,
      /http:\/\/127\.0\.0\.1:300\d/,
      /http:\/\/localhost:400\d/,
      /http:\/\/127\.0\.0\.1:400\d/,
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
    .setDescription('Backend migration service from Supabase to NestJS')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)

  const port = Number(process.env.BACKEND_PORT ?? 4000)
  await app.listen(port)
}

void bootstrap()
