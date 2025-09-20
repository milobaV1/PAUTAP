import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailerService,
  ) {}

  async sendEmail(to: string, subject: string, html: string) {
    // const appUrl = this.configService.get<string>('APP_URL');
    // const downloadLink = `${appUrl}/certificates/${certificateId}/download`;

    const from = this.configService.get<string>('MAIL_FROM');
    // send mail using your MailerService
    return await this.mailService.sendMail({
      from,
      to,
      subject,
      html,
    });
  }

  async sendTriviaCreationEmail(to: string, subject: string, html: string) {}
}
