import { Injectable } from '@nestjs/common';
import { CreateVisualizationServiceDto } from './dto/create-visualization-service.dto';
import { UpdateVisualizationServiceDto } from './dto/update-visualization-service.dto';

@Injectable()
export class VisualizationServiceService {
  create(createVisualizationServiceDto: CreateVisualizationServiceDto) {
    return 'This action adds a new visualizationService';
  }

  findAll() {
    return `This action returns all visualizationService`;
  }

  findOne(id: number) {
    return `This action returns a #${id} visualizationService`;
  }

  update(id: number, updateVisualizationServiceDto: UpdateVisualizationServiceDto) {
    return `This action updates a #${id} visualizationService`;
  }

  remove(id: number) {
    return `This action removes a #${id} visualizationService`;
  }
}
