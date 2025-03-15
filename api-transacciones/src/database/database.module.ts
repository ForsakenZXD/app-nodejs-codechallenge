import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../transactions/entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'transactions_db',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'transactions',
      entities: [Transaction],
      synchronize: true,
    }),
  ],
})
export class DatabaseModule {}
