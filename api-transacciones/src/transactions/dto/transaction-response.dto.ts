import { ApiProperty } from '@nestjs/swagger';
import { TransactionStatus } from '../entities/transaction.entity';

export class TransactionResponseDto {
  @ApiProperty({
    example: '37c7eb58-9024-44b1-b354-a37531a9f480',
    description: 'ID externo de la transacción',
  })
  transactionExternalId: string;

  @ApiProperty({
    example: { name: 'Transferencia' },
    description: 'Tipo de transacción',
  })
  transactionType: { name: string };

  @ApiProperty({
    example: { name: 'pending' },
    description: 'Estado de la transacción',
  })
  transactionStatus: { name: TransactionStatus };

  @ApiProperty({
    example: 500,
    description: 'Valor de la transacción',
  })
  value: number;

  @ApiProperty({
    example: '2025-03-15T03:34:34.595Z',
    description: 'Fecha de creación de la transacción',
  })
  createdAt: Date;
}
