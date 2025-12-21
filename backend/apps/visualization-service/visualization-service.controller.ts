import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { VisualizationServiceService } from './visualization-service.service';
import { CreateVisualizationServiceDto } from './dto/create-visualization-service.dto';
import { UpdateVisualizationServiceDto } from './dto/update-visualization-service.dto';

@Controller()
export class VisualizationServiceController {
  constructor(private readonly visualizationServiceService: VisualizationServiceService) { }

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

  @MessagePattern('visualization.layout')
  getGraphLayout() {
    return this.visualizationServiceService.getGraphLayout();
  }

  @MessagePattern('visualization.filter')
  filterGraph(@Payload() data: { departments: number[] }) {
    return this.visualizationServiceService.filterGraph(data.departments);
  }

  @MessagePattern('visualization.export')
  exportGraph(@Payload() data: { format: 'json' | 'csv' }) {
    return this.visualizationServiceService.exportGraph(data.format);
  }

  @MessagePattern('visualization.communities')
  getCommunities() {
    return this.visualizationServiceService.getCommunities();
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
