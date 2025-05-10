import { IsDefined, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @IsDefined()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @IsDefined()
  readonly password: string;
}


