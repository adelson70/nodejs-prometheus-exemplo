import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MetricsInterceptor } from './interceptors/metrics.interceptor';
import { MetricsService } from './modules/metrics/metrics.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  dotenv.config();

  const app = await NestFactory.create(AppModule);
  
  // Registrar interceptor global de métricas
  const metricsService = app.get(MetricsService);
  app.useGlobalInterceptors(new MetricsInterceptor(metricsService));

  const document = SwaggerModule.createDocument(app, new DocumentBuilder()
    .setTitle('API')
    .setDescription('API do projeto')
    .setVersion('1.0')
    .addTag('api')
    .build(),
  );

  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000)
    .then(() => {
      logger.log(`Servidor iniciado na porta ${process.env.PORT ?? 3000}`);
    })
    .catch((error) => {
      logger.error('Erro ao iniciar o servidor', error);
    });
}
bootstrap();
