import { AuthProvider } from '@prisma/client'

export class GoogleAuthDto {
  firstName: string
  lastName: string
  picture: string | null
  email: string
  provider: AuthProvider
}
