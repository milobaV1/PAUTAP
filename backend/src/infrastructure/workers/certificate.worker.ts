import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { CertificateService } from 'src/modules_2/certificate/certificate.service';

@Processor('certificate')
export class CertificateProcessor extends WorkerHost {
  private readonly logger = new Logger(CertificateProcessor.name);

  constructor(private readonly certificateService: CertificateService) {
    super();
  }

  async process(job: any) {
    const { certificateId, userId, sessionId, roleId, score, completionData } =
      job.data;

    this.logger.log(
      `Processing certificate generation for user ${userId}, session ${sessionId}, score: ${score}%`,
    );

    try {
      const cert = await this.certificateService.issueCertificate(
        certificateId,
        userId,
        sessionId,
        roleId,
        score,
        completionData, // Pass the additional completion data
      );

      this.logger.log(
        `Certificate ${cert.certificateId} successfully generated for user ${userId}`,
      );

      // Return data that can be used by the calling service
      return {
        success: true,
        certificateId: cert.certificateId,
        filePath: cert.filePath,
        score: cert.score,
        // passingScore: cert.passingScore,
        // isValid: cert.isCurrentlyValid(),
        validUntil: cert.validUntil,
        downloadUrl: `/certificates/download/${cert.certificateId}`,
        verifyUrl: `/certificates/verify/${cert.certificateId}`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate certificate for user ${userId}, session ${sessionId}: ${error.message}`,
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
