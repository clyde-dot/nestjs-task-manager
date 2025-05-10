import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { AuthMethod } from '@prisma/client'
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private logger = new Logger(GoogleStrategy.name)
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    })
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) {
    try {
      const { given_name, family_name, picture, email } = profile._json
      const user = {
        displayName: family_name + ' ' + given_name,
        picture,
        email,
        provider: AuthMethod.GOOGLE,
      }
      done(null, user)
    } catch (error) {
      this.logger.error(error)
      throw new BadRequestException('Произошла ошибка при авторизации')
    }
  }
}
