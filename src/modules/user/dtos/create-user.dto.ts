import { AuthMethod } from '@prisma/client'

export class CreateUserDto {
  readonly email: string

  readonly password?: string

  readonly displayName: string

  readonly method: AuthMethod

  readonly isVerified?: boolean
}
