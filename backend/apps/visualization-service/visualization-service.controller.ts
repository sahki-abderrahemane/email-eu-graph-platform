import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { VisualizationServiceService } from './visualization-service.service';
import { CreateVisualizationServiceDto } from './dto/create-visualization-service.dto';
import { UpdateVisualizationServiceDto } from './dto/update-visualization-service.dto';

@Controller()
export class VisualizationServiceController {
  constructor(private readonly visualizationServiceService: VisualizationServiceService) {}

  @MessagePattern('createVisualizationService')
  create(@Payload() createVisualizationServiceDto: CreateVisualizationServiceDto) {
    return this.visualizationServiceService.create(createVisualizationServiceDto);
  }

  @MessagePattern('findAllVisualizationService')
  findAll() {
    return this.visualizationServiceService.findAll();
  }

  @MessagePattern('findOneVisualizationService')
  findOne(@Payload() id: number) {
    return this.visualizationServiceService.findOne(id);
  }

  @MessagePattern('updateVisualizationService')
  update(@Payload() updateVisualizationServiceDto: UpdateVisualizationServiceDto) {
    return this.visualizationServiceService.update(updateVisualizationServiceDto.id, updateVisualizationServiceDto);
  }

  @MessagePattern('removeVisualizationService')
  remove(@Payload() id: number) {
    return this.visualizationServiceService.remove(id);
  }
}
