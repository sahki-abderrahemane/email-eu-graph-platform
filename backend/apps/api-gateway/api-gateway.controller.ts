import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Public } from 'libs/common/decorators/public.decorator';

@Controller('api')
export class ApiGatewayController {
  private readonly mlServiceUrl = 'http://localhost:8000';

  constructor(
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
    @Inject('GRAPH_SERVICE') private graphClient: ClientProxy,
    @Inject('VISUALIZATION_SERVICE') private visClient: ClientProxy,
    private readonly httpService: HttpService,
  ) { }

  // ============ HEALTH CHECK ============
  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'api-gateway' };
  }

  // ============ AUTH ENDPOINTS ============
  @Public()
  @Post('auth/register')
  async register(@Body() credentials: { email: string; password: string; name: string }) {
    return firstValueFrom(this.authClient.send('auth.register', credentials));
  }

  @Public()
  @Post('auth/login')
  async login(@Body() credentials: { email: string; password: string }) {
    return firstValueFrom(this.authClient.send('auth.login', credentials));
  }

  @Post('auth/verify')
  async verify(@Body() { token }: { token: string }) {
    return firstValueFrom(this.authClient.send('auth.verify', { token }));
  }

  // ============ USER ENDPOINTS ============
  @Public()
  @Post('users')
  async createUser(@Body() createUserDto: { email: string; password: string; name: string }) {
    return firstValueFrom(this.authClient.send('user.create', createUserDto));
  }

  @Get('users')
  async getAllUsers() {
    return firstValueFrom(this.authClient.send('user.findAll', {}));
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return firstValueFrom(this.authClient.send('user.findOne', { id: +id }));
  }

  @Patch('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: { email?: string; name?: string; role?: string },
  ) {
    return firstValueFrom(
      this.authClient.send('user.update', { id: +id, ...updateUserDto }),
    );
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return firstValueFrom(this.authClient.send('user.delete', { id: +id }));
  }

  @Get('users/:id/profile')
  async getUserProfile(@Param('id') id: string) {
    return firstValueFrom(this.authClient.send('user.profile', { id: +id }));
  }

  // ============ GRAPH ENDPOINTS ============
  @Get('graph/stats')
  async getGraphStats() {
    return firstValueFrom(this.graphClient.send('graph.stats', {}));
  }

  @Get('graph/nodes')
  async getNodes() {
    return firstValueFrom(this.graphClient.send('graph.nodes', {}));
  }

  @Get('graph/edges')
  async getEdges() {
    return firstValueFrom(this.graphClient.send('graph.edges', {}));
  }

  @Post('graph/node/:id')
  async getNodeDetails(@Param('id') id: string) {
    return firstValueFrom(this.graphClient.send('graph.node.details', { id: +id }));
  }

  @Get('graph/degree-distribution')
  async getDegreeDist() {
    return firstValueFrom(this.graphClient.send('graph.degree.distribution', {}));
  }

  @Get('graph/clustering-coefficient')
  async getClusteringCoeff() {
    return firstValueFrom(this.graphClient.send('graph.clustering', {}));
  }

  @Get('graph/centrality')
  async getCentrality() {
    return firstValueFrom(this.graphClient.send('graph.centrality', {}));
  }

  // ============ VISUALIZATION ENDPOINTS ============
  @Get('visualization/graph-layout')
  async getGraphLayout() {
    return firstValueFrom(this.visClient.send('visualization.layout', {}));
  }

  @Post('visualization/filter')
  async filterGraph(@Body() { departments }: { departments: number[] }) {
    return firstValueFrom(
      this.visClient.send('visualization.filter', { departments }),
    );
  }

  @Post('visualization/export')
  async exportGraph(@Body() { format }: { format: 'json' | 'csv' }) {
    return firstValueFrom(this.visClient.send('visualization.export', { format }));
  }

  @Get('visualization/communities')
  async getCommunities() {
    return firstValueFrom(this.visClient.send('visualization.communities', {}));
  }

  // ============ ML SERVICE ENDPOINTS ============
  @Public()
  @Get('ml/health')
  async getMLHealth() {
    const response = await firstValueFrom(
      this.httpService.get(`${this.mlServiceUrl}/health`),
    );
    return response.data;
  }

  @Post('ml/predict/department')
  async predictDepartment(@Body() { node_id }: { node_id: number }) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.mlServiceUrl}/predict/department`, { node_id }),
    );
    return response.data;
  }

  @Post('ml/embeddings/generate')
  async generateEmbeddings(@Body() params?: any) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.mlServiceUrl}/embeddings/generate`, params || {}),
    );
    return response.data;
  }

  @Get('ml/embeddings/visualize')
  async visualizeEmbeddings() {
    const response = await firstValueFrom(
      this.httpService.get(`${this.mlServiceUrl}/embeddings/visualize`),
    );
    return response.data;
  }

  @Post('ml/links/predict')
  async predictLinks(@Body() { source, target }: { source: number; target: number }) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.mlServiceUrl}/links/predict`, { source, target }),
    );
    return response.data;
  }

  @Post('ml/community/detect')
  async detectCommunities(@Body() { method }: { method?: string }) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.mlServiceUrl}/community/detect`, { method: method || 'louvain' }),
    );
    return response.data;
  }

  @Get('ml/analysis/metrics')
  async getAnalysisMetrics() {
    const response = await firstValueFrom(
      this.httpService.get(`${this.mlServiceUrl}/analysis/metrics`),
    );
    return response.data;
  }
}