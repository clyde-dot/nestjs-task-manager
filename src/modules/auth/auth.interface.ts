import type { User } from '@prisma/client'
import { Request } from 'express'

export interface ITokens {
  accessToken: string
  refreshToken: string
}

export interface RequestWithUser extends Request {
  user: User
}
