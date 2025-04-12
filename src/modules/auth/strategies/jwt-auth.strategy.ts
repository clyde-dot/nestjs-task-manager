import { Injectable, UnauthorizedException } from '@nestjs/common'
import { User } from '@prisma/client'
import { ConfigService } from '@nestjs/config'
import { UserService } from 'src/modules/user/user.service'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWT_ACCESS_SECRET'),
    })
  }

  async validate({ id }: { id: string }): Promise<User> {
    const user = await this.userService.findById(id)
    if (!user) {
      throw new UnauthorizedException()
    }
    return user
  }
}
