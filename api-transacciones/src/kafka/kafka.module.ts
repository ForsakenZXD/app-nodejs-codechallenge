import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { KafkaService } from './kafka.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: ['kafka:9092'],
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
