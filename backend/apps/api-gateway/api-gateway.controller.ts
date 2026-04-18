import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Query, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout, catchError, throwError } from 'rxjs';
import { Public } from 'libs/common/decorators/public.decorator';

/** Timeout for Redis microservice calls (ms) */
const SERVICE_TIMEOUT = 15_000;

/**
 * Helper: send a message to a microservice with a timeout so the request
 * never hangs indefinitely if the service or Redis is unreachable.
 */
function rpc<T>(client: ClientProxy, pattern: string, data: any) {
  return firstValueFrom(
    client.send<T>(pattern, data).pipe(
      timeout(SERVICE_TIMEOUT),
      catchError((err) => {
        const message =
          err?.name === 'TimeoutError'
            ? `Service did not respond within ${SERVICE_TIMEOUT}ms (pattern: ${pattern})`
            : err?.message || 'Unknown microservice error';
        return throwError(() => ({
          statusCode: err?.name === 'TimeoutError' ? 504 : 500,
          message,
          pattern,
        }));
      }),
    ),
  );
}

@Controller('api')
export class ApiGatewayController {
  private readonly logger = new Logger(ApiGatewayController.name);
  private readonly mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';

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
    return rpc(this.authClient, 'auth.register', credentials);
  }

  @Public()
  @Post('auth/login')
  async login(@Body() credentials: { email: string; password: string }) {
    return rpc(this.authClient, 'auth.login', credentials);
  }

  @Post('auth/verify')
  async verify(@Body() { token }: { token: string }) {
    return rpc(this.authClient, 'auth.verify', { token });
  }

  // ============ USER ENDPOINTS ============
  @Public()
  @Post('users')
  async createUser(@Body() createUserDto: { email: string; password: string; name: string }) {
    return rpc(this.authClient, 'user.create', createUserDto);
  }

  @Get('users')
  async getAllUsers() {
    return rpc(this.authClient, 'user.findAll', {});
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return rpc(this.authClient, 'user.findOne', { id });
  }

  @Patch('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: { email?: string; name?: string; role?: string },
  ) {
    return rpc(this.authClient, 'user.update', { id, ...updateUserDto });
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return rpc(this.authClient, 'user.delete', { id });
  }

  @Get('users/:id/profile')
  async getUserProfile(@Param('id') id: string) {
    return rpc(this.authClient, 'user.profile', { id });
  }

  // ============ GRAPH ENDPOINTS ============
  @Get('graph/stats')
  async getGraphStats() {
    return rpc(this.graphClient, 'graph.stats', {});
  }

  @Get('graph/nodes')
  async getNodes() {
    return rpc(this.graphClient, 'graph.nodes', {});
  }

  @Get('graph/edges')
  async getEdges() {
    return rpc(this.graphClient, 'graph.edges', {});
  }

  @Post('graph/node/:id')
  async getNodeDetails(@Param('id') id: string) {
    return rpc(this.graphClient, 'graph.node.details', { id: +id });
  }

  @Get('graph/degree-distribution')
  async getDegreeDist() {
    return rpc(this.graphClient, 'graph.degree.distribution', {});
  }

  @Get('graph/clustering-coefficient')
  async getClusteringCoeff() {
    return rpc(this.graphClient, 'graph.clustering', {});
  }

  @Get('graph/centrality')
  async getCentrality() {
    return rpc(this.graphClient, 'graph.centrality', {});
  }

  @Get('graph/activity')
  async getRecentActivity() {
    return rpc(this.graphClient, 'graph.activity', {});
  }

  @Get('graph/prediction/history')
  async getPredictionHistory(
    @Query('userId') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return rpc(this.graphClient, 'graph.prediction.history', { userId, limit, offset });
  }

  @Post('graph/prediction/save')
  async savePrediction(@Body() data: any) {
    return rpc(this.graphClient, 'graph.prediction.save', data);
  }

  // ============ VISUALIZATION ENDPOINTS ============
  @Get('visualization/graph-layout')
  async getGraphLayout() {
    return rpc(this.visClient, 'visualization.layout', {});
  }

  @Post('visualization/filter')
  async filterGraph(@Body() { departments }: { departments: number[] }) {
    return rpc(this.visClient, 'visualization.filter', { departments });
  }

  @Post('visualization/export')
  async exportGraph(@Body() { format }: { format: 'json' | 'csv' }) {
    return rpc(this.visClient, 'visualization.export', { format });
  }

  @Get('visualization/communities')
  async getCommunities() {
    return rpc(this.visClient, 'visualization.communities', {});
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

  @Post('ml/predict/simulate')
  async simulateDepartment(@Body() data: any) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.mlServiceUrl}/predict/department/simulate`, data),
    );
    return response.data;
  }

  @Get('ml/predict/unseen')
  async predictUnseen(@Query('index') index?: number) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.mlServiceUrl}/predict/department/unseen`, { params: { index } }),
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
  async visualizeEmbeddings(@Query('method') method?: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.mlServiceUrl}/embeddings/visualize`, { params: { method: method || 'pca' } }),
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

  @Post('ml/links/simulate')
  async simulateLink(@Body() data: any) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.mlServiceUrl}/links/simulate`, data),
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