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
import { CertificateListDto } from 'src/core/interfaces/certificate.interface';
import { CertificateSource } from 'src/core/enums/certificate.enum';
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
      return existingCert;
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
    });

    if (!progress || !progress.isCompleted()) {
      throw new BadRequestException(
        'Session not completed or progress not found',
      );
    }

    const roundedScore = Math.round(score);
    // 1. Create DB entry
    const cert = this.certRepo.create({
      userId,
      sessionId,
      filePath: '',
      score: roundedScore,
      certificateId,
    });

    const passingScore = 80;

    // 2. Generate PDF
    const pdfBuffer = await this.generatePdf({
      name: `${user?.first_name} ${user?.last_name}`,
      email: user.email,
      sessionTitle: session.title,
      sessionDescription: session.description,
      roleName: user.role.name,
      score,
      passingScore,
      completionDate: progress.completedAt,
      issuedAt: new Date(),
      certificateId: cert.certificateId,
    });

    const filePath = await this.saveCertificateFile(
      cert.certificateId,
      pdfBuffer,
    );
    cert.filePath = filePath;

    // 10. Save certificate to database
    const savedCert = await this.certRepo.save(cert);

    // 11. Log certificate issuance for audit
    // console.log(
    //   `Certificate ${certificateId} issued to user ${userId} for session ${sessionId} with score ${score}`,
    // );

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
    completionDate: Date | null;
    issuedAt: Date;
    certificateId: string;
  }): Promise<Buffer> {
    const template = `
    <html>
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
        width: 750px; 
        min-height: 750px; 
        margin: 20px auto;
        padding: 40px 50px;
        background: #fff;
        border: 10px solid #2e3f6f;
        position: relative;
        box-sizing: border-box;
      }
      .header {
        text-align: center;
        margin-bottom: 40px;
      }
      .header h1 {
        font-size: 36px;
        margin: 0;
        font-weight: bold;
      }
      .header p {
        font-size: 16px;
        margin-top: 8px;
        color: #555;
      }
      .recipient {
        text-align: center;
        margin: 40px 0;
      }
      .recipient h2 {
        font-size: 32px;
        margin: 0;
        font-weight: bold;
        border-bottom: 3px solid #2e3f6f;
        display: inline-block;
        padding-bottom: 6px;
      }
      .recipient .role-info {
        font-size: 14px;
        color: #666;
        margin-top: 8px;
      }
      .session {
        text-align: center;
        margin: 30px 0;
      }
      .session h3 {
        font-size: 24px;
        margin: 0;
      }
      .session .difficulty {
        font-size: 14px;
        color: #666;
        margin-top: 8px;
        text-transform: uppercase;
        font-weight: bold;
      }
      .score-section {
        text-align: center;
        margin: 30px auto;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        width: 80%;
      }
      .final-score {
        font-size: 20px;
        font-weight: bold;
        color: #28a745;
      }
      .details {
        display: flex;
        justify-content: space-between;
        margin-top: 50px;
        font-size: 13px;
        color: #444;
      }
      .details div {
        text-align: center;
        flex: 1;
      }
      .footer {
        text-align: center;
        margin-top: 60px;
        font-size: 11px;
        color: #777;
        border-top: 1px solid #ccc;
        padding-top: 12px;
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
        <div class="role-info">${data.roleName}</div>
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
          <p>${data.completionDate?.toDateString()}</p>
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

  async findOneCertificate(id: string): Promise<Certificate | null> {
    return this.certRepo.findOne({
      where: { id },
    });
  }

  // async getUserCertificatesWithDetails(
  //   userId: string,
  // ): Promise<CertificateListDto[]> {
  //   // Get certificates for a specific user
  //   const certificates = await this.certRepo
  //     .createQueryBuilder('certificate')
  //     .leftJoinAndSelect('certificate.session', 'session')
  //     .where('certificate.userId = :userId', { userId })
  //     .select([
  //       'certificate.id',
  //       'certificate.certificateId',
  //       'certificate.score',
  //       'certificate.createdAt',
  //       'session.title',
  //       'session.description',
  //       'session.createdAt',
  //     ])
  //     .getMany();

  //   // Calculate average score for this user
  //   const avgResult = await this.certRepo
  //     .createQueryBuilder('certificate')
  //     .select('AVG(certificate.score)', 'averageScore')
  //     .where('certificate.userId = :userId', { userId })
  //     .getRawOne();

  //   const averageScore = parseFloat(avgResult.averageScore) || 0;

  //   return certificates.map((cert) => ({
  //     id: cert.id,
  //     certificateId: cert.certificateId,
  //     sessionName: cert.session?.title || 'Unknown Session',
  //     sessionDescription: cert.session?.description || '',
  //     sessionCreatedAt: cert.session?.createdAt || cert.createdAt,
  //     score: cert.score,
  //     createdAt: cert.createdAt,
  //     averageScore: Number(averageScore.toFixed(2)),
  //   }));
  // }

  async getUserCertificatesWithDetails(
    userId: string,
    source?: CertificateSource,
  ): Promise<CertificateListDto[]> {
    let query = this.certRepo
      .createQueryBuilder('certificate')
      .leftJoinAndSelect('certificate.session', 'session')
      .where('certificate.userId = :userId', { userId });

    if (source) {
      query = query.andWhere('certificate.source = :source', { source });
    }

    const certificates = await query
      .select([
        'certificate.id',
        'certificate.certificateId',
        'certificate.score',
        'certificate.createdAt',
        'certificate.source',
        'certificate.title',
        'certificate.issuedBy',
        'certificate.issuedDate',
        'session.title',
        'session.description',
        'session.createdAt',
      ])
      .orderBy('certificate.createdAt', 'DESC')
      .getMany();

    // Calculate average score for internal certificates only
    const avgResult = await this.certRepo
      .createQueryBuilder('certificate')
      .select('AVG(certificate.score)', 'averageScore')
      .where('certificate.userId = :userId', { userId })
      .andWhere('certificate.source = :source', {
        source: CertificateSource.INTERNAL,
      })
      .getRawOne();

    const averageScore = parseFloat(avgResult?.averageScore || 0) || 0;

    return certificates.map((cert) => ({
      id: cert.id,
      certificateId: cert.certificateId,
      source: cert.source,
      sessionName: cert.session?.title || cert.title || 'Unknown',
      sessionDescription: cert.session?.description || '',
      sessionCreatedAt:
        cert.session?.createdAt || cert.issuedDate || cert.createdAt,
      score: cert.score,
      createdAt: cert.createdAt,
      issuedBy: cert.issuedBy,
      issuedDate: cert.issuedDate,
      averageScore:
        cert.source === CertificateSource.INTERNAL
          ? Number(averageScore.toFixed(2))
          : null,
    }));
  }

  async uploadExternalCertificate(
    userId: string,
    file: Express.Multer.File,
    dto: CreateCertificateDto,
  ): Promise<Certificate> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const certificateId = `EXT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Save the uploaded file
    const filePath = await this.saveUploadedCertificateFile(
      certificateId,
      file.buffer,
    );

    const cert = new Certificate();
    cert.certificateId = certificateId;
    cert.userId = userId;
    cert.sessionId = null;
    cert.filePath = filePath;
    cert.source = CertificateSource.EXTERNAL;
    cert.score = null;
    cert.title = dto.title;
    cert.issuedBy = dto.issuedBy || '';
    if (dto.issuedDate) {
      cert.issuedDate = new Date(dto.issuedDate);
    }

    const savedCert = await this.certRepo.save(cert);

    // console.log(
    //   `External certificate ${certificateId} uploaded for user ${userId}`,
    // );

    return savedCert;
  }

  private async saveUploadedCertificateFile(
    certificateId: string,
    fileBuffer: Buffer,
  ): Promise<string> {
    const certDir = path.join(
      process.cwd(),
      'uploads',
      'certificates',
      'external',
    );
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
    }

    // Preserve original file extension
    const ext = '.pdf'; // or detect from MIME type
    const filePath = path.join(certDir, `${certificateId}${ext}`);
    fs.writeFileSync(filePath, fileBuffer);

    return filePath;
  }
}
