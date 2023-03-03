import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Connection, Channel } from 'amqplib';

@Injectable()
export class RabbitMQService {
  private connection: Connection;
  private channel: Channel;

  constructor(private readonly configService: ConfigService) {}

  async publishMessage(message: string) {
    const user = this.configService.get('RABBITMQ_USER');
    const password = this.configService.get('RABBITMQ_PASSWORD');
    const host = this.configService.get('RABBITMQ_HOST');

    this.connection = await connect(`amqp://${user}:${password}@${host}`);
    this.channel = await this.connection.createChannel();

    const exchangeName = 'my_exchange';
    const routingKey = 'my_routing_key';

    await this.channel.assertExchange(exchangeName, 'direct', {
      durable: false,
    });
    await this.channel.publish(exchangeName, routingKey, Buffer.from(message));

    console.log(
      `Message "${message}" sent to exchange "${exchangeName}" with routing key "${routingKey}"`,
    );

    await this.channel.close();
    await this.connection.close();
  }
}
