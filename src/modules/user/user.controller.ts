import { Controller, Get, Ip, Query, UseGuards } from '@nestjs/common'
import { UserService } from './user.service'
import { Roles } from '../auth/decorators/role.decorator'
import { Role } from '@prisma/client'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles([Role.USER, Role.ADMIN])
  @Get('')
  async findAll(@Ip() ip: string) {
    const users = await this.userService.findAll()
    return users
  }
}
