import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GraphService } from './graph.service';
import { CreateGraphDto } from './dto/create-graph.dto';
import { UpdateGraphDto } from './dto/update-graph.dto';

@Controller()
export class GraphController {
  constructor(private readonly graphService: GraphService) { }

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

  @MessagePattern('graph.stats')
  getStats() {
    return this.graphService.getStats();
  }

  @MessagePattern('graph.nodes')
  getNodes() {
    return this.graphService.getNodes();
  }

  @MessagePattern('graph.edges')
  getEdges() {
    return this.graphService.getEdges();
  }

  @MessagePattern('graph.node.details')
  getNodeDetails(@Payload() data: { id: number }) {
    return this.graphService.getNodeDetails(data.id);
  }

  @MessagePattern('graph.degree.distribution')
  getDegreeDistribution() {
    return this.graphService.getDegreeDistribution();
  }

  @MessagePattern('graph.clustering')
  getClustering() {
    return this.graphService.getClusteringCoefficient();
  }

  @MessagePattern('graph.centrality')
  getCentrality() {
    return this.graphService.getCentrality();
  }

  @MessagePattern('graph.activity')
  getRecentActivity() {
    return this.graphService.getRecentActivity();
  }

  @MessagePattern('updateGraph')
  update(@Payload() updateGraphDto: UpdateGraphDto) {
    return this.graphService.update(updateGraphDto.id, updateGraphDto);
  }

  @MessagePattern('removeGraph')
  remove(@Payload() id: number) {
    return this.graphService.remove(id);
  }

  @MessagePattern('graph.prediction.save')
  savePrediction(@Payload() data: any) {
    return this.graphService.savePrediction(data);
  }

  @MessagePattern('graph.prediction.history')
  getPredictionHistory(@Payload() data: { userId: string, limit?: number, offset?: number }) {
    return this.graphService.getPredictionHistory(data.userId, data.limit, data.offset);
  }
}
