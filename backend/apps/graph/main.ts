import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { GraphModule } from './graph.module';
async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        GraphModule,
        {
            transport: Transport.TCP,
            options: {
                host: 'localhost',
                port: 3003,
            },
        },
    );

    await app.listen();
    console.log('🔐 Graph Service running on port 3003');
}
bootstrap();