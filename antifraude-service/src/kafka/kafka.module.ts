import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaService } from './kafka.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [process.env.KAFKA_BROKERS || 'kafka:9092'],
          },
          consumer: {
            groupId: 'transactions-consumer',
          },
        },
      },
    ]),
  ],
  providers: [KafkaService],
  exports: [KafkaService, ClientsModule],
})
export class KafkaModule {}
