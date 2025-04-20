import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator'

export class RegistrationDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @IsDefined()
  readonly firstName: string

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @IsDefined()
  readonly lastName: string

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @IsDefined()
  readonly email: string

  @IsNotEmpty()
  @IsString()
  @IsDefined()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  readonly password: string
}
