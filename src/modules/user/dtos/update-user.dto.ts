import { Role } from '@prisma/client'
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class UpdateUserDto {
  firstName?: string
  lastName?: string
  password?: string
  role?: Role
  emailVerified?: boolean
  picture?: string
  token?: string
}

export class UpdateUserProfileDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  firstName?: string

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  lastName?: string

  @IsOptional()
  picture?: string

  @IsOptional()
  password?: string
}
