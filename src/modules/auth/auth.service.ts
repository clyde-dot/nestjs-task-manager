import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { RegistrationDto } from './dto/registration.dto'
import { UserService } from 'src/modules/user/user.service'
import { compareSync, hashSync } from 'bcrypt'
import { LoginDto } from './dto/login.dto'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import { ConfigService } from '@nestjs/config'
import { ITokens } from './auth.interface'

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validate(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email)
    if (!user) {
      throw new BadRequestException('Пользователь с таким email не сущcтвует')
    }
    const isPasswordCorrect = this.compareData(password, user.password)
    if (!isPasswordCorrect) {
      throw new BadRequestException('Неверный пароль')
    }

    return user
  }

  async registration(dto: RegistrationDto): Promise<User> {
    const candidate = await this.userService.findByEmail(dto.email)
    if (candidate) {
      throw new ConflictException('Пользователь с таким email уже существует')
    }
    const hashedPassword = this.hashData(dto.password)
    const user = await this.userService.create({
      ...dto,
      password: hashedPassword,
    })
    return user
  }

  async logout(id: string): Promise<void> {
    await this.userService.updateToken(id, null)
  }

  async verifyEmail(token: string): Promise<Boolean> {
    try {
      const decodedToken = this.jwtService.verify<{
        email: string
        exp: number
        iat: number
      }>(token, {
        secret: this.configService.getOrThrow('EMAIL_VERIFY_SECRET'),
      })
      const user = await this.userService.findByEmail(decodedToken.email)
      if (!user) {
        throw new BadRequestException('Пользователь не найден')
      }
      await this.userService.update(user.id, { isVerified: true })
      return true
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('Срок действия токена истек')
      }
      console.log(error)
      throw new InternalServerErrorException('Ошибка при проверке токена')
    }
  }

  compareData(data: string, hashedData: string): boolean {
    return compareSync(data, hashedData)
  }

  hashData(data: string): string {
    return hashSync(data, 10)
  }

  async generateToken(user: User): Promise<ITokens> {
    const payload = { id: user.id, role: user.role }
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_ACCESS_EXPIRE'),
    })
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRE'),
    })
    const hashedToken = this.hashData(refreshToken)
    await this.userService.updateToken(user.id, hashedToken)
    return { accessToken, refreshToken }
  }

  generateVerifyToken(email: string): string {
    const token = this.jwtService.sign(
      { email },
      {
        secret: this.configService.getOrThrow('EMAIL_VERIFY_SECRET'),
        expiresIn: this.configService.getOrThrow('EMAIL_VERIFY_EXPIRE'),
      },
    )
    return token
  }
}
