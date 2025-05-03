import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { FileModule } from '../file/file.module'
import { EncryptModule } from 'src/core/encrypt/encrypt.module'

@Module({
  imports: [FileModule, EncryptModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
