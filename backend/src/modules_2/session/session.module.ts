import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { SessionRoleCategoryQuestion } from './entities/session-role-category-questions.entity';
import { UserAnswer } from './entities/user-answers.entity';
import { UserSessionProgress } from './entities/user-session-progress.entity';
import { QuestionUsage } from '../question-bank/entities/question-usage.entity';
import { Certificate } from '../certificate/entities/certificate.entity';
import { QuestionBank } from '../question-bank/entities/question-bank.entity';
import { Role } from '../users/entities/role.entity';
import { CertificateModule } from '../certificate/certificate.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Session,
      SessionRoleCategoryQuestion,
      UserAnswer,
      UserSessionProgress,
      QuestionUsage,
      Certificate,
      QuestionBank,
      Role,
    ]),
    CertificateModule,
  ],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule {}
