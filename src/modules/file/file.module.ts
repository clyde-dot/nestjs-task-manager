import { Module } from '@nestjs/common'
import { FileService } from './file.service'
import { FileController } from './file.controller'
import { AmazonS3Module } from 'src/core/amazon-s3/amazon-s3.module'

@Module({
  imports: [AmazonS3Module],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
