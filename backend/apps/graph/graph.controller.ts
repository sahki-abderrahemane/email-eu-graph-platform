import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GraphService } from './graph.service';
import { CreateGraphDto } from './dto/create-graph.dto';
import { UpdateGraphDto } from './dto/update-graph.dto';

@Controller()
export class GraphController {
  constructor(private readonly graphService: GraphService) {}

  @MessagePattern('createGraph')
  create(@Payload() createGraphDto: CreateGraphDto) {
    return this.graphService.create(createGraphDto);
  }

  @MessagePattern('findAllGraph')
  findAll() {
    return this.graphService.findAll();
  }

  @MessagePattern('findOneGraph')
  findOne(@Payload() id: number) {
    return this.graphService.findOne(id);
  }

  @MessagePattern('updateGraph')
  update(@Payload() updateGraphDto: UpdateGraphDto) {
    return this.graphService.update(updateGraphDto.id, updateGraphDto);
  }

  @MessagePattern('removeGraph')
  remove(@Payload() id: number) {
    return this.graphService.remove(id);
  }
}
