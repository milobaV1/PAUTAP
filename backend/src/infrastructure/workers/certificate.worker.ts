import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { CertificateService } from 'src/modules_2/certificate/certificate.service';

@Processor('certificate')
export class CertificateProcessor extends WorkerHost {
  private readonly logger = new Logger(CertificateProcessor.name);

  constructor(
    private readonly certificateService: CertificateService,
    private readonly configService: ConfigService,
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {
    super();
  }

  async process(job: any) {
    const { certificateId, user, sessionId, roleId, score, completionData } =
      job.data;

    this.logger.log(
      `Processing certificate generation for user ${user.id}, session ${sessionId}, score: ${score}%`,
    );

    try {
      const cert = await this.certificateService.issueCertificate(
        certificateId,
        user.id,
        sessionId,
        roleId,
        score,
        completionData, // Pass the additional completion data
      );

      this.logger.log(
        `Certificate ${cert.certificateId} successfully generated for user ${user.id}`,
      );
      const appUrl = this.configService.get<string>('APP_URL');
      const downloadUrl: string = `${appUrl}/certificate`;
      const verifyUrl: string = `${appUrl}/certificates/verify/${cert.id}`;

      // await this.emailQueue.add(
      //   'certificate',
      //   {
      //     to: user.email,
      //     subject: 'Your Training Certificate',
      //     html: `
      //   <p>Hi ${user.first_name},</p>
      //   <p>Congratulations on completing <b>${sessionId}</b>! 🎉</p>
      //   <p>You can download your certificate here:</p>
      //   <p><a href="${downloadUrl}">Download Certificate</a></p>
      //   <p>Certificate ID: ${cert.certificateId}</p>
      // `,
      //   },
      //   {
      //     // Queue options
      //     attempts: 3, // Retry up to 3 times on failure
      //     backoff: {
      //       type: 'exponential',
      //       delay: 5000, // Start with 5 second delay
      //     },
      //     removeOnComplete: 10, // Keep only 10 completed jobs
      //     removeOnFail: 5, // Keep only 5 failed jobs for debugging
      //   },
      // );

      // Return data that can be used by the calling service
      await this.emailQueue.add(
        'certificate',
        {
          to: user.email,
          subject: '🎓 Your Training Certificate is Ready!',
          html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f9fafb;
              color: #2e3f6f;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background: #ffffff;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            }
            h1 {
              font-size: 22px;
              margin-bottom: 20px;
              text-align: center;
              color: #2e3f6f;
            }
            p {
              font-size: 16px;
              line-height: 1.5;
              color: #444;
            }
            .button {
              display: inline-block;
              padding: 12px 20px;
              margin: 20px auto;
              background-color: #2e3f6f;
              color: #ffffff !important;
              text-decoration: none;
              font-weight: bold;
              border-radius: 6px;
            }
            .certificate-info {
              margin-top: 20px;
              padding: 15px;
              background: #f8f9fa;
              border-radius: 6px;
              font-size: 14px;
              text-align: center;
              color: #555;
            }
            .footer {
              margin-top: 30px;
              font-size: 12px;
              color: #777;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🎉 Congratulations, ${user.first_name}!</h1>
            <p>
              You have successfully completed <b>${sessionId}</b>. We’re excited to recognize your achievement with this official certificate.
            </p>
            <p style="text-align: center;">
              <a href="${downloadUrl}" class="button">View Your Certificate</a>
            </p>
            <div class="certificate-info">
              <p><strong>Certificate ID:</strong> ${cert.certificateId}</p>
            </div>
            <div class="footer">
              <p>You’re receiving this email because you use the PAU Training Application.</p>
            </div>
          </div>
        </body>
      </html>
    `,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: 10,
          removeOnFail: 5,
        },
      );

      return {
        success: true,
        certificateId: cert.certificateId,
        filePath: cert.filePath,
        score: cert.score,
        // passingScore: cert.passingScore,
        // isValid: cert.isCurrentlyValid(),
        validUntil: cert.validUntil,
        downloadUrl,
        verifyUrl,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate certificate for user ${user.id}, session ${sessionId}: ${error.message}`,
        error.stack,
      );

      // Re-throw the error so BullMQ can handle retry logic
      throw error;
    }
  }

  // Optional: Handle job completion
  async completed(job: any, result: any) {
    this.logger.log(
      `Certificate job ${job.id} completed successfully. Certificate ID: ${result.certificateId}`,
    );
  }

  // Optional: Handle job failure
  async failed(job: any, error: any) {
    this.logger.error(
      `Certificate job ${job.id} failed: ${error.message}`,
      error.stack,
    );

    // Could implement notification logic here
    // e.g., send email to admin about failed certificate generation
  }
}
