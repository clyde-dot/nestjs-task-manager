import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { PrismaModule } from 'src/prisma/prisma.module'
import { UserModule } from 'src/user/user.module'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { JwtAuthStrategy } from './strategies/jwt-auth.strategy'
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy'
import { LocalStrategy } from './strategies/local.strategy'

@Module({
  imports: [PrismaModule, UserModule, PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthStrategy, JwtRefreshStrategy,LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
