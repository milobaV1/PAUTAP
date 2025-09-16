// workers/email.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  async process(job: Job<any>) {
    const { recipient, subject, body } = job.data;

    // Integrate with Nodemailer, Resend, or AWS SES
    console.log(`📧 Sending email to ${recipient} with subject: ${subject}`);
    // await this.emailService.send(recipient, subject, body);

    return { success: true };
  }
}
