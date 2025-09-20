import { MailerService } from '@nestjs-modules/mailer';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailService } from 'src/modules_2/email/email.service';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);
  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: any) {
    const { to, subject, html } = job.data;
    this.logger.log(`Sending email to ${to}`);

    // switch (job.name) {
    //   case 'certificate':
    //     await this.emailService.sendCertificateEmail(to, subject, html);
    //     break;

    //   case 'trivia':
    //     await this.emailService.sendRegistrationEmail(to, subject, data);
    //     break;

    //   default:
    //     console.warn(`⚠️ Unknown email job: ${job.name}`);
    // }

    try {
      await this.emailService.sendEmail(to, subject, html);
      this.logger.log(`Email successfully sent to ${to}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`);
      throw error;
    }
  }

  async completed(job: any, result: any) {
    this.logger.log(`Email job ${job.id} completed successfully`);
  }

  // Optional: Handle job failure
  async failed(job: any, error: any) {
    this.logger.error(`Email job ${job.id} failed`, error.stack);
  }
}
