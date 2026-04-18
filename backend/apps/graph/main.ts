import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { GraphModule } from './graph.module';
import * as http from 'http';

function parseRedisUrl(url: string) {
    const parsed = new URL(url);
    return {
        host: parsed.hostname,
        port: parseInt(parsed.port) || 6379,
        password: parsed.password || undefined,
        tls: parsed.protocol === 'rediss:' ? { rejectUnauthorized: false } : undefined,
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
        GraphModule,
        {
            transport: Transport.REDIS,
            options: redisOptions,
        },
    );

    await app.listen();
    console.log('Graph Service is running via Redis transport');

    // HTTP server so Render detects an open port
    const port = process.env.PORT || 3003;
    http
        .createServer((req, res) => {
            res.writeHead(200);
            res.end(JSON.stringify({ status: 'ok', service: 'graph-service' }));
        })
        .listen(port, () => {
            console.log(`Graph Service health check listening on port ${port}`);
        });
}
bootstrap();