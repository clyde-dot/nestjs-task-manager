import { BadRequestException, Injectable, Query } from '@nestjs/common'
import { File } from '@prisma/client'
import { AmazonS3Service } from 'src/core/amazon-s3/amazon-s3.service'
import { PrismaService } from 'src/core/prisma/prisma.service'
import { Readable } from 'stream'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class FileService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly amazonS3Service: AmazonS3Service,
  ) {}

  async create({ fileName, size, mimeType, key }: { fileName: string; size: number; mimeType: string; key: string }): Promise<File> {
    return await this.prismaService.file.create({
      data: {
        fileName,
        size,
        mimeType,
        key,
      },
    })
  }

  async update(key: string, file: { fileName: string; size: number; mimeType: string; key: string }): Promise<File> {
    return await this.prismaService.file.update({
      where: {
        key,
      },
      data: {
        fileName: file.fileName,
        size: file.size,
        mimeType: file.mimeType,
        key: file.key,
      },
    })
  }

  async findAll(): Promise<File[]> {
    return await this.prismaService.file.findMany()
  }

  async findByKey(key: string): Promise<File | null> {
    return await this.prismaService.file.findFirst({
      where: {
        key,
      },
    })
  }

  async delete(key: string) {
    return await this.prismaService.file.delete({
      where: {
        key,
      },
    })
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const key = uuidv4()
    const uploadedFile = await this.amazonS3Service.uploadFile(file, key)
    if (!uploadedFile) {
      throw new BadRequestException(`Файл ${file.originalname} не удалось загрузить`)
    }
    await this.create({ fileName: file.originalname, size: file.size, mimeType: file.mimetype, key })
    return key
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<void> {
    for (const file of files) {
      const key = uuidv4()
      const uploadedFile = await this.amazonS3Service.uploadFile(file, key)
      if (!uploadedFile) {
        throw new BadRequestException(`Файл ${file.originalname} не удалось загрузить`)
      }
      await this.create({ fileName: file.originalname, size: file.size, mimeType: file.mimetype, key })
    }
  }

  async getImage(file: File): Promise<{ stream: Readable; contentType: string }> {
    const fileObject = await this.amazonS3Service.getFileStream(file.key)
    return fileObject
  }

  async updateFile(file: Express.Multer.File, key: string): Promise<void> {
    const updatedFile = await this.amazonS3Service.update(file, key)
    if (!updatedFile) {
      throw new BadRequestException('Не удалось обновить файл')
    }
    await this.update(key, { fileName: file.originalname, size: file.size, mimeType: file.mimetype, key })
  }

  async deleteFile(key: string): Promise<void> {
    await this.amazonS3Service.deleteFile(key)
    await this.delete(key)
  }
}
