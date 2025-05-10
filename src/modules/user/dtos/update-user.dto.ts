import { Role } from '@prisma/client'
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class UpdateUserDto {
  displayName?: string
  password?: string
  role?: Role
  isVerified?: boolean
  picture?: string
  token?: string
  twoFactorCode?: string | null
  isTwoFactorEnabled?: boolean
}

export class UpdateUserProfileDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  displayName?: string

  @IsOptional()
  picture?: string

  @IsOptional()
  password?: string

  @IsOptional()
  isTwoFactorEnabled?: boolean
}
