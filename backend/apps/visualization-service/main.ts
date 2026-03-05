import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { VisualizationServiceModule } from './visualization-service.module';

function parseRedisUrl(url: string) {
    const parsed = new URL(url);
    return {
        host: parsed.hostname,
        port: parseInt(parsed.port) || 6379,
        password: parsed.password || undefined,
        tls: parsed.protocol === 'rediss:' ? {} : undefined,
    };
}

async function bootstrap() {
    const redisOptions = process.env.REDIS_URL
        ? parseRedisUrl(process.env.REDIS_URL)
        : {
              host: process.env.REDIS_HOST || 'localhost',
              port: parseInt(process.env.REDIS_PORT) || 6379,
              password: process.env.REDIS_PASSWORD || undefined,
          };

    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        VisualizationServiceModule,
        {
            transport: Transport.REDIS,
            options: redisOptions,
        },
    );

    await app.listen();
    console.log('Visualization Service is running via Redis transport');
}
bootstrap();