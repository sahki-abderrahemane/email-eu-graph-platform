import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphService } from './graph.service';
import { GraphController } from './graph.controller';
import { Node, NodeSchema } from './src/schemas/node.schema';
import { Edge, EdgeSchema } from './src/schemas/edge.schema';
import { PredictionHistory, PredictionHistorySchema } from './src/schemas/prediction.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/email-eu-graph',
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Node.name, schema: NodeSchema },
      { name: Edge.name, schema: EdgeSchema },
      { name: PredictionHistory.name, schema: PredictionHistorySchema },
    ]),
  ],
  controllers: [GraphController],
  providers: [GraphService],
})
export class GraphModule { }
