import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true, //automatically transform payloads to be objects typed according to their DTO
      forbidNonWhitelisted: true,
      disableErrorMessages: false,
    }),
  );
  try {
    app.setGlobalPrefix('api/v1');
    await app.listen(port);
    console.log(`Server is running on http://localhost:${port}/api/v1`);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();
