import { UserService } from '@business/user.service';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { MailService } from '../../common/utils/mail.service';
import { UserDTO } from '../../domain/dto/user.dto';

@Controller('api/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  @Post('/create')
  async createUser(@Body() userDTO: UserDTO) {
    try {
      const user = await this.userService.createUser(userDTO);
      await this.mailService.sendEmail(
        process.env.GMAIL_USER,
        'User created',
        'Hello, thank you for registering.',
      );
      console.log('Email sent successfully');
      return user;
    } catch (error) {
      throw error;
    }
  }

  @Get('/get/:id')
  async getUserFromReq(@Param('id') userDTO: UserDTO) {
    try {
      return await this.userService.getUser(userDTO);
    } catch (error) {
      throw error;
    }
  }

  @Get('/getAll')
  async getAllUsers() {
    try {
      return await this.userService.findAll();
    } catch (error) {
      throw error;
    }
  }

  @Get('/get/:id/avatar')
  async getUserAvatar(@Param('id') _id: string) {
    try {
      return await this.userService.getUserAvatar(_id);
    } catch (error) {
      throw error;
    }
  }

  @Delete('/:id/avatar')
  async deleteUser(@Param('id') _id: string) {
    try {
      return await this.userService.deleteUserAvatar(_id);
    } catch (error) {
      throw error;
    }
  }
}
