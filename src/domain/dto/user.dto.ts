import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UserDTO implements Readonly<UserDTO> {
  @IsOptional()
  _id?: string;
  @IsOptional()
  @IsNumber()
  id?: number;
  @IsString()
  @IsOptional()
  email?: string;
  @IsString()
  @IsOptional()
  first_name?: string;
  @IsString()
  @IsOptional()
  last_name?: string;
  @IsString()
  @IsOptional()
  avatar?: string;
}
