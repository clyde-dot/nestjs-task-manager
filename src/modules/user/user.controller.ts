import {
  BadRequestException,
  Body,
  Controller,
  FileTypeValidator,
  Get,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { UserService } from './user.service'
import { Roles } from '../auth/decorators/role.decorator'
import { Role } from '@prisma/client'
import { UpdateUserProfileDto } from './dtos/update-user.dto'
import { UserDecorator } from '../auth/decorators/user.decorator'
import { FileInterceptor } from '@nestjs/platform-express'
import { JwtRefreshGuard } from '../auth/guards/jwt-refresh.guard'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('profile')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @UserDecorator('id') id: string,
    @Body()
    dto: UpdateUserProfileDto,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: false, validators: [new FileTypeValidator({ fileType: '.jpeg' })] }))
    file: Express.Multer.File,
  ) {
    const user = await this.userService.updateUserProfile(id, dto, file)
    if (!user) throw new BadRequestException('Не удалось обновить профиль')
    return { status: 204, message: 'Профиль успешно обновлен' }
  }

  @Roles([Role.REGULAR, Role.ADMIN])
  @Get('')
  async findAll() {
    const users = await this.userService.findAll()
    return users
  }

  @Roles([Role.REGULAR, Role.ADMIN])
  @Get(':id')
  async findById(@Query('id') id: string) {
    const user = await this.userService.findById(id)
    return user
  }
}
