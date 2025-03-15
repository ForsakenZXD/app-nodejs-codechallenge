import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva transacción' })
  @ApiBody({
    description: 'Cuerpo de la petición para crear una transacción',
    type: CreateTransactionDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Transacción creada exitosamente',
    type: TransactionResponseDto,
  })
  async createTransaction(@Body() data: CreateTransactionDto) {
    return this.transactionsService.createTransaction(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una transacción por ID' })
  @ApiParam({ name: 'id', example: '37c7eb58-9024-44b1-b354-a37531a9f480' })
  @ApiResponse({
    status: 200,
    description: 'Detalles de la transacción',
    type: TransactionResponseDto,
  })
  async getTransaction(@Param('id') id: string) {
    return this.transactionsService.getTransactionById(id);
  }
}
