import { User } from '@prisma/client'

export type SafeUserType = Omit<User, 'password' | 'token'>
