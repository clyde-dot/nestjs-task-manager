import { createParamDecorator, ExecutionContext, NotFoundException } from '@nestjs/common'

export const FileFromKey = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  if (!request?.keyFile) {
    throw new NotFoundException()
  }
  return data ? request.keyFile[data] : request.keyFile
})
