import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../domain/entities/user.entity';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { UserDTO } from '../../domain/dto/user.dto';
import { BadRequestException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let userModel: Model<UserDocument>;
  let httpService: HttpService;

  const mockUserModel = {
    find: jest.fn(),
  };

  const mockHttpService = {
    get: jest.fn(() => of({ data: {} })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserFromReq', () => {
    const httpService = {
      get: jest.fn(),
    };

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should get user data by id from API using GET request', async () => {
      const userDTO = { id: 1 };
      const baseUrl = `${process.env.API_REQRES}/users/${userDTO.id}`;
      const responseData = { id: 1, first_name: 'George' };
      const expectedResponse = responseData;

      httpService.get.mockResolvedValueOnce({ data: responseData });

      const result = await service.getUserFromReq(userDTO);

      expect(httpService.get).toHaveBeenCalledWith(baseUrl, null);
      expect(result).toEqual(expectedResponse);
    });

    it('should get user data from API using GET request if requestData is true', async () => {
      const userDTO = { id: 1 };
      const baseUrl = `${process.env.API_REQRES}/users/${userDTO.id}`;
      const responseData = { id: 1, first_name: 'George' };
      const expectedResponse = responseData;

      httpService.get.mockResolvedValueOnce({ data: responseData });

      const result = await service.getUserFromReq(userDTO, true);

      expect(httpService.get).toHaveBeenCalledWith(baseUrl, null);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw an error if the API request fails', async () => {
      const userDTO = { id: 1 };
      const expectedError = new Error('API request failed');

      httpService.get.mockRejectedValueOnce(expectedError);

      await expect(service.getUserFromReq(userDTO)).rejects.toEqual(
        expectedError,
      );
    });
  });
});

describe('createUser', () => {
  let service: UserService;
  let userModel: Model<UserDocument>;

  const mockUserModel = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn().mockReturnValue({
              pipe: jest.fn().mockReturnThis(),
              toPromise: jest.fn().mockResolvedValue({
                data: {
                  id: 1,
                  first_name: 'John',
                  last_name: 'Doe',
                  email: 'johndoe@example.com',
                  avatar: 'https://reqres.in/img/faces/1-image.jpg',
                },
              }),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  describe('when called with valid data', () => {
    it('should return the created user', async () => {
      const userDTO: Pick<UserDTO, 'id'> = { id: 1 };

      const result = await service.createUser(userDTO);

      expect(result).toEqual(1);
    });
  });

  describe('when API request fails', () => {
    it('should throw an error', async () => {
      const userDTO: Pick<UserDTO, 'id'> = { id: 1 };
      const expectedError = new Error('source.subscribe is not a function');

      jest
        .spyOn(service, 'getUserFromReq')
        .mockRejectedValueOnce(expectedError);

      await expect(service.createUser(userDTO)).rejects.toEqual(expectedError);
    });
  });
});
