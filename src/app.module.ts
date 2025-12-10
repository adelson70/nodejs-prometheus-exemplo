import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MetricsModule } from './modules/metrics/metrics.module';
import { OrdensModule } from './modules/ordens/ordens.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';

@Module({
  imports: [MetricsModule, OrdensModule, UsuariosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
