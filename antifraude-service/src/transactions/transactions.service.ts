import { Injectable, Logger, BadRequestException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionStatus } from './entities/transaction.entity';
import { TestTransactionDto } from './dto/test-transaction.dto';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class TransactionsService implements OnModuleInit {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private kafkaService: KafkaService,
  ) {}

  async onModuleInit() {
    this.kafkaService.registerTransactionListener(this.processTransaction.bind(this));
  }

  async findOne(id: string): Promise<Transaction> {
    try {
      if (!id) {
        throw new BadRequestException('Transaction ID is required');
      }
  
      this.logger.log(`🔎 Buscando transacción con ID: ${id}`);
  
      const transaction = await this.transactionsRepository.findOne({
        where: { transactionExternalId: id },
      });
  
      if (!transaction) {
        this.logger.warn(`No se encontró la transacción con ID: ${id}`);
        throw new NotFoundException(`Transaction with ID ${id} not found`);
      }
  
      this.logger.log(`Transacción encontrada: ${JSON.stringify(transaction, null, 2)}`);
      return transaction;
    } catch (error) {
      this.logger.error(`Error buscando transacción: ${error.message}`);
      throw error;
    }
  }

  async processTransaction(data: any): Promise<void> {
    try {
      this.logger.log(`🔹 Iniciando procesamiento de transacción: ${JSON.stringify(data)}`);
  
      const { transactionExternalId, value } = data;
  
      if (!transactionExternalId || typeof value !== 'number') {
        this.logger.error('Datos de transacción inválidos.');
        throw new BadRequestException('Invalid transaction data');
      }
  
      const status = value > 1000 
        ? TransactionStatus.REJECTED 
        : TransactionStatus.APPROVED;
  
      this.logger.log(`Buscando transacción en BD con ID: ${transactionExternalId}`);
  
      let transaction = await this.transactionsRepository.findOne({
        where: { transactionExternalId },
      });
  
      if (!transaction) {
        this.logger.error(`Transacción no encontrada: ${transactionExternalId}`);
        throw new NotFoundException(`Transaction with ID ${transactionExternalId} not found`);
      }
  
      transaction.transactionStatus = status;
      await this.transactionsRepository.save(transaction);
  
      this.logger.log(`Transacción actualizada en BD: ${JSON.stringify(transaction)}`);
  
      const response = {
        transactionExternalId,
        transactionStatus: status,
        processedAt: new Date(),
      };
        await this.kafkaService.emitTransactionResult(response);  
    } catch (error) {
      this.logger.error(`Error procesando transacción: ${error.message}`);
      throw error;
    }
  }

  async processTestTransaction(testTransactionDto: TestTransactionDto): Promise<void> {
    try {
      await this.processTransaction(testTransactionDto);
    } catch (error) {
      this.logger.error(`Error processing test transaction: ${error.message}`);
      throw error;
    }
  }
}
