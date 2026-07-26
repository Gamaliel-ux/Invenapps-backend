import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security: Helmet middleware for security headers
  app.use(helmet());

  // Security: CORS with whitelist
  app.enableCors({
    origin: (origin: any, callback: any) => {
      if (!origin) {
        return callback(null, true);
      }
      const isLocalhost =
        origin.startsWith('http://localhost:') ||
        origin.startsWith('https://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin.startsWith('https://127.0.0.1:');

      const envOrigins = process.env.CORS_ORIGIN?.split(',') || [];
      const isEnvMatch = envOrigins.some((o) => o.trim() === origin);

      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://[IP_ADDRESS]',
        'https://www.invenapps.id',
        'https://invenapps.id',
      ];

      const isAllowedOrigin = allowedOrigins.includes(origin);

      if (isLocalhost || isEnvMatch || isAllowedOrigin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Security: Request timeout (30 seconds)
  app.use((req: Request, res: Response, next: NextFunction) => {
    req.setTimeout(30000);
    res.setTimeout(30000);
    next();
  });

  // Set global prefix
  app.setGlobalPrefix('api');

  // Security: Enhanced validation pipe with strict settings
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Changed to false to silently strip extra fields instead of throwing 400 errors
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Security: Global exception filter for error handling
  app.useGlobalFilters(new HttpExceptionFilter());

  // Set up Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Invenapps API')
    .setDescription('Inventory Management System Backend API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
  console.log(
    `Swagger documentation is available at: http://localhost:${port}/api/docs`,
  );
}
bootstrap();
