import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AuthServiceModule } from './auth-service.module';
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
    const logger = new Logger('AuthService');

    const redisOptions = process.env.REDIS_URL
        ? parseRedisUrl(process.env.REDIS_URL)
        : {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
        };

    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AuthServiceModule,
        {
            transport: Transport.REDIS,
            options: redisOptions,
        },
    );

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    await app.listen();
    logger.log('Auth Service is running via Redis transport');

    // HTTP server so Render detects an open port
    const port = process.env.PORT || 3001;
    http
        .createServer((req, res) => {
            res.writeHead(200);
            res.end(JSON.stringify({ status: 'ok', service: 'auth-service' }));
        })
        .listen(port, () => {
            logger.log(`Auth Service health check listening on port ${port}`);
        });
}
bootstrap();