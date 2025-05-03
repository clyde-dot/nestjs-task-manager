import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './core/prisma/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { UserModule } from './modules/user/user.module'
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard'
import { SmtpModule } from './core/smtp/smtp.module'
import { RolesGuard } from './modules/auth/guards/role-bases.guard'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { AmazonS3Module } from './core/amazon-s3/amazon-s3.module'
import { FileModule } from './modules/file/file.module'
import { EncryptModule } from './core/encrypt/encrypt.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
    SmtpModule,
    AmazonS3Module,
    FileModule,
    EncryptModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
