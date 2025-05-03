import { Injectable } from '@nestjs/common'
import { compareSync, hashSync } from 'bcrypt'

@Injectable()
export class EncryptService {
  compareData(data: string, hashedData: string): boolean {
    return compareSync(data, hashedData)
  }

  hashData(data: string): string {
    return hashSync(data, 10)
  }
}
