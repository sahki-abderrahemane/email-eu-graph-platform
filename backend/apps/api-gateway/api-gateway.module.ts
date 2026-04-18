import { Module, Logger } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

const logger = new Logger('RedisOptions');

function redisOptions(configService: ConfigService) {
  const url = configService.get<string>('REDIS_URL');
  if (url) {
    const parsed = new URL(url);
    const opts = {
      host: parsed.hostname,
      port: parseInt(parsed.port) || 6379,
      password: parsed.password || undefined,
      tls: parsed.protocol === 'rediss:' ? { rejectUnauthorized: false } : undefined,
      retryAttempts: 5,
      retryDelay: 3000,
    };
    logger.log(`Redis connecting to ${parsed.hostname}:${opts.port} (TLS: ${!!opts.tls})`);
    return opts;
  }
  const host = configService.get<string>('REDIS_HOST') || 'localhost';
  const port = parseInt(configService.get<string>('REDIS_PORT')) || 6379;
  logger.log(`Redis connecting to ${host}:${port} (no URL, fallback)`);
  return {
    host,
    port,
    password: configService.get<string>('REDIS_PASSWORD') || undefined,
    retryAttempts: 5,
    retryDelay: 3000,
  };
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule.register({
      timeout: 60000, // 60s – ML services on Render free tier can cold-start slowly
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
