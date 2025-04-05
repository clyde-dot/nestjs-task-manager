import { Injectable } from '@nestjs/common'
import type { User } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: { email: string; password: string }): Promise<User> {
    return this.prismaService.user.create({
      data: data,
    })
  }

  updateToken(id: string, refreshToken: string | null): Promise<User> {
    return this.prismaService.user.update({
      where: { id },
      data: { token: refreshToken },
    })
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({ where: { email } })
  }

  findById(id: string): Promise<User | null> {
    return this.prismaService.user.findUnique({ where: { id } })
  }

  findByToken(token: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: { token },
    })
  }
}
