import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { UserModule } from 'src/modules/user/user.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtAuthStrategy } from './strategies/jwt-auth.strategy'
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy'
import { LocalStrategy } from './strategies/local.strategy'
import { SmtpModule } from 'src/core/smtp/smtp.module'
import { GoogleStrategy } from './strategies/google.strategy'
import { EncryptModule } from 'src/core/encrypt/encrypt.module'

@Module({
  imports: [UserModule, PassportModule, JwtModule.register({}), SmtpModule, EncryptModule],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthStrategy, JwtRefreshStrategy, LocalStrategy, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}
