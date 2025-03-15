import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsNumber, IsPositive } from 'class-validator';

export class CreateTransactionDto {
  @ApiPropertyOptional({
    description: 'UUID externo de la transacción. Si no se envía, se genera automáticamente.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  transactionExternalId?: string;

  @ApiProperty({
    description: 'UUID de la cuenta que debita dinero',
    example: '6ba7b810-9dad-11d1-80b4-00c04fd430c2',
  })
  @IsUUID()
  accountExternalIdDebit: string;

  @ApiProperty({
    description: 'UUID de la cuenta que recibe dinero',
    example: '7ba7b810-9dad-11d1-80b4-00c04fd430c3',
  })
  @IsUUID()
  accountExternalIdCredit: string;

  @ApiProperty({
    description: 'Tipo de transacción (1: Transferencia, 2: Pago de servicio, etc.)',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  transferTypeId: number;

  @ApiProperty({
    description: 'Monto de la transacción',
    example: 120.50,
  })
  @IsNumber()
  @IsPositive()
  value: number;
}
