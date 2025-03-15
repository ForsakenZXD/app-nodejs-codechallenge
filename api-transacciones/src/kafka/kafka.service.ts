import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaService implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE')
    private readonly kafkaClient: ClientKafka,
  ) {}

  async publishTransaction(transaction: { 
    transactionExternalId: string; 
    value: number; 
    transactionStatus: string; 
    createdAt: Date;
  }) {
    const message = {
      transactionExternalId: transaction.transactionExternalId,
      value: transaction.value,
      transactionStatus: transaction.transactionStatus,
      createdAt: transaction.createdAt,
    };
  
    console.log('📩 Publicando en Kafka:', JSON.stringify(message, null, 2));
  
    return this.kafkaClient.emit('transactions', {
      key: transaction.transactionExternalId,
      value: JSON.stringify(message),
    }).toPromise()
      .then(() => console.log('Mensaje enviado correctamente a Kafka'))
      .catch((err) => console.error('Error enviando mensaje a Kafka:', err));
  }

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('transactions');
    await this.kafkaClient.connect();
  }
}