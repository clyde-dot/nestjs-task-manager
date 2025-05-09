import { Body, Controller, Get, Param, Patch, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegistrationDto } from './dtos/registration.dto'
import { Response } from 'express'
import { RequestWithUser } from './auth.interface'
import { Public } from './decorators/is-public.decorator'
import { Role, type User } from '@prisma/client'
import { UserDecorator } from './decorators/user.decorator'
import { JwtRefreshGuard } from './guards/jwt-refresh.guard'
import { EmailVerifiedGuard } from './guards/email-verified.guard'
import { AccountVerified } from './decorators/account-verified.decorator'
import { GoogleGuard } from './guards/google.guard'
import { Verify2faDto } from './dtos/verify-2fa.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('registration')
  async registration(@Body() dto: RegistrationDto) {
    await this.authService.registration(dto)
    return 'Вы успешно зарегистрировались! На вашу почту было отправлено письмо для подтверждения почты'
  }

  @Public()
  @AccountVerified('local')
  @Post('login')
  async login(@UserDecorator() user: User, @Res() res: Response) {
    if (user.isTwoFactorEnabled) {
      await this.authService.sendTwoFactorCode({ id: user.id, email: user.email })
      return res.json({
        message: 'Вы успешно авторизовались ! Для завершения процесса введите код из письма на вашу почту',
      })
    }
    const tokens = await this.authService.generateToken(user)
    res.cookie('refreshToken', tokens.refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      domain: 'localhost',
    })

    return res.json({
      accessToken: tokens.accessToken,
      message: 'Вы успешно авторизовались !',
    })
  }

  @UseGuards(GoogleGuard)
  @Public()
  @Get('google')
  async loginWithGoogle() {}

  @UseGuards(GoogleGuard)
  @Public()
  @Get('google/callback')
  async googleCallback(@Req() req: RequestWithUser, @Res() res: Response) {
    const user = req.user
    const tokens = await this.authService.googleAuth(user)
    res.cookie('refreshToken', tokens.refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      domain: 'localhost',
    })

    return res.json({
      accessToken: tokens.accessToken,
      message: 'Вы успешно авторизовались !',
    })
  }

  @Post('logout')
  async logout(@Req() req: RequestWithUser, @Res() res: Response) {
    res.clearCookie('refreshToken')
    await this.authService.logout(req.user.id)
    return res.json({ message: 'Вы успешно вышли из аккаунта' })
  }

  @Public()
  @UseGuards(JwtRefreshGuard, EmailVerifiedGuard)
  @Post('refresh')
  async refresh(@UserDecorator() user: User, @Res() res: Response) {
    const tokens = await this.authService.generateToken(user)
    res.cookie('refreshToken', tokens.refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    return res.json({ accessToken: tokens.accessToken })
  }

  @UseGuards(JwtRefreshGuard)
  @Get('profile')
  async getProfile(@Req() req: RequestWithUser) {
    return req.user
  }

  @Public()
  @Get('verify/:token')
  async verify(@Param('token') token: string, @Res() res: Response) {
    await this.authService.verifyEmail(token)
    return res.json({ message: 'Вы успешно подтвердили почту' })
  }

  @Public()
  @Post('verify-2fa')
  async verify2fa(@Body() dto: Verify2faDto, @Res() res: Response) {
    const tokens = await this.authService.verify2fa(dto)
    res.cookie('refreshToken', tokens.refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      domain: 'localhost',
    })

    return res.json({
      accessToken: tokens.accessToken,
      message: 'Вы успешно авторизовались !',
    })
  }
}
