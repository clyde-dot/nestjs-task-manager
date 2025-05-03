import { BadRequestException, Injectable, Ip } from '@nestjs/common'
import type { User } from '@prisma/client'
import { PrismaService } from 'src/core/prisma/prisma.service'
import { UpdateUserDto, UpdateUserProfileDto } from './dtos/update-user.dto'
import { SafeUserType } from './omit/user.omit'
import { CreateUserDto } from './dtos/create-user.dto'
import { FileService } from '../file/file.service'
import { EncryptService } from 'src/core/encrypt/encrypt.service'

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileService: FileService,
    private readonly encryptService: EncryptService,
  ) {}

  create(dto: CreateUserDto): Promise<User> {
    return this.prismaService.user.create({
      data: dto,
    })
  }

  updateToken(id: string, refreshToken: string | null): Promise<User> {
    return this.prismaService.user.update({
      where: { id },
      data: { token: refreshToken },
    })
  }

  async updateUserProfile(id: string, dto: UpdateUserProfileDto, profilePicture?: Express.Multer.File): Promise<User> {
    if (!dto) {
      throw new BadRequestException('Нет данных для обновления')
    }

    let data = { ...dto }

    if (profilePicture) {
      const user = await this.prismaService.user.findUnique({ where: { id } })
      if (!user) {
        throw new BadRequestException('Пользователь не найден')
      }

      if (user.picture) {
        await this.fileService.updateFile(profilePicture, user.picture)
      } else {
        const key = await this.fileService.uploadFile(profilePicture)
        data = { ...data, picture: key }
      }
    }

    if (data.password) {
      const hashedPassword = this.encryptService.hashData(data.password)
      data = { ...data, password: hashedPassword }
    }

    return await this.prismaService.user.update({
      where: { id },
      data,
    })
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    let data = {}
    if (updateUserDto.emailVerified !== undefined) {
      data = { ...data, emailVerified: updateUserDto.emailVerified }
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
    if (updateUserDto.picture !== undefined) {
      data = { ...data, picture: updateUserDto.picture }
    }
    if (!data) throw new BadRequestException('нет данных для обновления')
    return await this.prismaService.user.update({
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

  findAll(): Promise<SafeUserType[]> {
    return this.prismaService.user.findMany({
      omit: {
        password: true,
        token: true,
      },
    })
  }
}
