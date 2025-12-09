import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import { GlobalResponseInterceptor } from './common/interceptors/response-handler.interceptor';
import { GlobalExceptionFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;
  app.enableCors({
    origin: ['http://localhost:8081', 'http://192.168.29.238:8081'],
    methods: '*',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Task Management System API')
    .setDescription(
      `A fully functional Task Management System backend built with **NestJS**,
      providing secure authentication, role-based access control, and task and user management endpoints.
      `,
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'accessToken',
    )
    .addServer('/api/v1')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: false,
  });

  fs.writeFileSync('./swagger.json', JSON.stringify(document, null, 2));

  SwaggerModule.setup('/api/v1/docs', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true, //automatically transform payloads to be objects typed according to their DTO
      forbidNonWhitelisted: true,
      disableErrorMessages: false,
    }),
  );
  app.useGlobalInterceptors(new GlobalResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());
  try {
    app.setGlobalPrefix('api/v1');
    app.use(cookieParser());
    await app.listen(port);
    console.log(`Server is running on http://localhost:${port}/api/v1`);
    console.log(
      `API documentation is serving on http://localhost:${port}/api/v1/docs`,
    );
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();
