import { PartialType } from '@nestjs/mapped-types';
import { CreateVisualizationServiceDto } from './create-visualization-service.dto';

export class UpdateVisualizationServiceDto extends PartialType(CreateVisualizationServiceDto) {
  id: number;
}
