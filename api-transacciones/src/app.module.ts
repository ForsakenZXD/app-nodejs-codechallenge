import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { TransactionsModule } from './transactions/transactions.module';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    TransactionsModule,
    KafkaModule,
  ],
})
export class AppModule {}
