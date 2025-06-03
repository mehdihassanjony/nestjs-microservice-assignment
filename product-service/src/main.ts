import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Product Service API')
    .setDescription('API for managing products')
    .setVersion('1.0')
    .addBearerAuth() // For JWT support
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Logger middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  await app.listen(3001);
  console.log(`Product Service running on port 3001`);
  console.log(`Swagger docs available at http://localhost:3001/api`);
}
bootstrap();
