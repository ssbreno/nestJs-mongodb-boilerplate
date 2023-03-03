import { UserService } from '@business/user.service';
import { UserController } from '@controllers/user.controller';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQService } from '../../common/utils/rabbit-mq.service';
import { MailService } from '../../common/utils/mail.service';
import { User, UserSchema } from '../../domain/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    HttpModule,
  ],
  controllers: [UserController],
  providers: [UserService, MailService, RabbitMQService],
  exports: [UserService],
})
export class UserModule {}
