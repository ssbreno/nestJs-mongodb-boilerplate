import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDTO } from '../../domain/dto/user.dto';
import { User, UserDocument } from '../../domain/entities/user.entity';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';
import * as fs from 'fs';
import { promisify } from 'util';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private httpService: HttpService,
  ) {}

  async getUserFromReq(
    userDTO: Partial<UserDTO>,
    requestData?: boolean,
  ): Promise<any> {
    try {
      let userId;
      if (requestData) {
        userId = userDTO;
      } else {
        userId = userDTO.id;
      }
      const baseUrl = `${process.env.API_REQRES}/users/${userId}`;
      const responseData = await lastValueFrom(
        this.httpService.get(baseUrl, null).pipe(
          map((response: any) => {
            return response.data;
          }),
        ),
      );
      return responseData;
    } catch (e) {
      throw e;
    }
  }

  async createUser(userDTO: Pick<UserDTO, 'id'>): Promise<UserDTO> {
    try {
      const id: Pick<UserDTO, 'id'> = {
        id: userDTO.id,
      };
      const req = await this.getUserFromReq(id);
      const reqRes = req.data;
      const user = new this.userModel({
        id: req.data.id,
        first_name: reqRes.first_name,
        email: reqRes.email,
        last_name: reqRes.last_name,
        avatar: reqRes.avatar,
      });
      return user.save();
    } catch (error) {
      throw error;
    }
  }

  async getUser(userDTO: Pick<UserDTO, 'id'>): Promise<UserDocument> {
    try {
      return await this.getUserFromReq(userDTO, true);
    } catch (error) {
      throw error;
    }
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findUser(_id: string): Promise<any> {
    return await this.userModel.findById({ _id: _id }).exec();
  }

  async deleteUserAvatar(_id: string): Promise<any> {
    try {
      const user = await this.findUser(_id);
      if (fs.existsSync(`${user.avatar}.jpg`)) {
        fs.unlink(`${user.avatar}.jpg`, err => {
          if (err) throw err;
          console.log(`${user.avatar}.jpg was deleted`);
        });
      }
      if (user.avatar) {
        user.avatar = null;
        return await user.save();
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserAvatar(_id: string): Promise<string> {
    try {
      const user = await this.findUser(_id);
      const asyncFs = {
        readFile: promisify(fs.readFile),
        writeFile: promisify(fs.writeFile),
      };

      if (!user.avatar) {
        const response = await axios.get(
          `https://reqres.in/img/faces/${user.id}-image.jpg`,
          {
            responseType: 'arraybuffer',
          },
        );
        const hash = crypto
          .createHash('sha256')
          .update(response.data)
          .digest('hex');
        await asyncFs.writeFile(`${hash}.jpg`, response.data);
        user.avatar = hash;
        await user.save();
        return Buffer.from(response.data).toString('base64');
      }

      if (fs.existsSync(`${user.avatar}.jpg`)) {
        const data = await asyncFs.readFile(`${user.avatar}.jpg`);
        return Buffer.from(data).toString('base64');
      }
      //if dont have stored file or avatar have a link, shows that.
      return user;
    } catch (error) {
      throw error;
    }
  }
}
