import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { Certificate } from './entities/certificate.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Session } from '../session/entities/session.entity';
import { CompletionMetrics } from 'src/core/interfaces/session.interface';
import { UserSessionProgress } from '../session/entities/user-session-progress.entity';
import puppeteer from 'puppeteer';
@Injectable()
export class CertificateService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certRepo: Repository<Certificate>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    @InjectRepository(UserSessionProgress)
    private readonly progressRepo: Repository<UserSessionProgress>,
  ) {}

  async issueCertificate(
    certificateId: string,
    userId: string,
    sessionId: string,
    roleId: number,
    score: number,
    completionData: CompletionMetrics,
  ): Promise<Certificate> {
    const existingCert = await this.certRepo.findOne({
      where: { userId, sessionId },
    });

    if (existingCert) {
      throw new BadRequestException(
        'Certificate already issued for this user and session',
      );
    }

    // 3. Get user and session data with relations
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['role', 'role.department'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // 4. Get completion progress for detailed breakdown
    const progress = await this.progressRepo.findOne({
      where: { userId, sessionId },
      relations: ['role'],
    });

    if (!progress || !progress.isCompleted()) {
      throw new BadRequestException(
        'Session not completed or progress not found',
      );
    }
    // 1. Create DB entry
    const cert = this.certRepo.create({
      userId,
      sessionId,
      filePath: '',
      score,
      certificateId,
    });

    const passingScore = 80;

    // 2. Generate PDF
    const pdfBuffer = await this.generatePdf({
      name: `${user?.first_name} ${user?.last_name}`,
      email: user.email,
      sessionTitle: session.title,
      sessionDescription: session.description,
      roleName: progress.role.name,
      score,
      passingScore,
      completionDate: progress.completedAt,
      issuedAt: new Date(),
      certificateId: cert.certificateId,
    });

    // 3. Save file
    // const certDir = path.join(__dirname, '../../../uploads/certificates');
    // if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });
    // const filePath = path.join(certDir, `${cert.certificateId}.pdf`);
    // fs.writeFileSync(filePath, pdfBuffer);

    // cert.filePath = filePath;
    // return this.certRepo.save({
    //   ...cert,
    //   filePath,
    // });

    const filePath = await this.saveCertificateFile(
      cert.certificateId,
      pdfBuffer,
    );
    cert.filePath = filePath;

    // 10. Save certificate to database
    const savedCert = await this.certRepo.save(cert);

    // 11. Log certificate issuance for audit
    console.log(
      `Certificate ${certificateId} issued to user ${userId} for session ${sessionId} with score ${score}`,
    );

    return savedCert;
  }

  async generatePdf(data: {
    name: string;
    email: string;
    sessionTitle: string;
    sessionDescription?: string;
    roleName: string;
    score: number;
    passingScore: number;
    completionDate: Date;
    issuedAt: Date;
    certificateId: string;
  }): Promise<Buffer> {
    //     const template = `
    // <html>
    //   <head>
    //     <style>
    //       body {
    //         font-family: 'Arial', sans-serif;
    //         margin: 0;
    //         padding: 0;
    //         background: #f9fafb;
    //         color: #2e3f6f;
    //       }
    //       .certificate {
    //         width: 1000px;
    //         margin: 40px auto;
    //         padding: 60px;
    //         background: #fff;
    //         border: 12px solid #2e3f6f;
    //         position: relative;
    //       }
    //       .header {
    //         text-align: center;
    //         margin-bottom: 40px;
    //       }
    //       .header h1 {
    //         font-size: 40px;
    //         margin: 0;
    //         font-weight: bold;
    //       }
    //       .header p {
    //         font-size: 18px;
    //         margin-top: 10px;
    //         color: #555;
    //       }
    //       .recipient {
    //         text-align: center;
    //         margin: 50px 0;
    //       }
    //       .recipient h2 {
    //         font-size: 36px;
    //         margin: 0;
    //         font-weight: bold;
    //         border-bottom: 3px solid #2e3f6f;
    //         display: inline-block;
    //         padding-bottom: 8px;
    //       }
    //       .session {
    //         text-align: center;
    //         margin: 40px 0;
    //       }
    //       .session h3 {
    //         font-size: 28px;
    //         margin: 0;
    //       }
    //       .details {
    //         display: flex;
    //         justify-content: space-between;
    //         margin-top: 60px;
    //         font-size: 14px;
    //         color: #444;
    //       }
    //       .details div {
    //         text-align: center;
    //         flex: 1;
    //       }
    //       .footer {
    //         text-align: center;
    //         margin-top: 60px;
    //         font-size: 12px;
    //         color: #777;
    //         border-top: 1px solid #ccc;
    //         padding-top: 15px;
    //       }
    //     </style>
    //   </head>
    //   <body>
    //     <div class="certificate">
    //       <div class="header">
    //         <h1>Certificate of Completion</h1>
    //         <p>This certifies that</p>
    //       </div>

    //       <div class="recipient">
    //         <h2>${data.name}</h2>
    //       </div>

    //       <div class="session">
    //         <p>has successfully completed</p>
    //         <h3>${data.sessionTitle}</h3>
    //       </div>

    //       <div class="details">
    //         <div>
    //           <p><strong>Date of Issue</strong></p>
    //           <p>${data.issuedAt.toDateString()}</p>
    //         </div>
    //         <div>
    //           <p><strong>Certificate ID</strong></p>
    //           <p>${data.certificateId}</p>
    //         </div>
    //       </div>

    //       <div class="footer">
    //         This certificate can be verified at pau.edu.ng/verify using the Certificate ID above.
    //       </div>
    //     </div>
    //   </body>
    // </html>
    // `;

    // const template = `
    //   <html>
    //     <head>
    //       <style>
    //         body { text-align: center; font-family: Arial; padding: 50px; }
    //         .title { font-size: 32px; font-weight: bold; }
    //         .subtitle { font-size: 20px; margin-top: 20px; }
    //         .id { margin-top: 30px; font-size: 12px; color: gray; }
    //       </style>
    //     </head>
    //     <body>
    //       <div class="title">Certificate of Completion</div>
    //       <div class="subtitle">This is to certify that</div>
    //       <h1>${data.name}</h1>
    //       <div class="subtitle">has successfully completed the training session</div>
    //       <h2>${data.sessionId}</h2>
    //       <p>Issued on ${data.issuedAt.toDateString()}</p>
    //       <div class="id">Certificate ID: ${data.certificateId}</div>
    //     </body>
    //   </html>
    // `;
    const template = `<html>
  <head>
    <style>
      body {
        font-family: "Arial", sans-serif;
        margin: 0;
        padding: 0;
        background: #f9fafb;
        color: #2e3f6f;
      }
      .certificate {
        width: 1000px;
        margin: 40px auto;
        padding: 60px;
        background: #fff;
        border: 12px solid #2e3f6f;
        position: relative;
      }
      .header {
        text-align: center;
        margin-bottom: 40px;
      }
      .header h1 {
        font-size: 40px;
        margin: 0;
        font-weight: bold;
      }
      .header p {
        font-size: 18px;
        margin-top: 10px;
        color: #555;
      }
      .recipient {
        text-align: center;
        margin: 50px 0;
      }
      .recipient h2 {
        font-size: 36px;
        margin: 0;
        font-weight: bold;
        border-bottom: 3px solid #2e3f6f;
        display: inline-block;
        padding-bottom: 8px;
      }
      .recipient .role-info {
        font-size: 16px;
        color: #666;
        margin-top: 10px;
      }
      .session {
        text-align: center;
        margin: 40px 0;
      }
      .session h3 {
        font-size: 28px;
        margin: 0;
      }
      .session .difficulty {
        font-size: 16px;
        color: #666;
        margin-top: 10px;
        text-transform: uppercase;
        font-weight: bold;
      }
      .score-section {
        text-align: center;
        margin: 30px 0;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 10px;
      }
      .final-score {
        font-size: 24px;
        font-weight: bold;
        color: "#28a745";
      }
      .category-breakdown {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 10px;
        margin-top: 15px;
      }
      .category-score {
        display: flex;
        justify-content: space-between;
        padding: 5px 10px;
        background: white;
        border-radius: 5px;
        font-size: 14px;
      }
      .details {
        display: flex;
        justify-content: space-between;
        margin-top: 60px;
        font-size: 14px;
        color: #444;
      }
      .details div {
        text-align: center;
        flex: 1;
      }
      .footer {
        text-align: center;
        margin-top: 60px;
        font-size: 12px;
        color: #777;
        border-top: 1px solid #ccc;
        padding-top: 15px;
      }
      .validity-notice {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        padding: 10px;
        border-radius: 5px;
        margin-top: 20px;
        text-align: center;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="certificate">
      <div class="header">
        <h1>Certificate of Completion</h1>
        <p>This certifies that</p>
      </div>

      <div class="recipient">
        <h2>${data.name}</h2>
        <div class="role-info">
          ${data.roleName}
        </div>
      </div>

      <div class="session">
        <p>has successfully completed</p>
        <h3>${data.sessionTitle}</h3>
      </div>

      <div class="score-section">
        <div class="final-score">
          Final Score: ${data.score}% (Required: ${data.passingScore}%)
        </div>
      </div>

      <div class="details">
        <div>
          <p><strong>Completion Date</strong></p>
          <p>${data.completionDate.toDateString()}</p>
        </div>
        <div>
          <p><strong>Certificate ID</strong></p>
          <p>${data.certificateId}</p>
        </div>
        <div>
          <p><strong>Issue Date</strong></p>
          <p>${data.issuedAt.toDateString()}</p>
        </div>
      </div>
      }

      <div class="footer">
        This certificate can be verified at pau.edu.ng/verify using the
        Certificate ID above.
      </div>
    </div>
  </body>
</html>
`;

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });
    const page = await browser.newPage();
    await page.setContent(template);
    const buffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm',
      },
    });
    await browser.close();

    return Buffer.from(buffer);
  }

  private async saveCertificateFile(
    certificateId: string,
    pdfBuffer: Buffer,
  ): Promise<string> {
    const certDir = path.join(process.cwd(), 'uploads', 'certificates');
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
    }

    const filePath = path.join(certDir, `${certificateId}.pdf`);
    fs.writeFileSync(filePath, pdfBuffer);

    return filePath;
  }

  async downloadCertificate(id: string): Promise<Buffer> {
    const cert = await this.certRepo.findOne({
      where: { id },
      relations: ['user', 'session'],
    });
    if (!cert) throw new NotFoundException('Certificate not found');
    return fs.readFileSync(cert.filePath);
  }

  async verifyCertificate(id: string): Promise<{
    certificate: Certificate;
    validationDetails: any;
  }> {
    const cert = await this.certRepo.findOne({
      where: { id },
      relations: ['user', 'session'],
    });

    if (!cert) throw new NotFoundException('Invalid certificate');

    const validationDetails = {
      issued: cert.createdAt,
      validUntil: cert.validUntil,
      score: cert.score,
      userName: `${cert.user.first_name} ${cert.user.last_name}`,
      sessionTitle: cert.session.title,
    };

    return { certificate: cert, validationDetails };
  }

  async getUserCertificates(userId: string): Promise<Certificate[]> {
    return this.certRepo.find({
      where: { userId },
      relations: ['session'],
      order: { createdAt: 'DESC' },
    });
  }

  // async revokeCertificate(
  //   certificateId: string,
  //   reason?: string,
  // ): Promise<Certificate> {
  //   const cert = await this.certRepo.findOne({ where: { certificateId } });
  //   if (!cert) throw new NotFoundException('Certificate not found');

  //   cert.isValid = false;
  //   cert.notes = reason || 'Certificate revoked';

  //   return this.certRepo.save(cert);
  // }
}
