import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Consumer, Kafka, KafkaConfig, Producer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private consumer: Consumer;
  private producer: Producer;
  private topic: string;
  private transactionListener: ((transactionData: any) => Promise<void>) | null = null;

  constructor() {
    const brokers = process.env.KAFKA_BROKERS?.split(',') ?? ['localhost:9092'];
    const clientId = process.env.KAFKA_CLIENT_ID || 'antifraude-service-client';
    const groupId = process.env.KAFKA_GROUP_ID || 'antifraude-consumer-group';
    this.topic = process.env.KAFKA_TOPIC || 'transactions';

    const kafkaConfig: KafkaConfig = {
      clientId,
      brokers,
    };

    this.kafka = new Kafka(kafkaConfig);
    this.consumer = this.kafka.consumer({ groupId });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    setTimeout(async () => {
        await this.connect();
    }, 5000);
}

async connect() {
  let retries = 10;
  let delay = 5000;

  while (retries > 0) {
      try {
          this.logger.log('Intentando conectar con Kafka...');
          await this.producer.connect();
          await this.consumer.connect();

          await this.ensureTopicExists('transaction-results');

          await this.consumer.subscribe({ topic: this.topic, fromBeginning: true });

          this.logger.log(`Suscrito al tópico: ${this.topic}`);

          await this.consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
              const value: any = message.value?.toString();
              this.logger.log(`Mensaje recibido en ${topic} [Partición ${partition}]: ${value}`);
          
              try {
                const transactionData = JSON.parse(value);
          
                this.logger.log(`Datos de la transacción recibida: ${JSON.stringify(transactionData, null, 2)}`);
          
                if (this.transactionListener) {
                  await this.transactionListener(transactionData);
                }
              } catch (error) {
                this.logger.error(`Error procesando transacción: ${error.message}`);
              }
            },
          });

          break;

      } catch (error) {
          this.logger.error(`Error al conectar con Kafka (${10 - retries + 1}/10): ${error.message}`);
          retries--;

          if (retries === 0) {
              throw new Error('Error crítico: No se pudo conectar con Kafka después de varios intentos.');
          }

          this.logger.log(`Reintentando conexión en ${delay / 1000} segundos...`);
          await new Promise(resolve => setTimeout(resolve, delay));

          delay *= 2;
      }
  }
}

  registerTransactionListener(listener: (transactionData: any) => Promise<void>) {
    this.transactionListener = listener;
  }

  async emitTransactionResult(result: any): Promise<void> {
    try {
      this.logger.log(`Intentando emitir resultado de transacción: ${JSON.stringify(result)}`);

      await this.producer.send({
        topic: 'transaction-results',
        messages: [{ value: JSON.stringify(result) }],
      });

      this.logger.log(`Resultado enviado a transaction-results: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error(`Error enviando mensaje a Kafka: ${error.message}`);
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log('Cerrando conexiones Kafka...');
    await this.consumer.disconnect();
    await this.producer.disconnect();
  }

  async ensureTopicExists(topic: string) {
    const admin = this.kafka.admin();
    await admin.connect();
    const topics = await admin.listTopics();
  
    if (!topics.includes(topic)) {
      this.logger.log(`Creando tópico: ${topic}`);
      await admin.createTopics({
        topics: [{ topic, numPartitions: 1, replicationFactor: 1 }],
      });
    } else {
      this.logger.log(`Tópico ${topic} ya existe`);
    }
  
    await admin.disconnect();
  }
}