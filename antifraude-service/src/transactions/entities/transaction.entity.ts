import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum TransactionStatus {
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('transaction')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { unique: true, name: 'transactionExternalId' })
  transactionExternalId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
  })
  transactionStatus: TransactionStatus;

  @CreateDateColumn()
  createdAt: Date;
}
