import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AuthServiceModule } from './auth-service.module';

async function bootstrap() {
    const logger = new Logger('AuthService');

    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AuthServiceModule,
        {
            transport: Transport.TCP,
            options: {
                host: process.env.AUTH_SERVICE_HOST || 'localhost',
                port: parseInt(process.env.AUTH_SERVICE_PORT, 10) || 3001,
            },
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
    logger.log(`Auth Service is running on port ${process.env.AUTH_SERVICE_PORT || 3001}`);
}
bootstrap();