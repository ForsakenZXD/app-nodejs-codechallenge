import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction } from './entities/transaction.entity';
import { KafkaModule } from '../kafka/kafka.module';
import { KafkaService } from '../kafka/kafka.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    KafkaModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, KafkaService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
