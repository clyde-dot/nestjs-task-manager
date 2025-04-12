import { Strategy } from 'passport-local'

import { Body, ForbiddenException, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'

import { AuthService } from '../auth.service'
import type { User } from '@prisma/client'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    })
  }

  async validate(email: string, password: string): Promise<User> {
    const user = await this.authService.validate(email, password)
    if (!user) {
      throw new ForbiddenException('Неверный email или пароль')
    }
    return user
  }
}
