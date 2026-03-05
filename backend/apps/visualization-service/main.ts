import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { VisualizationServiceModule } from './visualization-service.module';
import * as http from 'http';

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

    // HTTP server so Render detects an open port
    const port = process.env.PORT || 3004;
    http
        .createServer((req, res) => {
            res.writeHead(200);
            res.end(JSON.stringify({ status: 'ok', service: 'visualization-service' }));
        })
        .listen(port, () => {
            console.log(`Visualization Service health check listening on port ${port}`);
        });
}
bootstrap();