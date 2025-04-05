import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { UserService } from 'src/user/user.service'

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    if (!request.user) {
      return false
    }
    const user = await this.userService.findById(request.user.id)
    if (!user) {
      return false
    }
    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Почта не подтверждена. Подтвердите почту для авторизации',
      )
    }
    return true
  }
}
