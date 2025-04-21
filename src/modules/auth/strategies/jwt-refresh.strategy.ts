import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/modules/user/user.service';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([JwtRefreshStrategy.extractTokenFromCookie]),
      ignoreExpiration: true,
      secretOrKey: configService.getOrThrow('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  private static extractTokenFromCookie(req: Request): string | null {
    const token = req?.cookies?.refreshToken;
    if (token) {
      return token;
    }
    return null;
  }

  async validate(req: Request) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Не валидный токен обновления');
    }
    const payload = this.jwtService.verify(refreshToken, {
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
    });

    const user = await this.userService.findById(payload.id);
    if (!user || !user.token) {
      throw new UnauthorizedException('Пользователь пытается обойти защиту без авторизаций ');
    }

    const isValid = this.authService.compareData(refreshToken, user.token);
    if (!isValid) {
      throw new UnauthorizedException('Вы пытаетесь обойти защиту с невалидным токеном обновления');
    }

    return user;
  }
}
