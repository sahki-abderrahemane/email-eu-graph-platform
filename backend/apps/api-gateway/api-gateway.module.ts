import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

function redisOptions(configService: ConfigService) {
  const url = configService.get<string>('REDIS_URL');
  if (url) {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port) || 6379,
      password: parsed.password || undefined,
      tls: parsed.protocol === 'rediss:' ? {} : undefined,
    };
  }
  return {
    host: configService.get<string>('REDIS_HOST') || 'localhost',
    port: parseInt(configService.get<string>('REDIS_PORT')) || 6379,
    password: configService.get<string>('REDIS_PASSWORD') || undefined,
  };
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule.register({
      timeout: 8000,
      maxRedirects: 5,
    }),
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        useFactory: (cfg: ConfigService) => ({
          transport: Transport.REDIS,
          options: redisOptions(cfg),
        }),
        inject: [ConfigService],
      },
      {
        name: 'USER_SERVICE',
        imports: [ConfigModule],
        useFactory: (cfg: ConfigService) => ({
          transport: Transport.REDIS,
          options: redisOptions(cfg),
        }),
        inject: [ConfigService],
      },
      {
        name: 'GRAPH_SERVICE',
        imports: [ConfigModule],
        useFactory: (cfg: ConfigService) => ({
          transport: Transport.REDIS,
          options: redisOptions(cfg),
        }),
        inject: [ConfigService],
      },
      {
        name: 'VISUALIZATION_SERVICE',
        imports: [ConfigModule],
        useFactory: (cfg: ConfigService) => ({
          transport: Transport.REDIS,
          options: redisOptions(cfg),
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [ApiGatewayController],
})
export class ApiGatewayModule { }
