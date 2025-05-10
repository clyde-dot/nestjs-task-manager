import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { RegistrationDto } from './dtos/registration.dto'
import { UserService } from 'src/modules/user/user.service'
import { JwtService } from '@nestjs/jwt'
import { AuthMethod, User } from '@prisma/client'
import { ConfigService } from '@nestjs/config'
import { ITokens } from './auth.interface'
import { SmtpService } from 'src/core/smtp/smtp.service'
import { GoogleAuthDto } from './dtos/google-auth.dto'
import { EncryptService } from 'src/core/encrypt/encrypt.service'
import { Verify2faDto } from './dtos/verify-2fa.dto'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly smtpService: SmtpService,
    private readonly encryptService: EncryptService,
  ) {}

  async validate(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email)
    if (!user) {
      throw new BadRequestException('Пользователь с таким email не сущcтвует')
    }
    if (!user.password) {
      throw new BadRequestException('Пользователь уже зарегистрирован через Google Service')
    }
    const isPasswordCorrect = this.encryptService.compareData(password, user.password)
    if (!isPasswordCorrect) {
      throw new BadRequestException('Неверный пароль')
    }

    return user
  }

  async googleAuth(dto: GoogleAuthDto): Promise<ITokens> {
    const userExist = await this.userService.findByEmail(dto.email)

    if (userExist) {
      return this.generateToken(userExist)
    } else {
      const user = await this.userService.create({
        ...dto,
        isVerified: true,
        method: AuthMethod.GOOGLE,
      })
      return this.generateToken(user)
    }
  }

  async registration(dto: RegistrationDto): Promise<User> {
    const candidate = await this.userService.findByEmail(dto.email)
    if (candidate) {
      throw new ConflictException('Пользователь с таким email уже существует')
    }
    const hashedPassword = this.encryptService.hashData(dto.password)
    const user = await this.userService.create({
      ...dto,
      password: hashedPassword,
      method: AuthMethod.CREDENTIALS,
    })
    await this.sendVerifyEmail({ id: user.id, email: user.email })
    return user
  }

  async logout(id: string): Promise<void> {
    await this.userService.updateToken(id, null)
  }

  async sendVerifyEmail({ id, email }: { id: string; email: string }) {
    const verifyToken = this.generateVerifyToken(id)
    const sendedMessage = await this.smtpService.sendVerificationEmail(email, verifyToken)
    if (!sendedMessage) {
      throw new InternalServerErrorException('Ошибка при отправке письма')
    }
  }

  async sendTwoFactorCode({ id, email }: { id: string; email: string }) {
    const code = (Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000).toString()
    const hashedCode = this.encryptService.hashData(code.toString())

    const tokenCode = await this.generateTwoFactorToken(hashedCode)
    const user = await this.userService.update(id, { twoFactorCode: tokenCode })
    const sendedMessage = await this.smtpService.sendTwoFactorCode(email, code)
    if (!sendedMessage) {
      throw new InternalServerErrorException('Ошибка при отправке письма')
    }
  }

  async verifyEmail(token: string): Promise<Boolean> {
    try {
      const decodedToken = this.jwtService.verify<{
        id: string
        exp: number
        iat: number
      }>(token, {
        secret: this.configService.getOrThrow('EMAIL_VERIFY_SECRET'),
      })
      const user = await this.userService.findById(decodedToken.id)
      if (!user) {
        throw new BadRequestException('Пользователь не найден')
      }
      await this.userService.update(user.id, { isVerified: true })
      return true
    } catch (error) {
      this.logger.error(error)
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('Срок действия токена истек')
      }
      throw new InternalServerErrorException('Ошибка при проверке токена')
    }
  }

  async verify2fa(dto: Verify2faDto): Promise<ITokens> {
    const user = await this.userService.findByEmail(dto.email)
    if (!user || !user.twoFactorCode) {
      throw new UnauthorizedException()
    }
    const verifiedCode = this.jwtService.verify<{
      code: string
      exp: number
      iat: number
    }>(user.twoFactorCode, {
      secret: this.configService.getOrThrow('TWO_FACTOR_SECRET'),
      ignoreExpiration: true,
    })
    if (!verifiedCode) {
      throw new BadRequestException('Срок действия кода истек')
    }
    const isCodeCorrect = this.encryptService.compareData(dto.code, verifiedCode.code)
    if (!isCodeCorrect) {
      throw new BadRequestException('Неверный код')
    }
    await this.userService.update(user.id, { twoFactorCode: null })
    return await this.generateToken(user)
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
    const hashedToken = this.encryptService.hashData(refreshToken)
    await this.userService.updateToken(user.id, hashedToken)
    return { accessToken, refreshToken }
  }

  generateTwoFactorToken(code: string): string {
    const token = this.jwtService.sign(
      { code },
      {
        secret: this.configService.getOrThrow('TWO_FACTOR_SECRET'),
        expiresIn: this.configService.getOrThrow('TWO_FACTOR_EXPIRE'),
      },
    )
    return token
  }

  generateVerifyToken(id: string): string {
    const token = this.jwtService.sign(
      { id },
      {
        secret: this.configService.getOrThrow('EMAIL_VERIFY_SECRET'),
        expiresIn: this.configService.getOrThrow('EMAIL_VERIFY_EXPIRE'),
      },
    )
    return token
  }
}
