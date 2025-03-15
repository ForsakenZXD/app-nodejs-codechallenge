import { Injectable, Inject, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Transaction, TransactionStatus } from './entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { KafkaService } from '../kafka/kafka.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly kafkaService: KafkaService,
  ) {}

  async createTransaction(data: CreateTransactionDto): Promise<TransactionResponseDto> {
    try {
      const transactionData: Partial<Transaction> = {
        ...data,
        transactionExternalId: data.transactionExternalId || uuidv4(),
        transactionStatus: TransactionStatus.PENDING,
      };
  
      const transaction = this.transactionRepository.create(transactionData);
      await this.transactionRepository.save(transaction);

      await this.kafkaService.publishTransaction({
        transactionExternalId: transaction.transactionExternalId,
        value: transaction.value,
        transactionStatus: transaction.transactionStatus,
        createdAt: transaction.createdAt,
      });

      return {
        transactionExternalId: transaction.transactionExternalId,
        transactionType: { name: 'Transferencia' },
        transactionStatus: { name: transaction.transactionStatus },
        value: transaction.value,
        createdAt: transaction.createdAt,
      };
    } catch (error) {
      console.error('Error al crear la transacción:', error);
      throw new InternalServerErrorException('Error al procesar la transacción');
    }
  }

  async getTransactionById(transactionExternalId: string): Promise<TransactionResponseDto> {
    try {
      const transaction = await this.transactionRepository.findOne({
        where: { transactionExternalId },
      });

      if (!transaction) {
        throw new NotFoundException(`Transacción con ID ${transactionExternalId} no encontrada`);
      }

      return {
        transactionExternalId: transaction.transactionExternalId,
        transactionType: { name: 'Transferencia' },
        transactionStatus: { name: transaction.transactionStatus },
        value: transaction.value,
        createdAt: transaction.createdAt,
      };
    } catch (error) {
      console.error(`Error al obtener la transacción ${transactionExternalId}:`, error);
      throw new InternalServerErrorException('Error al recuperar la transacción');
    }
  }
}