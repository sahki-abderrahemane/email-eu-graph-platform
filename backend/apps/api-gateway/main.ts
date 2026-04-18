import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger('APIGateway');
    const app = await NestFactory.create(ApiGatewayModule);

    app.enableCors({
        origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
        credentials: true,
    });

    const port = process.env.PORT || 3000;
    await app.listen(port);

    logger.log(`API Gateway running on port ${port}`);
    logger.log(`REDIS_URL set: ${!!process.env.REDIS_URL}`);
    logger.log(`ML_SERVICE_URL: ${process.env.ML_SERVICE_URL || 'http://localhost:8000'}`);
    logger.log(`CORS_ORIGIN: ${process.env.CORS_ORIGIN || '*'}`);
}
bootstrap();