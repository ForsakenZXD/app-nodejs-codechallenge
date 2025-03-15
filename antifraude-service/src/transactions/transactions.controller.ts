import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { TestTransactionDto } from './dto/test-transaction.dto';
import { Transaction } from './entities/transaction.entity';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Obtener el estado de una transacción por ID' })
  @ApiResponse({ status: 200, description: 'Transacción encontrada', type: Transaction })
  @ApiResponse({ status: 404, description: 'Transacción no encontrada' })
  async getTransaction(@Param('id') id: string): Promise<Transaction> {
    const transaction = await this.transactionsService.findOne(id);
    if (!transaction) {
      throw new NotFoundException(`Transacción con ID ${id} no encontrada`);
    }
    return transaction;
  }

  @Post('test')
  @ApiOperation({ summary: 'Crear una transacción de prueba' })
  @ApiResponse({ status: 201, description: 'Transacción creada', type: Transaction })
  async createTestTransaction(@Body() testTransactionDto: TestTransactionDto): Promise<Transaction> {
    const transaction: any = await this.transactionsService.processTestTransaction(testTransactionDto);
    if (!transaction) {
      throw new NotFoundException('Error al procesar la transacción de prueba');
    }
    return transaction;
  }

  @EventPattern('transactions')
  async handleTransaction(data: Record<string, any>): Promise<Transaction | void> {
    return await this.transactionsService.processTransaction(data);
  }
}