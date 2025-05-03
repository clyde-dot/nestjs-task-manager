import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileService } from './file.service'
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express'
import { Response } from 'express'
import { Roles } from '../auth/decorators/role.decorator'
import { File, Role } from '@prisma/client'
import { Public } from '../auth/decorators/is-public.decorator'
import { ValidateKeyGuard } from './guards/validate-key.guard'
import { FileFromKey } from './decorators/file.decorator'

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Public()
  @Post('upload')
  @UseInterceptors(AnyFilesInterceptor({ limits: { files: 2 } }))
  async uploadFile(@UploadedFiles(new ParseFilePipe({ fileIsRequired: true })) files: Express.Multer.File[]) {
    await this.fileService.uploadFiles(files)
    return {
      message: 'Файл успешно загружен на сервер',
    }
  }

  @Public()
  @Get('')
  async findAll() {
    const files = await this.fileService.findAll()
    if (!files.length) throw new NotFoundException('Пусто')
    return files
  }

  @UseGuards(ValidateKeyGuard)
  @Roles([Role.ADMIN, Role.OPERATOR, Role.PROGRAMMER])
  @Get('image')
  async getImage(@FileFromKey() file: File, @Res() res: Response) {
    const { stream } = await this.fileService.getImage(file)
    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `inline; filename="${file.fileName}"`,
    })
    stream.pipe(res)
  }

  @Public()
  @UseGuards(ValidateKeyGuard)
  @Get('download')
  async download(@FileFromKey() file: File, @Res() res: Response) {
    const { stream, contentType } = await this.fileService.getImage(file)
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${file.fileName}"`,
    })
    stream.pipe(res)
  }

  @Public()
  @UseGuards(ValidateKeyGuard)
  @Patch('update')
  @UseInterceptors(FileInterceptor('file'))
  async updateFile(@UploadedFile(new ParseFilePipe({ fileIsRequired: true })) file: Express.Multer.File, @FileFromKey('key') key: string) {
    await this.fileService.updateFile(file, key)
    return { message: 'Файл успешно обновлен' }
  }

  @Public()
  @UseGuards(ValidateKeyGuard)
  @Delete('delete')
  async deleteFile(@FileFromKey() file: File) {
    await this.fileService.deleteFile(file.key)
    return { message: 'Файл успешно удален', status: 204 }
  }
}
