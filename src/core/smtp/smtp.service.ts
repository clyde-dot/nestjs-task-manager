import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { join } from 'path'

@Injectable()
export class SmtpService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.APP_NAME = configService.getOrThrow('APP_NAME')
    this.FRONT_URL = configService.getOrThrow('FRONT_URL')
  }

  private APP_NAME: string
  private FRONT_URL: string

  async sendVerificationEmail(to: string, token: string) {
    try {
      const sendedMessage = await this.mailerService.sendMail({
        to,
        subject: 'Подтверждение почты',
        template: 'email-verify',
        context: {
          appName: this.APP_NAME,
          link: `${this.FRONT_URL}/api/auth/verify/${token}`,
        },
      })

      console.log('Verified email sent to:', to)
      return sendedMessage
    } catch (err) {
      console.error('Email sending error:', err.message)
      return null
    }
  }
}
