import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  dotenv.config();
  
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000)
    .then(() => {
      logger.log(`Servidor iniciado na porta ${process.env.PORT ?? 3000}`);
    })
    .catch((error) => {
      logger.error('Erro ao iniciar o servidor', error);
    });
}
bootstrap();
