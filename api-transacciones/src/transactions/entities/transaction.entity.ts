import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum TransactionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { unique: true }) 
  transactionExternalId: string;

  @Column('uuid')
  accountExternalIdDebit: string;

  @Column('uuid')
  accountExternalIdCredit: string;

  @Column()
  transferTypeId: number;

  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  transactionStatus: TransactionStatus;

  @CreateDateColumn()
  createdAt: Date;
}