import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Readable } from 'stream'

@Injectable()
export class AmazonS3Service {
  private s3: S3Client
  private BUCKET_NAME: string
  private readonly logger = new Logger(AmazonS3Service.name)

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3Client({
      region: configService.getOrThrow('AWS_S3_REGION'),
      credentials: {
        accessKeyId: configService.getOrThrow('AWS_S3_ACCESS_KEY_ID'),
        secretAccessKey: configService.getOrThrow('AWS_S3_SECRET_ACCESS_KEY'),
      },
    })
    this.BUCKET_NAME = configService.getOrThrow('AWS_S3_BUCKET_NAME')
  }

  async uploadFile(file: Express.Multer.File, key: string) {
    try {
      const params = new PutObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })

      await this.s3.send(params)

      return true
    } catch (error) {
      this.logger.error(error.message)
      return false
    }
  }

  async getFileStream(key: string): Promise<{ stream: Readable; contentType: string }> {
    const command = new GetObjectCommand({
      Bucket: this.BUCKET_NAME,
      Key: key,
    })

    const response = await this.s3.send(command)

    return {
      stream: response.Body as Readable,
      contentType: response.ContentType || 'application/octet-stream',
    }
  }

  async update(file: Express.Multer.File, key: string) {
    try {
      const command = new PutObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })

      await this.s3.send(command)

      return true
    } catch (error) {
      this.logger.error(error.message)
      return false
    }
  }

  async deleteFile(key: string) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: key,
      })
      const response = await this.s3.send(command)
      return response
    } catch (error) {
      this.logger.error(error.message)
      return false
    }
  }
}
