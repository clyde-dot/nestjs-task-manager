import { AuthMethod } from '@prisma/client'

export class GoogleAuthDto {
  displayName: string

  picture: string | null

  email: string

  method: AuthMethod
}
