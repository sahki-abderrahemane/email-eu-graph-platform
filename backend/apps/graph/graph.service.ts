import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { CreateGraphDto } from './dto/create-graph.dto';
import { UpdateGraphDto } from './dto/update-graph.dto';
import { Node, NodeDocument } from './src/schemas/node.schema';
import { Edge, EdgeDocument } from './src/schemas/edge.schema';
import { PredictionHistory, PredictionHistoryDocument } from './src/schemas/prediction.schema';

@Injectable()
export class GraphService implements OnModuleInit {
  private readonly logger = new Logger(GraphService.name);

  // Fallback mocks for expansive calcs not yet implemented in DB agg
  private readonly networkStats = {
    nodes: 1005,
    edges: 25571,
    departments: 42,
    avgDegree: 50.9,
    density: 0.0507,
    avgClustering: 0.399,
    diameter: 7,
    components: 1,
  };

  private readonly departmentData = [
    { name: 'Dept 1', count: 109, color: '#6366f1' },
    { name: 'Dept 2', count: 87, color: '#8b5cf6' },
    { name: 'Dept 3', count: 72, color: '#a855f7' },
    { name: 'Dept 4', count: 65, color: '#d946ef' },
    { name: 'Dept 5', count: 58, color: '#ec4899' },
    { name: 'Others', count: 614, color: '#64748b' },
  ];

  constructor(
    @InjectModel(Node.name) private nodeModel: Model<NodeDocument>,
    @InjectModel(Edge.name) private edgeModel: Model<EdgeDocument>,
    @InjectModel(PredictionHistory.name) private predictionModel: Model<PredictionHistoryDocument>,
  ) { }

  async onModuleInit() {
    await this.seedData();
  }

  private async seedData() {
    try {
      const nodeCount = await this.nodeModel.countDocuments();
      if (nodeCount > 0) {
        this.logger.log('Data already seeded (Nodes present). Skipping seed.');
        return;
      }

      this.logger.log('Seeding data from CSVs...');

      // Path Strategy: 
      // We are in dist/apps/graph/ (when running via nest start)
      // Or apps/graph/src (source)
      // Data is in project_root/data
      // Let's assume process.cwd() is project_root/backend.
      // Then data is ../data
      const rootDataPath = path.resolve(process.cwd(), '../data');
      this.logger.log(`Looking for data in: ${rootDataPath}`);

      // Reading Nodes (Department Labels)
      const labelsPath = path.join(rootDataPath, 'email-Eu-core-department-labels.csv');
      if (fs.existsSync(labelsPath)) {
        const labelContent = fs.readFileSync(labelsPath, 'utf-8');
        const lines = labelContent.split('\n').filter(l => l.trim().length > 0);
        const nodesToInsert = lines.map(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 2) {
            const id = parseInt(parts[0]);
            const dept = parseInt(parts[1]);
            return { nodeId: id, department: dept, label: `Node ${id}` };
          }
          return null;
        }).filter(n => n !== null);

        if (nodesToInsert.length > 0) {
          await this.nodeModel.insertMany(nodesToInsert);
          this.logger.log(`Seeded ${nodesToInsert.length} nodes.`);
        }
      } else {
        this.logger.warn(`Labels file not found at ${labelsPath}`);
      }

      // Reading Edges
      const edgesPath = path.join(rootDataPath, 'email-Eu-core.csv');
      if (fs.existsSync(edgesPath)) {
        const edgeContent = fs.readFileSync(edgesPath, 'utf-8');
        const lines = edgeContent.split('\n').filter(l => l.trim().length > 0);
        const edgesToInsert = lines.map(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 2) {
            return { source: parseInt(parts[0]), target: parseInt(parts[1]) };
          }
          return null;
        }).filter(e => e !== null);

        // Insert in chunks to avoid overwhelming Mongo
        const chunkSize = 5000;
        for (let i = 0; i < edgesToInsert.length; i += chunkSize) {
          const chunk = edgesToInsert.slice(i, i + chunkSize);
          await this.edgeModel.insertMany(chunk);
          this.logger.log(`Seeded edges chunk ${i / chunkSize + 1}`);
        }
        this.logger.log(`Seeded total ${edgesToInsert.length} edges.`);
      } else {
        this.logger.warn(`Edges file not found at ${edgesPath}`);
      }

    } catch (error) {
      this.logger.error('Failed to seed data', error);
    }
  }

  create(createGraphDto: CreateGraphDto) {
    return 'This action adds a new graph';
  }

  findAll() {
    return `This action returns all graph`;
  }

  async getStats() {
    const nodeCount = await this.nodeModel.countDocuments();
    const edgeCount = await this.edgeModel.countDocuments();

    // Aggregation for department distribution
    const deptAgg = await this.nodeModel.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#84cc16', '#22c55e'];

    const departmentData = deptAgg.slice(0, 6).map((d, i) => ({
      name: `Dept ${d._id}`,
      count: d.count,
      color: colors[i % colors.length]
    }));

    // Others
    const topSum = departmentData.reduce((acc, curr) => acc + curr.count, 0);
    const othersCount = nodeCount - topSum;
    if (othersCount > 0) {
      departmentData.push({ name: 'Others', count: othersCount, color: '#64748b' });
    }

    return {
      stats: {
        nodes: nodeCount,
        edges: edgeCount,
        departments: deptAgg.length,
        avgDegree: nodeCount > 0 ? parseFloat((edgeCount / nodeCount).toFixed(2)) : 0,
        density: nodeCount > 0 ? parseFloat((edgeCount / (nodeCount * (nodeCount - 1))).toFixed(4)) : 0,
        avgClustering: 0.399, // Still mocked for performance
        diameter: 7, // Still mocked
        components: 1
      },
      departments: departmentData
    };
  }

  async getNodes() {
    // Return all nodes
    const nodes = await this.nodeModel.find().lean().exec();
    return nodes.map(n => ({ id: n.nodeId, label: n.label, department: n.department }));
  }

  async getEdges() {
    // Return a subset of edges for visualization performance, or all if feasible.
    // Frontend Graph Explorer is filtering anyway. 
    // Let's limit to 5000 to be safe for a simple HTTP/TCP payload.
    return await this.edgeModel.find().limit(5000).select('source target -_id').lean().exec();
  }

  async findNodesByIds(ids: number[]) {
    return this.nodeModel.find({ nodeId: { $in: ids } }).exec();
  }

  // Prediction History
  async savePrediction(data: { userId: string, type: string, input: any, result: any, confidence: number }) {
    const newPrediction = new this.predictionModel(data);
    return newPrediction.save();
  }

  async getPredictionHistory(userId: string, limit: number = 5, offset: number = 0) {
    const history = await this.predictionModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();

    const total = await this.predictionModel.countDocuments({ userId });

    return {
      history,
      total,
      limit,
      offset
    };
  }

  async getNodeDetails(id: number) {
    const node = await this.nodeModel.findOne({ nodeId: id }).lean();
    if (!node) return {};

    // Get edges to/from this node to find neighbors
    const edges = await this.edgeModel.find({
      $or: [{ source: id }, { target: id }]
    }).lean();

    const neighborIds = Array.from(new Set(
      edges.map(e => e.source === id ? e.target : e.source)
    ));

    // Fetch details for neighbors
    const neighbors = await this.nodeModel.find({
      nodeId: { $in: neighborIds }
    }).select('nodeId department').lean();

    const outDegree = edges.filter(e => e.source === id).length;
    const inDegree = edges.filter(e => e.target === id).length;

    return {
      id: node.nodeId,
      label: node.label,
      department: node.department,
      degree: outDegree + inDegree,
      inDegree,
      outDegree,
      neighbors: neighbors.map(n => ({ id: n.nodeId, department: n.department })),
      clustering: (Math.random() * 0.4 + 0.2).toFixed(3),
      pageRank: (Math.random() * 0.01).toFixed(6)
    };
  }

  getDegreeDistribution() {
    return [
      { range: '1-10', count: 120 },
      { range: '11-30', count: 450 },
      { range: '31-50', count: 320 },
      { range: '51-100', count: 80 },
      { range: '100+', count: 35 },
    ];
  }

  getClusteringCoefficient() {
    return { average: 0.399, distribution: [0.1, 0.2, 0.5, 0.3, 0.4] };
  }

  // Kept from previous impl for backward compatibility if controller calls it
  getClustering() {
    return this.getClusteringCoefficient();
  }

  getCentrality() {
    return {
      betweenness: Array.from({ length: 10 }, () => Math.random()),
      closeness: Array.from({ length: 10 }, () => Math.random()),
      eigenvector: Array.from({ length: 10 }, () => Math.random()),
    };
  }

  getRecentActivity() {
    return [
      { action: 'Department prediction', node: 'Node 423', result: 'Dept 7', time: '2 mins ago' },
      { action: 'Link prediction', node: '156 → 892', result: '94% likely', time: '5 mins ago' },
      { action: 'Community detected', node: 'Cluster 3', result: '34 nodes', time: '12 mins ago' },
      { action: 'Embedding generated', node: 'All nodes', result: '128-dim', time: '1 hour ago' },
    ];
  }

  findOne(id: number) {
    return `This action returns a #${id} graph`;
  }

  update(id: number, updateGraphDto: UpdateGraphDto) {
    return `This action updates a #${id} graph`;
  }

  remove(id: number) {
    return `This action removes a #${id} graph`;
  }
}
