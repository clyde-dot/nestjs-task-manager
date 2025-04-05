import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common'
import { RegistrationDto } from './dto/registration.dto'
import { UserService } from 'src/user/user.service'
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
    /*if(!user.isVerified){
      throw new BadRequestException('Почта не подтверждена. Подтвердите почту для авторизации')
    }*/
    return user
  }

  async registration(dto: RegistrationDto): Promise<string> {
    const candidate = await this.userService.findByEmail(dto.email)
    if (candidate) {
      throw new ConflictException('Пользователь с таким email уже существует')
    }
    const hashedPassword = this.hashData(dto.password)
    await this.userService.create({
      email: dto.email,
      password: hashedPassword,
    })
    return 'Вы успешно зарегистрировались'
  }

  async logout(id: string): Promise<void> {
    await this.userService.updateToken(id, null)
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
}
