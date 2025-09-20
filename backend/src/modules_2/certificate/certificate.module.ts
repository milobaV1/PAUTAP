import { Module } from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { CertificateController } from './certificate.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Session } from '../session/entities/session.entity';
import { UserSessionProgress } from '../session/entities/user-session-progress.entity';
import { CertificateProcessor } from 'src/infrastructure/workers/certificate.worker';
import { BullModule } from '@nestjs/bullmq';
import { Certificate } from './entities/certificate.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Certificate, User, UserSessionProgress, Session]),
    BullModule.registerQueue({ name: 'certificate' }),
    EmailModule,
  ],
  controllers: [CertificateController],
  providers: [CertificateService, CertificateProcessor],
  exports: [CertificateService, BullModule],
})
export class CertificateModule {}
