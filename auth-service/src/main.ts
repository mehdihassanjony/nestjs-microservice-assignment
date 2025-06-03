import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Auth Service API')
    .setDescription('Authentication and Authorization API')
    .setVersion('1.0')
    .addBearerAuth() // For JWT support
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log(`Auth Service running on port 3000`);
  console.log(`Swagger docs available at http://localhost:3000/api`);
}
bootstrap();
