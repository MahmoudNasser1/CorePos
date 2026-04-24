import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { AppModule } from './app.module'

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false })

  // Keep consistent with runtime prefix in main.ts
  app.setGlobalPrefix('v1')

  const config = new DocumentBuilder()
    .setTitle('CorePOS Backend API')
    .setDescription('Backend migration service from Supabase to NestJS')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)

  const outPath = path.resolve(process.cwd(), 'openapi.json')
  await writeFile(outPath, JSON.stringify(document, null, 2) + '\n', 'utf8')

  await app.close()
}

void generate()

