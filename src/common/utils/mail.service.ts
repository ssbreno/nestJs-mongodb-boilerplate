import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { RabbitMQService } from './rabbit-mq.service';

@Injectable()
export class MailService {
  private transporter = createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async sendEmail(to: string, subject: string, body: string) {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject,
      html: body,
    };

    await this.transporter.sendMail(mailOptions);

    await this.rabbitMQService.publishMessage(JSON.stringify({ to, subject }));
  }
}
