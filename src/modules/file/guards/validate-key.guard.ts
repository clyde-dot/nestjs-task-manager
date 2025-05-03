import { BadRequestException, CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common'
import { FileService } from '../file.service'

@Injectable()
export class ValidateKeyGuard implements CanActivate {
  constructor(private readonly fileService: FileService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const key = request?.query?.key
    if (!key) {
      throw new NotFoundException()
    }
    const fileExists = await this.fileService.findByKey(key)
    if (!fileExists) {
      throw new NotFoundException()
    }
    request.keyFile = fileExists
    return true
  }
}
