import { IsUUID, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TestTransactionDto {
  @ApiProperty({ description: 'External transaction ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  transactionExternalId: string;

  @ApiProperty({ description: 'Transaction value', example: 1200 })
  @IsNumber()
  @IsPositive()
  value: number;
}
