import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { VisualizationServiceModule } from './visualization-service.module';
async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        VisualizationServiceModule,
        {
            transport: Transport.TCP,
            options: {
                host: 'localhost',
                port: 3004,
            },
        },
    );

    await app.listen();
    console.log('🔐 Visualization Service running on port 3004');
}
bootstrap();