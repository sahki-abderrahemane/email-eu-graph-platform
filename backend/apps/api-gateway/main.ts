import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
    const app = await NestFactory.create(ApiGatewayModule);

    app.enableCors({
        origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
        credentials: true,
    });

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`API Gateway running on port ${port}`);
}
bootstrap();