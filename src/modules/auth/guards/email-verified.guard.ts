import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { SmtpService } from 'src/core/smtp/smtp.service';
import { UserService } from 'src/modules/user/user.service';
import { AuthService } from '../auth.service';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.user) {
      return false;
    }
    const user = await this.userService.findById(request.user.id);
    if (!user) {
      return false;
    }
    if (!user.emailVerified) {
      await this.authService.sendVerifyEmail({
        id: user.id,
        email: user.email,
      });
      throw new UnauthorizedException(
        'Почта не подтверждена. Вам было отправлено письмо для подтверждения почты',
      );
    }
    return true;
  }
}
