import { Module } from '@nestjs/common';
import { OrdensController } from './ordens.controller';
import { OrdensService } from './ordens.service';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
    imports: [MetricsModule],
    controllers: [OrdensController],
    providers: [OrdensService],
    exports: [OrdensService],
})

export class OrdensModule {}

