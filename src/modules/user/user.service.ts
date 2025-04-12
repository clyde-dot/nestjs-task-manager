import { BadRequestException, Injectable } from '@nestjs/common'
import type { User } from '@prisma/client'
import { PrismaService } from 'src/core/prisma/prisma.service'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: {
    firstName: string
    lastName: string
    email: string
    password: string
  }): Promise<User> {
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

  update(id: string, updateUserDto: UpdateUserDto) {
    let data = {}
    if (updateUserDto.isVerified !== undefined) {
      data = { ...data, isVerified: updateUserDto.isVerified }
    }
    if (updateUserDto.token !== undefined) {
      data = { ...data, token: updateUserDto.token }
    }
    if (updateUserDto.password !== undefined) {
      data = { ...data, password: updateUserDto.password }
    }
    if (updateUserDto.role !== undefined) {
      data = { ...data, role: updateUserDto.role }
    }
    if (updateUserDto.firstName !== undefined) {
      data = { ...data, firstName: updateUserDto.firstName }
    }
    if (updateUserDto.lastName !== undefined) {
      data = { ...data, lastName: updateUserDto.lastName }
    }
    if (!data) throw new BadRequestException('нет данных для обновления')
    return this.prismaService.user.update({
      where: { id },
      data,
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
