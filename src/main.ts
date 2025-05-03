import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ValidationPipe } from '@nestjs/common'
import * as cookieParser from 'cookie-parser'
import { AllExceptionFilter } from './http-exception.filter'

async function start() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)
  const PORT = configService.getOrThrow('PORT')
  const { httpAdapter } = app.get(HttpAdapterHost)

  //app.useGlobalFilters(new AllExceptionFilter(httpAdapter))
  app.setGlobalPrefix('api')
  app.enableCors({
    withCredentials: true,
  })
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  app.use(cookieParser())

  await app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
}
start()
