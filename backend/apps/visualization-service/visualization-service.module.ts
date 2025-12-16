import { Module } from '@nestjs/common';
import { VisualizationServiceService } from './visualization-service.service';
import { VisualizationServiceController } from './visualization-service.controller';

@Module({
  controllers: [VisualizationServiceController],
  providers: [VisualizationServiceService],
})
export class VisualizationServiceModule {}
